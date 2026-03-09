# Project Plan: Harem Vote (Dynamic Voting Application)

## Overview

A modern, dynamic web application designed to be hosted on a VPS. It allows users to log in asynchronously (via Google IdP) or anonymously to vote on topics created by users. Once a voting period concludes, the results are tallied, visually separated between authenticated and anonymous votes, and emailed to all registered members.

## Recommended Technology Stack

- **Frontend & Backend Framework:** [Next.js](https://nextjs.org/) (React framework) - Ideal for building both the UI and the API routes in a single application. It handles server-side rendering, API creation, and static generation well.
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) - For rapid, modern, and responsive UI development. Charting via [Recharts](https://recharts.org/) or [Chart.js](https://www.chartjs.org/) for data visualization.
- **Database:** [PostgreSQL](https://www.postgresql.org/) - Robust relational database.
- **ORM:** [Prisma](https://www.prisma.io/) - For easy database schema management, migrations, and type-safe queries.
- **Authentication:** [NextAuth.js (Auth.js)](https://next-auth.js.org/) - Built-in support for Google OAuth and easy session management.
- **Email Service:** [Resend](https://resend.com/) or [Nodemailer](https://nodemailer.com/) (with SMTP) - For sending the final tallied results.
- **Deployment:** [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/) - To easily containerize the app and database for simple deployment to any VPS.

## Core Features & Requirements

1. **Authentication:**
   - Google Identity Provider (IdP) integration for registered members.
   - Anonymous voting capability (using session cookies or local storage to prevent immediate accidental double voting, though true anonymity doesn't enforce strict uniqueness).
2. **Topic Management:**
   - Authenticated users can create a new voting topic (Question + Options).
   - Everyone sees the active question upon visiting the site.
3. **Voting System:**
   - Users (Logged in or Anonymous) can view the active topic and cast a vote.
   - Votes must be strictly categorized as `AUTHENTICATED` or `ANONYMOUS` in the database.
4. **Tallying & Results:**
   - A mechanism to "close" a vote (e.g., a button for the creator, or an automatic check if all registered members have voted).
   - Post-vote charts displaying results with clear visual distinction (e.g., stacked bar charts or side-by-side bars) between authenticated and anonymous votes.
5. **Notifications:**
   - Upon vote closure, an automated email is triggered containing the tallied results and sent to all users who have registered/logged in via Google.

## Database Schema (Draft)

- **User:** `id`, `email`, `name`, `googleId`, `createdAt`
- **Topic:** `id`, `creatorId`, `question`, `status` (ACTIVE/CLOSED), `createdAt`, `closedAt`
- **Option:** `id`, `topicId`, `text`
- **Vote:** `id`, `topicId`, `optionId`, `userId` (nullable for anonymous), `voterType` (AUTHENTICATED | ANONYMOUS), `createdAt`

## AI Agent Instructions

_Context for the AI Agent working on this project:_

1. Start by initializing a Next.js project with Tailwind CSS and TypeScript.
2. Set up the Prisma schema with PostgreSQL and generate the client. Set up a local `docker-compose.yml` for the database.
3. Configure NextAuth.js for Google OAuth. Add logic to handle anonymous users traversing the site.
4. Build the API routes for creating topics, fetching the active topic, casting a vote, and closing a topic.
5. Build the UI: Login page, Dashboard (Create Topic / Active Topic), Voting Interface, and Results View.
6. Ensure the Results View uses a charting library (like Recharts) to clearly divide "Registered Votes" and "Anonymous Votes".
7. Implement the email notification logic that triggers when a topic is closed, querying all users with an email address.
8. Containerize the application with a production `Dockerfile` and update `docker-compose.yml` for VPS deployment.
9. **CRITICAL:** Always check `steps.md` to see what is next. Every time work is started or finished, update `steps.md` to reflect the current status.
