// When a Jira ticket gets completely ignored by a user and reaches Escalation Level 2, 
// the reminder engine calls this sendSlackNotification() function as a "nuclear option" to alert the whole team in a public Slack channel.
export async function sendSlackNotification({ title, assignee, delay, link }) {
  try {
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: `🚨 *Jira Ticket Escalated*

*Task:* ${title}
*Assignee:* ${assignee}
*Delay:* ${delay}

<${link}|View in Jira>`
      })
    });
  } catch (err) {
    console.error("Slack notification failed:", err.message);
  }
}