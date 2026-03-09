# Project Progress Tracker

## Status: Phase 4 Complete

### Phase 1: Project Initialization

- [x] Initialize Next.js repository with TypeScript and Tailwind CSS.
- [x] Setup ESLint and Prettier for code formatting.
- [x] Initialize Docker and `docker-compose.yml` for local PostgreSQL database.

### Phase 2: Database & Authentication

- [x] Setup Prisma ORM and connect to PostgreSQL.
- [x] Define database schema (User, Topic, Option, Vote).
- [x] Run initial database migrations.
- [x] Implement NextAuth.js with Google Provider.
- [x] Implement Anonymous User session/state handling.

### Phase 3: Core API Development

- [x] Create API route: `POST /api/topics` (Create topic & options).
- [x] Create API route: `GET /api/topics/active` (Fetch current topic).
- [x] Create API route: `POST /api/votes` (Cast vote, handle Auth vs Anon logic).
- [x] Create API route: `POST /api/topics/[id]/close` (Close topic, tally, and trigger email).

### Phase 4: Frontend Development

- [x] Build Login / Landing Page.
- [x] Build Navigation / Layout (Auth state dependent).
- [x] Build Topic Creation Form (for Authenticated users).
- [x] Build Voting Interface (display question and options).
- [x] Build Results Dashboard (Integrate Chart library to show Auth vs Anon votes).

### Phase 5: Email & Notifications

- [ ] Integrate Email Service (Resend/Nodemailer).
- [ ] Create HTML Email Template for vote results.
- [ ] Wire up email dispatch on topic close.

### Phase 6: Deployment Prep

- [ ] Write `Dockerfile` for the Next.js app.
- [ ] Update `docker-compose.yml` for production-ready VPS deployment.
- [ ] Create Ansible playbook for VPS deployment (`ansible/`).
- [ ] Write deployment instructions (`DEPLOY.md`).

### Phase 7: Production Auth Setup (Manual)

- [ ] Create Google OAuth credentials at https://console.cloud.google.com/apis/credentials
- [ ] Configure OAuth consent screen with app name and authorized domains.
- [ ] Create OAuth 2.0 Client ID (Web application type).
- [ ] Add authorized redirect URI: `https://yourdomain.com/api/auth/callback/google`
- [ ] Update `.env.local` with `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
- [ ] Remove or disable the Dev Login credentials provider for production.
