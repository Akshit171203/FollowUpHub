import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "FollowUpHub <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error("❌ Resend email error:", error);
      throw new Error(error.message);
    }

    console.log("✅ Email sent to:", to, "ID:", data?.id);
  } catch (error) {
    console.error("❌ Email send failed:", error.message);
    // Don't crash the server if email fails, but log it
  }
};
