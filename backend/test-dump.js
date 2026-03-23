import { db } from "./src/config/db.js";
import { usersTable } from "./src/db/schema.js";
import { isNotNull } from "drizzle-orm";
import { decrypt } from "./src/utils/encryption.js";

async function run() {
  const users = await db.select().from(usersTable).where(isNotNull(usersTable.jiraApiToken));
  if (users.length === 0) return;
  const user = users[0];
  
  const token = decrypt(user.jiraApiToken);
  const cleanDomain = user.jiraDomain.replace(/^https?:\/\//, '').split('/')[0];
  
  const jql = encodeURIComponent('assignee = currentUser() AND statusCategory != Done ORDER BY updated DESC');
  // Add &fields=*all or specific fields
  const url = `https://${cleanDomain}/rest/api/3/search/jql?jql=${jql}&maxResults=5&fields=summary,priority,duedate,description`;
  
  console.log("Fetching:", url);
  const authHeader = `Basic ${Buffer.from(`${user.jiraEmail}:${token}`).toString('base64')}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': authHeader,
      'Accept': 'application/json'
    }
  });

  const text = await response.text();
  console.log("STATUS:", response.status);
  console.log("BODY:", text.substring(0, 1000));
  process.exit(0);
}
run();
