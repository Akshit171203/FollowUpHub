/**
 * OpsFlow reporting: tells OpsFlow (the incident platform) when something goes wrong or changes.
 *
 *   - alert / resolve  -> open or note an incident
 *   - log              -> add an error log to the service's page
 *   - trackJob         -> wraps a cron job: alerts when it starts failing, says "resolved" when it recovers
 *
 * Nothing here can break FollowUpHub: every call has a short timeout and swallows its own errors.
 * When OPSFLOW_URL / OPSFLOW_API_KEY are not set it does nothing at all.
 *
 * Settings are read when called, not at import time, because server.js loads .env after its imports run.
 */
const SOURCE = "followuphub";
const TIMEOUT_MS = 3000;
// While a job keeps failing, remind OpsFlow at most this often (it also de-duplicates on its side)
const RENOTIFY_MS = 5 * 60 * 1000;

function settings() {
  return {
    url: (process.env.OPSFLOW_URL || "").replace(/\/$/, ""),
    key: process.env.OPSFLOW_API_KEY || "",
    service: process.env.OPSFLOW_SERVICE || "followuphub-api",
  };
}

async function post(path, body) {
  const { url, key } = settings();
  if (!url || !key) return null;
  try {
    const res = await fetch(`${url}${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      console.warn(`[OpsFlow] ${path} rejected with ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.warn(`[OpsFlow] could not reach OpsFlow (${err.message}); continuing`);
    return null;
  }
}

/**
 * Turn an error into a short, safe description. Database errors from Drizzle include the bound query
 * parameters (which can be user data), so everything from "params:" on is dropped, emails are masked,
 * and the text is cut short. Logs sent to OpsFlow are stored as written, so be conservative.
 */
export function safeMessage(err) {
  const raw = String(err?.message ?? err ?? "unknown error");
  return raw
    .split(/\bparams:/i)[0]
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[email]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 300);
}

const jobs = new Map(); // id -> { failing, lastSent }

export const opsflow = {
  alert: ({ title, severity = "SEV3", fingerprint, description }) =>
    post("/api/integrations/alerts", { service: settings().service, source: SOURCE, title, severity, fingerprint, description, status: "firing" }),

  resolve: (fingerprint, title) =>
    post("/api/integrations/alerts", { service: settings().service, source: SOURCE, title, fingerprint, status: "resolved" }),

  log: (level, message) => post("/api/logs", { service: settings().service, level, message: String(message).slice(0, 1000) }),

  /** Run a cron job body. Failures are reported (and re-thrown, so existing error handling still runs). */
  async trackJob({ id, title, severity = "SEV2" }, fn) {
    const fingerprint = `followuphub-${id}`;
    const state = jobs.get(id) ?? { failing: false, lastSent: 0 };
    try {
      const result = await fn();
      if (state.failing) {
        state.failing = false;
        jobs.set(id, state);
        await opsflow.resolve(fingerprint, title);
      }
      return result;
    } catch (err) {
      const due = !state.failing || Date.now() - state.lastSent > RENOTIFY_MS;
      state.failing = true;
      jobs.set(id, state);
      if (due) {
        state.lastSent = Date.now();
        await opsflow.alert({ title, severity, fingerprint, description: safeMessage(err) });
      }
      throw err;
    }
  },

  /** The process is about to die. Resolves (never rejects) after at most a few seconds. */
  reportFatal: (kind, err) =>
    opsflow.alert({
      title: "FollowUpHub API crashed",
      severity: "SEV1",
      fingerprint: "followuphub-crash",
      description: `${kind}: ${safeMessage(err)}`,
    }),
};
