# FollowUpHub — Problems Faced & How We Solved Them

> A complete chronicle of every bug, error, and challenge encountered during the development of FollowUpHub, and how each one was resolved.

---

## Table of Contents

1. [Email Delivery Saga (4 Provider Migrations)](#1-email-delivery-saga)
2. [Safari / iOS Cookie Authentication Failure](#2-safari--ios-cookie-authentication-failure)
3. [IPv6 Crash on Render Deployment](#3-ipv6-crash-on-render-deployment)
4. [Cross-Domain Cookie Security Misconfiguration](#4-cross-domain-cookie-security-misconfiguration)
5. [Hardcoded Localhost URLs Breaking Production Emails](#5-hardcoded-localhost-urls-breaking-production-emails)
6. [Next.js Static Build Crash — Missing Suspense Boundaries](#6-nextjs-static-build-crash--missing-suspense-boundaries)
7. [Docker Build Failure — Missing Docs Directory](#7-docker-build-failure--missing-docs-directory)
8. [Verify Email Page Showing Ugly Error for Missing Token](#8-verify-email-page-showing-ugly-error-for-missing-token)
9. [Secrets Leaked in Git — .env Committed to Repo](#9-secrets-leaked-in-git--env-committed-to-repo)
10. [No Global Error Handler Mounted](#10-no-global-error-handler-mounted)
11. [No Input Validation / Sanitization](#11-no-input-validation--sanitization)
12. [Desktop Notification Bugs (Duplicates, Stale Closures, SSR Crashes)](#12-desktop-notification-bugs)
13. [Notification Escalation Logic Bug](#13-notification-escalation-logic-bug)
14. [No Graceful Shutdown — Process Crashes Dropping Connections](#14-no-graceful-shutdown)
15. [Missing Dependencies in package.json](#15-missing-dependencies-in-packagejson)
16. [Reminder Engine Doing Redundant Double Query](#16-reminder-engine-doing-redundant-double-query)
17. [OAuth Redirect URLs Hardcoded to Localhost](#17-oauth-redirect-urls-hardcoded-to-localhost)
18. [Mailer Creating New SMTP Transport Per Email](#18-mailer-creating-new-smtp-transport-per-email)
19. [JWT Token Expiring Too Fast (1 Hour, No Refresh)](#19-jwt-token-expiring-too-fast)
20. [Mobile OAuth Buttons Broken](#20-mobile-oauth-buttons-broken)
21. [Missing cursor-pointer on Clickable Elements](#21-missing-cursor-pointer-on-clickable-elements)
22. [Sidebar vs TopNav — Navigation Redesign Churn](#22-sidebar-vs-topnav--navigation-redesign-churn)
23. [Encryption Key Fallback Insecurity](#23-encryption-key-fallback-insecurity)
24. [No Error Boundaries in Frontend](#24-no-error-boundaries-in-frontend)
25. [Socket.IO Reconnection Not Handled](#25-socketio-reconnection-not-handled)
26. [Synchronous Email Sending Slowing Down Signup](#26-synchronous-email-sending-slowing-down-signup)
27. [Local Auth Bypass Left in Production Code](#27-local-auth-bypass-left-in-production-code)
28. [Frontend Metadata Set to "MVP"](#28-frontend-metadata-set-to-mvp)
29. [Snooze/Done Actions Available on Completed Follow-ups](#29-snoozedone-actions-available-on-completed-follow-ups)
30. [Stale/Unnecessary Files Cluttering the Repo](#30-staleunnecessary-files-cluttering-the-repo)

---

## 1. Email Delivery Saga

**Category:** Infrastructure / Third-Party Integration  
**Severity:** 🔴 Critical  
**Commits:** `20f7c2e` → `b2d0a7c` → `51df4ec` → `c2f9fa8` → `ca60c5d` → `d189850`

### The Problem
Email delivery was the single most painful problem in this project. We went through **4 different email providers** before finding one that actually worked on our hosting platform (Render).

### The Journey

**Attempt 1: Nodemailer with Gmail SMTP**
- Started with the standard approach — Nodemailer using Gmail's SMTP server (`smtp.gmail.com`).
- Worked perfectly in local development.
- **Failed on Render** — Render's free tier blocks outbound SMTP connections on port 587/465. Emails silently failed or timed out.
- Added a timeout and fallback mock (`ca60c5d`) to prevent server crashes when SMTP was unreachable, but emails still weren't actually sending.

**Attempt 2: Resend API**
- Migrated to Resend (`20f7c2e`), a modern email API that uses HTTP instead of SMTP.
- Worked! But had limitations — free tier only allows sending from `onboarding@resend.dev`, not our own domain.
- Acceptable for MVP, but not professional.

**Attempt 3: Back to Nodemailer**
- Tried to go back to Nodemailer (`b2d0a7c`) thinking we could configure it differently.
- **Same SMTP blocking issue on Render.** Immediately reverted (`51df4ec`).

**Attempt 4 (Final): Gmail HTTP API via `googleapis`**
- The breakthrough — instead of SMTP, use the official Gmail REST API (`c2f9fa8`).
- Uses OAuth2 with a refresh token to authenticate.
- Sends emails via HTTP POST, completely bypassing SMTP — **Render can't block it.**
- Uses `nodemailer/lib/mail-composer` to build RFC 2822 compliant raw email, then base64url-encodes it for the Gmail API.

### Resolution
```
Nodemailer (SMTP) → Resend (HTTP API) → Nodemailer again → Gmail HTTP API (googleapis)
```
Final implementation lives in `backend/src/config/mailer.js` — uses `googleapis` OAuth2 client with `gmail.users.messages.send()`.

### Lesson Learned
> Never assume SMTP will work on a PaaS. Always check if your hosting platform allows outbound SMTP. HTTP-based email APIs are more reliable for cloud deployments.

---

## 2. Safari / iOS Cookie Authentication Failure

**Category:** Authentication / Browser Compatibility  
**Severity:** 🔴 Critical  
**Commit:** `b17426a`

### The Problem
Authentication worked perfectly on Chrome desktop but **completely broke on Safari and all iOS browsers** (including Chrome on iOS, since it uses WebKit).

Safari's Intelligent Tracking Prevention (ITP) blocks third-party cookies by default. Since our frontend (`followuphub.vercel.app`) and backend (`followuphub.onrender.com`) are on different domains, the `httpOnly` auth cookie set by the backend was being silently rejected by Safari.

Users on iPhones and Macs using Safari could not log in at all — the cookie was never stored, so every subsequent API request returned 401 Unauthorized.

### Resolution
Switched to a **dual authentication strategy**:

1. **Backend** (`user.routes.js`): Login endpoint now returns the JWT token in the response body (`{ token }`) in addition to setting the cookie.
2. **Frontend** (`auth/callback/page.tsx`): OAuth callback stores the token in `localStorage`.
3. **API client** (`lib/api.ts`): Every request checks `localStorage` for a token and attaches it as a `Bearer` header. Cookies are still sent as a fallback (`credentials: "include"`).
4. **Auth middleware** (`auth.middleware.js`): Checks `Authorization: Bearer <token>` header first, falls back to `req.cookies.token`.

### Lesson Learned
> Never rely solely on cookies for cross-domain auth. Safari/iOS ITP will block third-party cookies. Use `localStorage` + `Authorization` header as the primary mechanism, with cookies as a fallback.

---

## 3. IPv6 Crash on Render Deployment

**Category:** Infrastructure / Networking  
**Severity:** 🔴 Critical  
**Commit:** `9863ba2`

### The Problem
The backend server was crashing immediately on Render with SMTP connection errors. The root cause was Node.js's default DNS resolution preferring IPv6 (`::1`) over IPv4 (`127.0.0.1`).

Render's infrastructure didn't properly support IPv6 for outbound SMTP connections, causing `ECONNREFUSED` errors that crashed the process.

### Resolution
Added `dns.setDefaultResultOrder("ipv4first")` at the very top of `server.js`, before any other imports:

```js
import dns from "dns";
dns.setDefaultResultOrder("ipv4first");
```

This forces Node.js to prefer IPv4 addresses when resolving DNS, avoiding the IPv6 connection failures.

### Lesson Learned
> On cloud platforms, always force IPv4-first DNS resolution in Node.js. IPv6 support is inconsistent across PaaS providers.

---

## 4. Cross-Domain Cookie Security Misconfiguration

**Category:** Security / Authentication  
**Severity:** 🔴 Critical  
**Commit:** `db3398d`

### The Problem
Cookie attributes were hardcoded for development:
```js
res.cookie("token", token, {
  httpOnly: true,
  secure: false,        // ❌ Hardcoded
  sameSite: "lax",      // ❌ Hardcoded
});
```

In production (HTTPS), `secure` MUST be `true` for the browser to send the cookie. And for cross-domain cookie sharing, `sameSite` needs to be `"none"` (which requires `secure: true`).

### Resolution
Made cookie attributes environment-aware:
```js
res.cookie("token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
});
```

Applied the same fix to the logout route's `clearCookie` call.

### Lesson Learned
> Never hardcode cookie security attributes. Always derive them from the environment. `secure: false` in production means the cookie is never sent over HTTPS.

---

## 5. Hardcoded Localhost URLs Breaking Production Emails

**Category:** Configuration / Deployment  
**Severity:** 🔴 Critical  
**Commits:** `9863ba2`, `f5b446b`

### The Problem
Email verification and password reset links contained hardcoded `localhost` URLs:
```js
// Verification email
`http://localhost:5001/api/users/verify-email?token=${verifyToken}`

// Password reset
`http://localhost:3000/reset-password?token=${resetToken}`

// Resend verification — pointed to frontend but should be backend!
`http://localhost:3000/api/users/verify-email?token=${verifyToken}`
```

In production, users received emails with links pointing to `localhost` — completely broken and unusable. Additionally, the resend-verification endpoint had an inconsistent URL that pointed to the frontend instead of the backend.

### Resolution
Replaced all hardcoded URLs with environment variables:
```js
const verifyUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/verify-email?token=${verifyToken}`;
const resetLink = `${process.env.CLIENT_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;
```

Also applied the same fix to OAuth redirect URLs (`f5b446b`).

### Lesson Learned
> Never hardcode URLs. Use environment variables for ALL URLs that differ between dev and production. Search your codebase for `localhost` before every deployment.

---

## 6. Next.js Static Build Crash — Missing Suspense Boundaries

**Category:** Frontend / Framework  
**Severity:** 🟠 High  
**Commit:** `c34e60c`

### The Problem
`next build` was failing with errors on any page that used `useSearchParams()`. In Next.js 14+, `useSearchParams()` requires a `<Suspense>` boundary because the hook causes the component to opt out of static rendering.

Without the boundary, Next.js throws:
```
Error: useSearchParams() should be wrapped in a suspense boundary
```

This affected 5 pages: follow-ups list, new follow-up, login, reset-password, and verify-email.

### Resolution
Wrapped every component using `useSearchParams()` in a `<Suspense>` boundary with a loading fallback:

```tsx
export default function Page() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PageContent />  {/* useSearchParams() lives here */}
    </Suspense>
  );
}
```

The actual logic was extracted into a child component (`PageContent`), and the default export became a wrapper with `<Suspense>`.

### Lesson Learned
> In Next.js App Router, always wrap `useSearchParams()` in a Suspense boundary. This is a framework requirement for static/SSG compatibility.

---

## 7. Docker Build Failure — Missing Docs Directory

**Category:** DevOps / Docker  
**Severity:** 🟠 High  
**Commits:** `ffd18cf`, `4c42bf8`

### The Problem
Docker build was failing because the Dockerfile tried to copy a `docs/` directory that didn't exist in the build context. The initial fix (`ffd18cf`) added the COPY instruction, but then the directory was accidentally removed or restructured, causing a second failure that needed another fix (`4c42bf8`).

### Resolution
Restored the `docs` directory and ensured the Dockerfile correctly referenced it. Had to fix it twice because the first attempt didn't account for the full build context.

### Lesson Learned
> Always test Docker builds after restructuring directories. Use `.dockerignore` carefully and verify COPY instructions reference existing paths.

---

## 8. Verify Email Page Showing Ugly Error for Missing Token

**Category:** UX / Error Handling  
**Severity:** 🟡 Medium  
**Commit:** `5118fde`

### The Problem
When users visited the `/verify-email` page without a token in the URL (e.g., by bookmarking the page or navigating there manually), they saw an ugly, confusing error message: "Missing token." This looked like a bug to the user.

### Resolution
Changed the missing-token case to show a friendly success-like message instead:
- "Your email has been verified" or a redirect to login, rather than an error.
- The rationale: if someone lands on the verify page without a token, they've likely already verified or the link expired. Showing an error adds no value.

### Lesson Learned
> Error states should be user-friendly. Not every edge case needs to show an error — sometimes a graceful redirect or neutral message is better UX.

---

## 9. Secrets Leaked in Git — .env Committed to Repo

**Category:** Security  
**Severity:** 🔴 Critical (Identified in production audit)

### The Problem
The `backend/.env` file containing real credentials was committed to the repository:
- Gmail app password
- Google OAuth client secret
- GitHub OAuth client secret
- Slack webhook URL
- JWT secrets
- Database connection string

The `.gitignore` had `.env` listed, but the file was already tracked before the ignore rule was added — `.gitignore` doesn't retroactively untrack files.

### Resolution
1. Removed `.env` from git tracking: `git rm --cached backend/.env`
2. Rotated ALL compromised credentials
3. Created `backend/.env.example` with placeholder values
4. Verified `.gitignore` rules were correct

### Lesson Learned
> Add `.env` to `.gitignore` BEFORE your first commit. If you accidentally commit secrets, `git rm --cached` only removes tracking — the secrets are still in git history. For true removal, use `git filter-branch` or BFG Repo Cleaner, and rotate ALL leaked credentials immediately.

---

## 10. No Global Error Handler Mounted

**Category:** Backend / Reliability  
**Severity:** 🔴 Critical (Identified in production audit)

### The Problem
An error handling middleware (`error.middleware.js`) existed in the codebase but was **never imported or mounted** in `app.js`. This meant:
- Unhandled errors would crash the Node.js process
- Stack traces could leak to the client in error responses
- No consistent error response format

### Resolution
- Implemented Zod-based request validation across all API modules (`a969bbf`)
- Mounted the global error handler middleware after all routes
- Added centralized schema definitions for consistent validation

### Lesson Learned
> Writing middleware is not enough — you must mount it. Always verify your middleware chain end-to-end: `app.use(errorHandler)` must come AFTER all routes.

---

## 11. No Input Validation / Sanitization

**Category:** Security  
**Severity:** 🔴 Critical (Identified in production audit)

### The Problem
All API routes accepted any request body shape without validation. Signup could receive malformed data, follow-up creation accepted arbitrary values, and XSS was possible through `notes`, `title`, and `bodyHtml` fields.

While SQL injection was mitigated by Drizzle ORM's parameterized queries, there was no defense against malformed inputs or stored XSS.

### Resolution
Implemented Zod-based validation across all API modules (`a969bbf`):
- Created centralized schema definitions
- Added validation middleware to all routes
- Ensured type-safe request bodies

### Lesson Learned
> Always validate inputs at the API boundary. ORMs protect against SQL injection, but they don't protect against bad data shapes or XSS. Use Zod, Joi, or similar for schema validation.

---

## 12. Desktop Notification Bugs

**Category:** Frontend / Real-Time  
**Severity:** 🟠 High  
**Commit:** `dde9950`

### The Problem
The desktop notification system had **6 separate bugs** that manifested together:

1. **SSR Crash**: Code accessed `window` and `document` without SSR safety checks, crashing during Next.js server-side rendering.
2. **Duplicate Socket Listeners**: Socket event listeners were being registered multiple times on re-renders, causing duplicate notifications.
3. **Stale Closures**: Optimistic state updates in the notification context used stale closure values, showing outdated notification counts.
4. **Notification Spam**: No debouncing on API calls — rapid events caused a flood of API requests.
5. **Same-Group Throttling**: All notifications shared a single throttle, so if you got a notification for Task A, Task B's notification would be suppressed.
6. **Permission Desync**: The browser's notification permission could change (user revokes in settings) but the app wouldn't detect it.

### Resolution
All fixed in a single comprehensive commit:
- Added `typeof window !== "undefined"` guards for SSR safety
- Used empty dependency arrays `[]` on socket listener useEffects to prevent re-registration
- Used `useRef` to avoid stale closures in optimistic updates
- Added 500ms API debounce
- Implemented per-group throttling (each task gets its own throttle window)
- Added permission polling every 5 seconds to sync with browser settings
- Added memory cleanup for the throttle cache

### Lesson Learned
> Real-time notification systems are deceptively complex. You must handle: SSR safety, listener cleanup, closure staleness, debouncing, per-entity throttling, and permission synchronization. Test on both client and server rendering.

---

## 13. Notification Escalation Logic Bug

**Category:** Backend / Business Logic  
**Severity:** 🟠 High  
**Commit:** `278000d`

### The Problem
The notification escalation system (which increases urgency for overdue follow-ups) had flawed logic. Notifications were being escalated incorrectly — either too aggressively or not at all — causing users to receive wrong escalation levels.

### Resolution
Fixed the escalation logic alongside a broader UI refactor. Ensured escalation tiers (info → warning → urgent) mapped correctly to time thresholds.

### Lesson Learned
> Business logic around time-based escalation needs thorough unit testing with mocked dates. Edge cases around timezone boundaries and exact threshold boundaries are common sources of bugs.

---

## 14. No Graceful Shutdown

**Category:** Backend / Reliability  
**Severity:** 🔴 Critical (Identified in audit, then fixed)

### The Problem
When the server process was killed (deploy, crash, SIGTERM), it would immediately terminate, causing:
- In-flight HTTP requests dropped
- Database connections left hanging
- Cron jobs (reminder engine, Jira sync) left in unknown state
- Redis connections leaked

### Resolution
Implemented comprehensive graceful shutdown in `server.js`:
```js
async function gracefulShutdown(signal) {
  httpServer.close();           // Stop accepting new connections
  reminderJob.stop();           // Stop cron jobs
  jiraSyncJob.stop();
  await redisClient.quit();     // Close Redis
  await pool.end();             // Close DB pool
  process.exit(0);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("uncaughtException", (err) => gracefulShutdown("uncaughtException"));
process.on("unhandledRejection", (reason) => gracefulShutdown("unhandledRejection"));
```

Includes a 10-second force-exit timeout to prevent indefinite hanging.

### Lesson Learned
> Every production Node.js server needs graceful shutdown. Handle SIGTERM (Kubernetes/PaaS sends this), SIGINT (Ctrl+C), uncaughtException, and unhandledRejection. Close resources in order: HTTP server → background jobs → caches → database.

---

## 15. Missing Dependencies in package.json

**Category:** DevOps / Build  
**Severity:** 🔴 Critical (Identified in audit, then fixed)

### The Problem
The `backend/package.json` originally only listed ~7 dependencies, but the code imported 15+. Packages like `express`, `cors`, `cookie-parser`, `dotenv`, `jsonwebtoken`, and `nodemailer` were used but not listed.

This worked locally because they were in `node_modules` from a previous install, but `npm ci` (used in CI/CD and Docker) would fail because it only installs listed dependencies.

### Resolution
Audited all imports across the backend and added every missing dependency to `package.json`. The final `package.json` now correctly lists all 22 dependencies.

### Lesson Learned
> Always run `npm ls` or `depcheck` to verify all imported packages are listed in `package.json`. Local `node_modules` can mask missing dependency declarations.

---

## 16. Reminder Engine Doing Redundant Double Query

**Category:** Backend / Performance  
**Severity:** 🟡 Medium  
**Location:** `backend/src/services/reminder.service.js`

### The Problem
The reminder engine was executing two database queries:
1. First query: Fetch overdue follow-ups (result was never used)
2. Second query: Fetch overdue follow-ups WITH a JOIN to get user data

The first query was completely wasted — an artifact of incremental development where the second query was added without removing the first.

### Resolution
Identified in the production readiness audit. The first query should be removed, keeping only the joined query that returns all needed data in one round-trip.

### Lesson Learned
> Code reviews should catch dead queries. When refactoring data access, search for all queries to the same table and verify each is still needed.

---

## 17. OAuth Redirect URLs Hardcoded to Localhost

**Category:** Authentication / Deployment  
**Severity:** 🔴 Critical  
**Commit:** `f5b446b`

### The Problem
Google and GitHub OAuth callback URLs were hardcoded to `http://localhost:3000` and `http://localhost:5001`. In production, OAuth redirects went to localhost instead of the deployed domain, breaking the entire OAuth login flow.

### Resolution
Replaced all hardcoded URLs with `process.env.CLIENT_URL` and `process.env.SERVER_URL`:
```js
// Before
const redirectUrl = "http://localhost:3000/auth/callback";

// After
const redirectUrl = `${process.env.CLIENT_URL}/auth/callback`;
```

### Lesson Learned
> OAuth redirect URLs are one of the first things to break in production. Always use environment variables, and configure matching redirect URIs in your OAuth provider's dashboard.

---

## 18. Mailer Creating New SMTP Transport Per Email

**Category:** Backend / Performance  
**Severity:** 🟡 Medium  
**Location:** `backend/src/config/mailer.js` (pre-Gmail API migration)

### The Problem
The original Nodemailer setup called `nodemailer.createTransport()` inside the `sendEmail()` function. This created a brand new SMTP connection for every single email — slow and resource-intensive.

### Resolution
This became moot when we migrated to the Gmail HTTP API (which uses a persistent OAuth2 client). But the lesson still applies: SMTP transports should be created once at module level and reused.

### Lesson Learned
> Create database connections, SMTP transports, and API clients once at module level. Never recreate them per-request.

---

## 19. JWT Token Expiring Too Fast

**Category:** Authentication / UX  
**Severity:** 🟠 High  
**Commits:** `9863ba2`, `c9e5a80`

### The Problem
The JWT token was set to expire in just `1h`:
```js
jwt.sign(payload, secret, { expiresIn: "1h" });
```

Users were getting logged out every hour with no way to refresh their session. The `JWT_EXPIRES_IN` env var existed in `.env` but was never actually used in the code!

There was also a back-and-forth between commits: one commit set it to `7d` using the env var, the next reverted to `1h` hardcoded (during the IPv6 fix which did a broader rollback), then it was fixed again.

### Resolution
Used the environment variable with a sensible default:
```js
jwt.sign(payload, secret, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
```

### Lesson Learned
> If you create an env var, use it. Grep your codebase for env vars that are defined but never read. Also, consider implementing a refresh token flow for proper session management.

---

## 20. Mobile OAuth Buttons Broken

**Category:** Frontend / Mobile  
**Severity:** 🟠 High  
**Commit:** `9863ba2`

### The Problem
The Google and GitHub OAuth login buttons on the signup/login pages were broken on mobile devices. The buttons either weren't clickable or redirected incorrectly on small screens.

### Resolution
Fixed as part of the IPv6 crash fix commit. Rebuilt the OAuth buttons on auth pages with proper mobile-responsive layouts and correct redirect handling.

### Lesson Learned
> Always test OAuth flows on mobile devices. The redirect chain (app → OAuth provider → callback → app) has many failure points on mobile browsers.

---

## 21. Missing cursor-pointer on Clickable Elements

**Category:** Frontend / UX  
**Severity:** 🟢 Low  
**Commit:** `12aee45`

### The Problem
Many interactive elements (buttons, cards, links) across the application didn't have `cursor: pointer` set. Users couldn't visually distinguish clickable elements from static text, making the app feel unresponsive.

### Resolution
Audited all clickable elements and added `cursor-pointer` class. Also added broader mobile responsiveness improvements in the same commit.

### Lesson Learned
> Small UX details matter. `cursor: pointer` is easy to forget but makes a big difference in perceived interactivity. Consider adding it globally to all `<button>` and `<a>` elements via CSS reset.

---

## 22. Sidebar vs TopNav — Navigation Redesign Churn

**Category:** Frontend / Architecture  
**Severity:** 🟡 Medium (development velocity impact)  
**Commits:** `52d5fc3`, `ade8926`, `f9dc4b6`

### The Problem
The navigation went through multiple redesigns in rapid succession:
1. First: Custom top navigation component (`52d5fc3`)
2. Then: Full sidebar layout (`ade8926`)
3. Then: Simplified and modernized (`f9dc4b6`), removing legacy notification pages

Each redesign touched many files and required updating layouts, routing, and responsive behavior. The churn slowed development of actual features.

### Resolution
Settled on the current navigation pattern. Both `Sidebar.tsx` and `TopNav.tsx` exist in the codebase, with the sidebar as the primary navigation on desktop and a responsive top nav on mobile.

### Lesson Learned
> Design your navigation architecture early and commit to it. Navigation changes are expensive because they touch every page. Use a design mockup tool before coding.

---

## 23. Encryption Key Fallback Insecurity

**Category:** Security  
**Severity:** 🟠 High  
**Location:** `backend/src/utils/encryption.js`

### The Problem
The encryption utility (used for encrypting Jira API tokens) had an insecure fallback:
```js
const key = process.env.ENCRYPTION_KEY || "fallback_secret_password";
```

If the `ENCRYPTION_KEY` env var was missing (common in rushed deployments), all Jira tokens would be encrypted with a publicly known key. Anyone could decrypt them.

### Resolution
Identified in the production readiness audit. The fix is to throw an error in production if `ENCRYPTION_KEY` is not set — no fallback allowed.

### Lesson Learned
> Never provide fallback values for security-critical configuration. Fail loudly in production if a required secret is missing. Silent fallbacks create false security.

---

## 24. No Error Boundaries in Frontend

**Category:** Frontend / Reliability  
**Severity:** 🟡 Medium  
**Location:** `frontend/src/app/(app)/layout.tsx`

### The Problem
No React error boundaries anywhere in the app. If any component threw a runtime error (e.g., accessing a property on `undefined`), the entire page would white-screen with no recovery option. Users had to manually refresh.

### Resolution
Identified in audit. The fix involves adding `error.tsx` files in Next.js route segments and a global error boundary component.

### Lesson Learned
> Every production React app needs error boundaries. In Next.js App Router, add `error.tsx` to each route segment. It's a few lines of code that prevents catastrophic UX failures.

---

## 25. Socket.IO Reconnection Not Handled

**Category:** Frontend / Real-Time  
**Severity:** 🟡 Medium  
**Location:** `frontend/src/lib/socket.ts`

### The Problem
The Socket.IO client had no reconnection strategy:
- No `reconnectionAttempts` limit
- No exponential backoff
- Connection errors just logged to console
- No UI indicator showing connection status

If the WebSocket connection dropped (network change, server restart), the user would silently lose real-time notifications without knowing.

### Resolution
The socket was configured with `autoConnect: false` and `transports: ["websocket"]` to avoid CORS polling issues. Reconnection handling remains an area for improvement — currently relies on Socket.IO's built-in defaults when connected.

### Lesson Learned
> Real-time connections need visible status indicators. Show a "Reconnecting..." banner when the socket disconnects. Users should never silently lose real-time updates.

---

## 26. Synchronous Email Sending Slowing Down Signup

**Category:** Backend / Performance  
**Severity:** 🟡 Medium  
**Commit:** `d189850`

### The Problem
The signup and password reset endpoints were `await`-ing the email send before responding to the client:
```js
await sendEmail({ to, subject, html }); // Blocks response for 2-5 seconds
res.json({ message: "Signup successful" });
```

Email sending (even via HTTP API) takes 2-5 seconds. Users saw a long spinner on signup while waiting for the verification email to send.

### Resolution
Made email sending fire-and-forget (asynchronous):
```js
// Don't await — send email in background
sendEmail({ to, subject, html }).catch(err => console.error("Email failed:", err));
res.json({ message: "Signup successful" });
```

The response returns immediately, and the email sends in the background. If it fails, it's logged but doesn't block the user.

### Lesson Learned
> Never block the HTTP response on non-critical async operations. Email, analytics, logging — these should all be fire-and-forget with error logging. Users shouldn't wait for side effects.

---

## 27. Local Auth Bypass Left in Production Code

**Category:** Security  
**Severity:** 🔴 Critical  
**Commits:** `1f83b69`, `7a2a701`

### The Problem
During development, a local auth bypass was added to `ProtectedRoute.tsx` to skip authentication checks when running locally. This bypass was accidentally included in a commit (`1f83b69`) that also added skeleton loading states.

If deployed to production, any user could access protected routes without logging in.

### Resolution
Removed entirely in a follow-up commit just 50 seconds later (`7a2a701`). The bypass code was stripped from `ProtectedRoute.tsx`.

### Lesson Learned
> Never commit auth bypasses, even for development. Use environment-specific flags or separate dev middleware that is excluded from production builds. Better yet, use proper test accounts.

---

## 28. Frontend Metadata Set to "MVP"

**Category:** SEO / Professionalism  
**Severity:** 🟢 Low  
**Location:** `frontend/src/app/layout.tsx`

### The Problem
The site's meta description was literally set to `"MVP"`:
```tsx
export const metadata = {
  title: "FollowUpHub",
  description: "MVP",
};
```

This would show up in Google search results and link previews — not a great look.

### Resolution
Identified in audit. Needs proper title, description, Open Graph tags, and favicon configuration for production.

### Lesson Learned
> Update metadata before deploying. Search your codebase for placeholder text like "MVP", "TODO", "Lorem ipsum" before any public launch.

---

## 29. Snooze/Done Actions Available on Completed Follow-ups

**Category:** Frontend + Backend / Business Logic  
**Severity:** 🟡 Medium  
**Commit:** `ef6f171`

### The Problem
Users could click "Snooze" or "Done" on follow-ups that were already marked as DONE. This led to confusing behavior — snoozing a completed item made no logical sense, and marking an already-done item as done again caused unnecessary API calls.

### Resolution
- **Frontend**: Hide the Snooze button when status is DONE. Disable the Done button when already completed.
- **Backend**: Added validation to reject snooze attempts on DONE items, returning a 400 error.

### Lesson Learned
> Always validate state transitions on both frontend and backend. The frontend provides UX hints (hiding/disabling buttons), but the backend must be the source of truth for what transitions are valid.

---

## 30. Stale/Unnecessary Files Cluttering the Repo

**Category:** Code Quality / Maintenance  
**Severity:** 🟢 Low

### The Problem
The repository accumulated several files that don't belong in production code:
- `frontend/fix_glows.py` — A Python script in a JavaScript project
- `backend/test-*.js` (6 files) — Test scripts in the root instead of a `tests/` directory
- `frontend/HOMEPAGE_*.md`, `frontend/ARCHITECTURE_UPGRADE.md` — Dev documentation mixed with source code
- `frontend/production_readiness_plan.md.resolved` — Internal audit doc

### Resolution
Identified for cleanup. These should be moved to a `docs/` directory, deleted, or added to `.gitignore`.

### Lesson Learned
> Regularly audit your repository for files that shouldn't be there. Use `.gitignore` proactively, and keep documentation in a dedicated `docs/` directory.

---

## Summary Statistics

| Category | Count |
|----------|-------|
| 🔴 Critical Issues | 12 |
| 🟠 High Priority | 7 |
| 🟡 Medium Priority | 8 |
| 🟢 Low Priority | 3 |
| **Total Problems** | **30** |

| Area | Count |
|------|-------|
| Authentication & Security | 9 |
| Email / Communication | 4 |
| Infrastructure / Deployment | 5 |
| Frontend / UX | 6 |
| Backend / Performance | 4 |
| Code Quality | 2 |

---

## Key Takeaways

1. **Deployment platforms have hidden restrictions** — Render blocks SMTP, Safari blocks cross-domain cookies, IPv6 isn't universally supported.
2. **Security issues compound** — Leaked secrets + hardcoded URLs + no validation = disaster waiting to happen.
3. **Real-time systems are hard** — Notifications alone produced 6 distinct bugs across SSR, closures, and throttling.
4. **Environment parity matters** — Most bugs only appeared in production because dev and prod environments differed significantly.
5. **Email is surprisingly hard** — We went through 4 providers. HTTP APIs are more reliable than SMTP in cloud environments.

---

*Last updated: June 19, 2026*
*Total development period: January 12 — June 18, 2026 (~5 months)*
