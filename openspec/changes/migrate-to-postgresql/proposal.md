# Change: Migrate to PostgreSQL

## Why

The application currently uses SQLite for development and production. The project intends to use PostgreSQL for robustness, concurrency, and alignment with the infrastructure spec (PostgreSQL container on EC2). To complete the migration, we need a clear path to populate the database, use PostgreSQL locally, and use it in AWS production.

## What Changes

- **Database provider**: Prisma schema switches from SQLite to PostgreSQL; new migrations replace SQLite-specific ones.
- **Population script**: A documented, reproducible process (migrate + seed) to populate the database. The existing seed creates the initial admin; we formalize "populate" as migrations then seed.
- **Local development**: Docker Compose already defines PostgreSQL and wires the backend to it; we ensure schema, migrations, and env align so the backend uses PostgreSQL locally.
- **Production (AWS/EC2)**: Backend uses the PostgreSQL container instead of SQLite. `docker-compose.prod` and deploy flow are updated so the backend connects via `DATABASE_URL` to Postgres, and migrations (and optionally seed) run as part of deployment.
- **BREAKING**: SQLite is no longer supported. All environments use PostgreSQL.

## Impact

- **Affected specs**: `infrastructure`
- **Affected code**: `backend/prisma/schema.prisma`, `backend/prisma/seed.ts`, `backend/Dockerfile`, `backend/docker-entrypoint.sh`, `docker-compose.yml`, `docker-compose.prod.yml`, `scripts/deploy-ec2.sh`, `env.production.template`, `backend/.env.example`, docs (e.g. `QUICK_START.md`, `docs/ec2-deployment-guide.md`).
