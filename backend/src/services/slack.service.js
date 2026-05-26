// Removed node-fetch import, using native Node.js fetch
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