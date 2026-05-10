# OpenSSL is required for Prisma engine detection; prisma CLI must be in production deps for migrate deploy.

FROM node:20-bookworm-slim AS deps
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-bookworm-slim AS build
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate && npm run build

FROM node:20-bookworm-slim AS runtime
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

# prisma migrate / engine cache may write under node_modules; non-root user must own /app
RUN chown -R node:node /app

USER node
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3001/v1/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Schema sync: this repo historically used `db push` (no prisma/migrations). `migrate deploy` on a
# non-empty DB with no migration history fails with P3005 — see https://pris.ly/d/migrate-baseline
# When you commit real migrations, switch to: npx prisma migrate deploy
CMD ["sh", "-c", "npx prisma db push && node dist/src/main.js"]
