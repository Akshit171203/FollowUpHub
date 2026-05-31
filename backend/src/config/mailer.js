import { google } from "googleapis";
import MailComposer from "nodemailer/lib/mail-composer/index.js";

const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN,
});

const gmail = google.gmail({ version: "v1", auth: oauth2Client });

export const sendEmail = async ({ to, subject, html }) => {
  try {
    // 1. Build the raw email message using Nodemailer's MailComposer
    const mailOptions = {
      from: `"FollowUpHub" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      textEncoding: "base64",
    };

    const mail = new MailComposer(mailOptions);
    const messageBuffer = await mail.compile().build();

    // 2. Encode the message to base64url format required by Gmail API
    const encodedMessage = Buffer.from(messageBuffer)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    // 3. Send the email using the official Gmail HTTP API
    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
      },
    });

    console.log("✅ Email sent via Gmail API to:", to, "MessageID:", res.data.id);
  } catch (error) {
    console.error("❌ Gmail API email send failed:", error.message);
    // Don't crash the server if email fails, but log it
  }
};
