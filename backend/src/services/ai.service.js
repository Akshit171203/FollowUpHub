import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-3.6-flash";
const TIMEOUT_MS = 15000;
const MAX_RETRIES = 2;
const MAX_NOTES_CHARS = 4000;
const MAX_QUICK_CREATE_CHARS = 2000;

export class AiServiceError extends Error {
  constructor(message, code) {
    super(message);
    this.name = "AiServiceError";
    this.code = code;
  }
}

let client = null;

function getClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new AiServiceError("GEMINI_API_KEY is not configured", "MISSING_KEY");
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
}

function truncate(text, maxChars) {
  if (!text || text.length <= maxChars) return text;
  return `${text.slice(0, maxChars)}... [truncated]`;
}

// Classifies an SDK/network error and retries transient ones with backoff.
async function callWithRetry(fn) {
  let lastErr;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      return await fn(controller.signal);
    } catch (err) {
      clearTimeout(timer);
      lastErr = err;

      if (err.name === "AbortError") {
        lastErr = new AiServiceError("Gemini request timed out", "TIMEOUT");
        break; // don't retry timeouts — a slow model won't get faster
      }

      const status = err.status ?? err.code;
      const retryable = status === 429 || status === undefined || (typeof status === "number" && status >= 500);

      if (!retryable || attempt === MAX_RETRIES) {
        if (status === 429) lastErr = new AiServiceError("Gemini rate limit hit", "RATE_LIMITED");
        break;
      }

      await new Promise((r) => setTimeout(r, 300 * 2 ** attempt));
    } finally {
      clearTimeout(timer);
    }
  }
  if (!(lastErr instanceof AiServiceError)) {
    lastErr = new AiServiceError(lastErr?.message || "Gemini request failed", "UPSTREAM_ERROR");
  }
  throw lastErr;
}

function logUsage(label, response) {
  const tokens = response?.usageMetadata?.totalTokenCount;
  if (tokens != null) {
    console.log(`[ai.service] ${label} used ${tokens} tokens`);
  }
}

// Streams a follow-up draft, calling onChunk(text) as pieces arrive, and
// returns the full accumulated text once the stream completes.
export async function streamFollowUpDraft({ target, title, notes, priority, onChunk }) {
  const prompt = `You are a professional assistant. Draft a polite but firm follow-up message to ${target || "the recipient"} regarding "${title}". Context: ${truncate(notes, MAX_NOTES_CHARS) || "No additional context provided."}. Priority: ${priority || "MEDIUM"}. Keep it under 100 words. Return ONLY the message content.`;

  const stream = await callWithRetry((signal) =>
    getClient().models.generateContentStream({
      model: MODEL,
      contents: prompt,
      config: { abortSignal: signal },
    })
  );

  let full = "";
  for await (const chunk of stream) {
    const text = chunk.text;
    if (text) {
      full += text;
      onChunk?.(text);
    }
  }

  full = full.trim();
  if (!full) {
    throw new AiServiceError("Gemini returned an empty draft", "EMPTY_RESPONSE");
  }

  return full;
}

const FOLLOWUP_EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    target: { type: "string", nullable: true },
    notes: { type: "string", nullable: true },
    dueAt: { type: "string", nullable: true, description: "ISO 8601 datetime, or null if no date was mentioned" },
    priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH", "URGENT"] },
  },
  required: ["title", "priority"],
};

// Extracts a structured follow-up (title/target/notes/dueAt/priority) from
// freeform text. Does not persist anything — callers validate and save.
export async function extractFollowupFromText(text, { now = new Date() } = {}) {
  const prompt = `Extract a follow-up task from the user's note below. Today's date/time is ${now.toISOString()} — resolve any relative dates (e.g. "next Friday", "in 2 days") against that. If no date is mentioned, return null for dueAt. If no urgency is implied, use MEDIUM priority.

Note: "${truncate(text, MAX_QUICK_CREATE_CHARS)}"`;

  const response = await callWithRetry((signal) =>
    getClient().models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        abortSignal: signal,
        responseMimeType: "application/json",
        responseSchema: FOLLOWUP_EXTRACTION_SCHEMA,
      },
    })
  );
  logUsage("extractFollowupFromText", response);

  const raw = response.text?.trim();
  if (!raw) {
    throw new AiServiceError("Gemini returned an empty extraction", "EMPTY_RESPONSE");
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new AiServiceError("Gemini returned malformed JSON", "EMPTY_RESPONSE");
  }

  return parsed;
}

// Summarizes a user's active follow-ups into a short digest message.
export async function generateDigestSummary(followups, { now = new Date() } = {}) {
  const items = followups
    .map((f) => `- "${f.title}" (target: ${f.target || "n/a"}, due: ${f.dueAt}, status: ${f.status}, priority: ${f.priority})`)
    .join("\n");

  const prompt = `Today's date/time is ${now.toISOString()}. Write a short, friendly daily digest (under 120 words) summarizing the follow-ups below for the user, calling out anything overdue or urgent first. Return ONLY the summary text, no headers.

${items}`;

  const response = await callWithRetry((signal) =>
    getClient().models.generateContent({
      model: MODEL,
      contents: prompt,
      config: { abortSignal: signal },
    })
  );
  logUsage("generateDigestSummary", response);

  const summary = response.text?.trim();
  if (!summary) {
    throw new AiServiceError("Gemini returned an empty digest", "EMPTY_RESPONSE");
  }

  return summary;
}
