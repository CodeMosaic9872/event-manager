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
- then starts `node dist/main.js`
