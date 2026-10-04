// Checks the OpsFlow connection: sends one log, one test alert (twice, to show de-duplication), then resolves it.
// It touches nothing else in FollowUpHub. Run:  npm run opsflow:check
import dotenv from "dotenv";
dotenv.config();
import { opsflow } from "../src/services/opsflow.service.js";

if (!process.env.OPSFLOW_URL || !process.env.OPSFLOW_API_KEY) {
  console.error("Set OPSFLOW_URL and OPSFLOW_API_KEY in backend/.env first.");
  process.exit(1);
}
const title = "OpsFlow connection check (safe to close)";
const fingerprint = "followuphub-connection-check";

console.log("log  ->", await opsflow.log("INFO", "FollowUpHub connection check"));
console.log("fire ->", await opsflow.alert({ title, severity: "SEV4", fingerprint, description: "Sent by npm run opsflow:check" }));
console.log("again->", await opsflow.alert({ title, severity: "SEV4", fingerprint }));
console.log("done ->", await opsflow.resolve(fingerprint, title));
console.log("\nOpen OpsFlow: there should be one SEV4 incident with a 'resolved' note. Close it when you are done.");
