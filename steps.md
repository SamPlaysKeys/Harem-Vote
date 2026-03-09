# Project Progress Tracker

## Status: Not Started

### Phase 1: Project Initialization
- [ ] Initialize Next.js repository with TypeScript and Tailwind CSS.
- [ ] Setup ESLint and Prettier for code formatting.
- [ ] Initialize Docker and `docker-compose.yml` for local PostgreSQL database.

### Phase 2: Database & Authentication
- [ ] Setup Prisma ORM and connect to PostgreSQL.
- [ ] Define database schema (User, Topic, Option, Vote).
- [ ] Run initial database migrations.
- [ ] Implement NextAuth.js with Google Provider.
- [ ] Implement Anonymous User session/state handling.

### Phase 3: Core API Development
- [ ] Create API route: `POST /api/topics` (Create topic & options).
- [ ] Create API route: `GET /api/topics/active` (Fetch current topic).
- [ ] Create API route: `POST /api/votes` (Cast vote, handle Auth vs Anon logic).
- [ ] Create API route: `POST /api/topics/[id]/close` (Close topic, tally, and trigger email).

### Phase 4: Frontend Development
- [ ] Build Login / Landing Page.
- [ ] Build Navigation / Layout (Auth state dependent).
- [ ] Build Topic Creation Form (for Authenticated users).
- [ ] Build Voting Interface (display question and options).
- [ ] Build Results Dashboard (Integrate Chart library to show Auth vs Anon votes).

### Phase 5: Email & Notifications
- [ ] Integrate Email Service (Resend/Nodemailer).
- [ ] Create HTML Email Template for vote results.
- [ ] Wire up email dispatch on topic close.

### Phase 6: Deployment Prep
- [ ] Write `Dockerfile` for the Next.js app.
- [ ] Update `docker-compose.yml` for production-ready VPS deployment.
- [ ] Write deployment instructions (`DEPLOY.md`).