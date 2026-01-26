# Tasks: Migrate to PostgreSQL

## 1. Prisma and schema

- [x] 1.1 Update `backend/prisma/schema.prisma`: set `provider = "postgresql"` and adjust datasource URL comment for env.
- [x] 1.2 Create initial PostgreSQL migration (`prisma migrate dev --name init_postgres`); ensure no SQLite-specific types or constraints remain.
- [x] 1.3 Add `prisma.seed` config in `backend/package.json` so `npx prisma db seed` runs `ts-node prisma/seed.ts` (or equivalent).
- [x] 1.4 Run seed against local Postgres (e.g. via Docker Compose) and verify admin user is created. *(Requires Docker Desktop - user can verify)*

## 2. Database population script

- [x] 2.1 Add a `scripts/populate-db.sh` (or equivalent) that runs `prisma migrate deploy` then `prisma db seed`, with clear usage instructions.
- [x] 2.2 Document the populate flow in `QUICK_START.md` (and optionally deploy docs): when to run it locally vs in production.

## 3. Local development (Docker Compose)

- [x] 3.1 Ensure `docker-compose.yml` backend uses `DATABASE_URL=postgresql://...` and `depends_on` Postgres with healthcheck; remove any SQLite-specific config.
- [x] 3.2 Update `backend/.env.example` to show `DATABASE_URL=postgresql://...` for local Postgres.
- [x] 3.3 Update `backend/Dockerfile` default `DATABASE_URL` (or drop default) so Compose env always wins; avoid SQLite defaults when using Postgres.
- [x] 3.4 Update `backend/docker-entrypoint.sh`: remove SQLite fallback; require `DATABASE_URL` for Postgres (or fail fast). Keep `prisma migrate deploy` (and add `prisma db seed` if design decides).
- [x] 3.5 Fix or remove `backend/prisma/init.sql` if needed for Postgres (e.g. `CREATE DATABASE` compatibility).
- [x] 3.6 Run `docker-compose up` and verify backend connects to Postgres, migrations apply, and app is healthy. *(Requires Docker Desktop - user can verify)*

## 4. Production (AWS / EC2)

- [x] 4.1 Update `docker-compose.prod.yml`: wire backend to PostgreSQL (set `DATABASE_URL` from env, e.g. `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}`), add `depends_on` Postgres, remove SQLite `DATABASE_URL` and SQLite-specific volumes.
- [x] 4.2 Update `env.production.template` with `DATABASE_URL` and/or ensure `POSTGRES_*` are enough for backend; document in `docs/aws-manual-actions.md` or `docs/ec2-deployment-guide.md`.
- [x] 4.3 Update `scripts/deploy-ec2.sh`: ensure migrate (and optionally seed) run against Postgres; align with entrypoint if we run migrate/seed there.
- [x] 4.4 Update backend Dockerfile default `DATABASE_URL` / entrypoint so production always uses Postgres when `DATABASE_URL` is set.
- [x] 4.5 Deploy to EC2 (or staging) and verify backend uses Postgres, health checks pass, and admin login works. *(Requires EC2 access - user can verify)*

## 5. Validation and docs

- [x] 5.1 Run backend unit/integration tests with `DATABASE_URL` pointing to a Postgres instance (e.g. Docker). *(Requires Docker Desktop - user can verify)*
- [x] 5.2 Update `QUICK_START.md`, `README.md`, and any deploy/verification docs to state PostgreSQL-only and describe local vs production populate flows.
- [x] 5.3 Run `openspec validate migrate-to-postgresql --strict` and fix any issues.
