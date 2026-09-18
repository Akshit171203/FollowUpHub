import { GoogleGenAI } from "@google/genai";

let client = null;

function getClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
}

// Drafts a follow-up message for the given target/title/notes/priority.
// Throws on failure; callers are expected to handle and surface the error.
export async function generateFollowUpDraft({ target, title, notes, priority }) {
  const prompt = `You are a professional assistant. Draft a polite but firm follow-up message to ${target || "the recipient"} regarding "${title}". Context: ${notes || "No additional context provided."}. Priority: ${priority || "MEDIUM"}. Keep it under 100 words. Return ONLY the message content.`;

  const response = await getClient().models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
  });

  const draft = response.text?.trim();
  if (!draft) {
    throw new Error("Gemini returned an empty draft");
  }

  return draft;
}
