# Event Marketplace Backend (Phase 0)

NestJS + Prisma foundation for the event supplier marketplace backend.

## Setup

1. Install dependencies:
   - `npm install`
2. Copy env file:
   - `cp .env.example .env`
3. Generate Prisma client:
   - `npm run prisma:generate`
4. Run migrations:
   - `npm run prisma:migrate`
5. Seed taxonomy:
   - `npm run db:seed`
6. Start API:
   - `npm run start:dev`

## Endpoints

- `GET /v1/health`
- `GET /v1/version`

## Docker Deployment

### Local deployment with Docker Compose

1. Build and start stack:
   - `npm run docker:up`
2. Check logs:
   - `npm run docker:logs`
3. Stop stack:
   - `npm run docker:down`

Services:
- API: `http://localhost:3001`
- Postgres: `localhost:5432`

The API container runs:
- `prisma migrate deploy`
- then starts `node dist/src/main.js`

## Security and runtime hardening

- Configure CORS allowlist via `CORS_ALLOWED_ORIGINS` (comma-separated origins).
- Set strong JWT secrets (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`); in production startup fails if missing.
- Tune in-process rate limiting with:
  - `RATE_LIMIT_WINDOW_MS`
  - `RATE_LIMIT_MAX_REQUESTS`
- Notification worker and provider behavior are controlled by `.env` provider keys.
- Channel providers run independently and simultaneously when configured:
  - Email: SMTP envs (`NOTIFICATION_SMTP_*`)
  - Push: Firebase envs (`FIREBASE_*`)
  - SMS: Twilio envs (`NOTIFICATION_TWILIO_*`)
  - Any missing channel config automatically falls back to mock delivery for that channel only.
