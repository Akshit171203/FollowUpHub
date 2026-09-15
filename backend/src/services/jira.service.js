import { db } from "../config/db.js";
import { followups, usersTable, jiraSyncLogs } from "../db/schema.js";
import { eq, and, inArray, isNotNull } from "drizzle-orm";
import { decrypt } from "../utils/encryption.js";
import { logEvent } from "../modules/events/event.service.js";

/**
 * Fetch assigned, incomplete tickets for a user from Jira
 * It uses Atlassian as an upstream data source to automatically sync a user's Jira tickets into my database.
 */
async function fetchUserTickets(domain, email, apiToken) {
  const cleanDomain = domain.replace(/^https?:\/\//, '').split('/')[0];
  const jql = encodeURIComponent('assignee = currentUser() AND statusCategory != Done ORDER BY updated DESC');
  const url = `https://${cleanDomain}/rest/api/3/search/jql?jql=${jql}&maxResults=50&fields=summary,priority,duedate,description`;
  
  const authHeader = `Basic ${Buffer.from(`${email}:${apiToken}`).toString('base64')}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': authHeader,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Jira API Error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  return data.issues || [];
}

/**
 * Extract text from Jira ADF (Atlassian Document Format) description
 * custom parser to strip out the ADF blocks and extract plain text
 */
function extractJiraDescription(descriptionField) {
  if (!descriptionField || !descriptionField.content) return '';
  try {
    return descriptionField.content.map(block => {
      if (block.type === 'paragraph' && block.content) {
        return block.content.map(textNode => textNode.text || '').join('');
      }
      return '';
    }).filter(Boolean).join('\n');
  } catch(e) {
    return 'See Jira for details.';
  }
}

/**
 * Map Jira Ticket to Followup schema
 */
function mapJiraToFollowup(issue, domain) {
  const fields = issue.fields || {};
  
  // priority mapping -> Jira: Highest, High, Medium, Low, Lowest
  let mappedPriority = "MEDIUM";
  const jPrio = fields.priority?.name?.toLowerCase() || '';
  if (jPrio.includes('highest')) mappedPriority = "URGENT";
  else if (jPrio.includes('high')) mappedPriority = "HIGH";
  else if (jPrio.includes('low')) mappedPriority = "LOW";
  
  // due date
  let due = fields.duedate;
  if (!due) {
    // defaults to tomorrow if none specified
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    due = tomorrow;
  } else {
    due = new Date(due);
  }
  
  return {
    externalId: issue.id,
    issueKey: issue.key,
    title: `[${issue.key}] ${fields.summary || 'Untitled Jira Task'}`,
    notes: extractJiraDescription(fields.description),
    dueAt: due,
    priority: mappedPriority,
    externalUrl: `https://${domain}/browse/${issue.key}`
  };
}

/**
 * Sync tickets for a specific user
 * user completes a ticket in Jira, Jira just stops returning it in the API. To handle this, I keep track of all the tickets Jira returned today
 */
export async function syncUserJiraTickets(user) {
  try {
    if (!user.jiraDomain || !user.jiraEmail || !user.jiraApiToken) {
      throw new Error("Missing Jira configuration");
    }

    const decryptedToken = decrypt(user.jiraApiToken);
    if (!decryptedToken) throw new Error("Could not decrypt token");

    const issues = await fetchUserTickets(user.jiraDomain, user.jiraEmail, decryptedToken);
    
    // Existing active JIRA followups for the user
    const existingDbTickets = await db
      .select()
      .from(followups)
      .where(
        and(
          eq(followups.userId, user.id),
          eq(followups.externalSource, 'JIRA'),
          eq(followups.isActive, true)
        )
      );

    const existingMap = new Map(existingDbTickets.map(t => [t.externalId, t]));
    
    let syncedCount = 0;
    const fetchedIssueIds = new Set();

    // Process fetched tickets (Insert/Update)
    for (const issue of issues) {
      const mapped = mapJiraToFollowup(issue, user.jiraDomain);
      fetchedIssueIds.add(mapped.externalId);

      const existing = existingMap.get(mapped.externalId);

      if (existing) {
        // Update if needed
        await db.update(followups)
          .set({
            title: mapped.title,
            dueAt: mapped.dueAt,
            priority: mapped.priority,
            updatedAt: new Date()
          })
          .where(eq(followups.id, existing.id));
      } else {
        // Insert new
        const inserted = await db.insert(followups).values({
          userId: user.id,
          title: mapped.title,
          notes: mapped.notes,
          dueAt: mapped.dueAt,
          priority: mapped.priority,
          reminderPolicy: "NORMAL",
          externalSource: "JIRA",
          externalId: mapped.externalId,
          externalUrl: mapped.externalUrl
        }).returning();

        await logEvent({
          followupId: inserted[0].id,
          userId: user.id,
          eventType: "CREATED",
          message: "Imported from Jira"
        });
      }
      syncedCount++;
    }

    // Handle Unassigned/Deleted/Completed tickets
    // Any existing DB ticket that wasn't fetched just now means it's closed in Jira or unassigned
    const activeIdsToClose = existingDbTickets
      .filter(t => !fetchedIssueIds.has(t.externalId))
      .map(t => t.id);

    if (activeIdsToClose.length > 0) {
      await db.update(followups)
        .set({
          status: "DONE",
          isActive: false,
          updatedAt: new Date(),
          completedAt: new Date()
        })
        .where(inArray(followups.id, activeIdsToClose));
        
      for(const closedId of activeIdsToClose) {
         await logEvent({ followupId: closedId, userId: user.id, eventType: "DONE", message: "Closed or removed in Jira" });
      }
    }

    // Log success
    await db.insert(jiraSyncLogs).values({
      userId: user.id,
      status: "SUCCESS",
      ticketsSynced: syncedCount
    });

    return { success: true, count: syncedCount };

  } catch (error) {
    console.error(`Jira Sync Error for User ${user.id}:`, error.message);
    
    await db.insert(jiraSyncLogs).values({
      userId: user.id,
      status: "FAILED",
      errorMessage: error.message
    });

    return { success: false, error: error.message };
  }
}

/**
 * Batch Processor- helps when i don't want to crash my server when i have 1000's of users. 
 * Orchestrator: fetches active Jira users in batches and syncs
 */
export async function syncAllJiraUsers() {
  const BATCH_SIZE = 50;
  let offset = 0;

  while(true) {
    const usersBatch = await db.select()
      .from(usersTable)
      .where(isNotNull(usersTable.jiraApiToken))
      .limit(BATCH_SIZE)
      .offset(offset);

    if (usersBatch.length === 0) break;

    for (const user of usersBatch) {
      await syncUserJiraTickets(user);
    }
    
    offset += BATCH_SIZE;
  }
}
