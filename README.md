# FollowUpHub

A follow-up reminder system with:
- Node + Express backend
- PostgreSQL + Drizzle ORM
- Redis
- Cron-based reminder engine + cooldown
- Notifications + event timeline
- Templates support

## Tech Stack
- Backend: Node.js, Express, Drizzle ORM
- DB: PostgreSQL (Docker)
- Cache: Redis (Docker)

## Setup (Local)
1. Clone:
   git clone <repo-url>
2. Start DB + Redis:
   docker compose up -d
3. Backend:
   cd backend
   npm install
   npm run dev
4. Frontend:
   cd frontend
   npm install
   npm run dev
