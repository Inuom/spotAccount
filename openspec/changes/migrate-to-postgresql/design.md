# Design: Migrate to PostgreSQL

## Context

- Backend uses **Prisma** with **SQLite** today. Schema, migrations, and seed target SQLite.
- **Docker Compose (local)**: Defines a PostgreSQL service and sets `DATABASE_URL` for the backend to Postgres, but Prisma schema is still SQLite, so migrations and app assume SQLite.
- **Production (EC2)**: `docker-compose.prod` runs a PostgreSQL container (unused); backend uses `file:/app/prisma/prod.db` (SQLite). Deploy script runs `prisma migrate deploy` inside the backend container.
- **Seed**: `backend/prisma/seed.ts` creates initial admin `admin@example.com` / `0000`. It is run manually via `prisma:seed` (or `npx prisma db seed` once configured).

## Goals / Non-Goals

- **Goals**:
  - Use **PostgreSQL everywhere** (local dev, production on EC2).
  - Provide a **single, clear "populate" story**: run migrations, then seed (idempotent where possible).
  - Keep **local** and **production** flows consistent (same DB engine, same Prisma workflow).

- **Non-Goals**:
  - Data migration from existing SQLite databases (out of scope; fresh installs only).
  - Running Prisma against multiple DBs (e.g. SQLite + Postgres) in one codebase.

## Decisions

### 1. Populate = Migrate + Seed

- **Populate** means: apply schema (migrations) then run seed.
- **Migrations**: `npx prisma migrate deploy` (or `prisma migrate dev` for local dev).
- **Seed**: `npx prisma db seed` (run after migrations). Seed remains idempotent (e.g. skip creating admin if already present).
- A **"populate" script** can be a small shell script or documented steps that run migrate then seed. No new tooling required.

### 2. PostgreSQL-Only Prisma Schema

- Switch `schema.prisma` datasource to `provider = "postgresql"`.
- Add a **new initial PostgreSQL migration**; do not reuse SQLite migrations. Prisma migration history will be PostgreSQL-only from here on.

### 3. Local Development (Docker Compose)

- Use existing `docker-compose.yml`: PostgreSQL service + backend with `DATABASE_URL=postgresql://...`.
- Ensure backend `depends_on` Postgres (with healthcheck). Entrypoint runs `prisma migrate deploy` then starts the app.
- Developers can run a **local populate** via: `docker-compose up -d postgres` → `prisma migrate deploy` + `prisma db seed` (from host or backend container), or a single documented "populate" flow.

### 4. Production (EC2)

- **Backend** uses **PostgreSQL** only: `DATABASE_URL` points to the Postgres container (e.g. `postgresql://user:pass@postgres:5432/spotaccount`).
- **`docker-compose.prod`**: Backend `depends_on` Postgres; backend env uses `DATABASE_URL` from `.env.production` (or derived from `POSTGRES_*`). Remove SQLite `file:` URL and backend volume for SQLite.
- **Deploy**: Postgres starts first; backend entrypoint runs `prisma migrate deploy` (and optionally `prisma db seed` for fresh installs). Deploy script may additionally run migrate/seed if we want an explicit step; otherwise entrypoint is enough.

### 5. Init Script and DB Creation

- `backend/prisma/init.sql` currently uses `CREATE DATABASE IF NOT EXISTS spotaccount`. PostgreSQL supports `IF NOT EXISTS` (9.5+). The Postgres image creates `POSTGRES_DB` from env; init scripts run in default DB. We can keep `init.sql` for extra assurance or remove it if redundant. Prefer **keeping** it for clarity, and ensure it is compatible with Postgres (no MySQL-specific syntax).

### 6. Environment and Secrets

- **Local**: `docker-compose` injects `DATABASE_URL` for backend; no `.env` required for default compose.
- **Production**: `.env.production` (from `env.production.template`) provides `POSTGRES_*` and, where used, `DATABASE_URL`. Backend and deploy use these. No secrets in repo.

## Risks / Trade-offs

- **No SQLite fallback**: Dropping SQLite simplifies stack but removes a zero-setup option. Mitigation: Docker Compose makes local Postgres straightforward; docs clearly state PostgreSQL-only.
- **Seed on every deploy**: Running seed after migrate is idempotent (admin exists check). We can run it on every deploy or only when explicitly requested (e.g. "fresh install" flag). Default: run after migrate in entrypoint for fresh installs; optional in deploy script.

## Migration Plan

1. **Schema and migrations**: Update Prisma to PostgreSQL; add initial Postgres migration; remove SQLite-specific bits.
2. **Seed**: Ensure seed works with Postgres; add `prisma.seed` config in `package.json` if missing.
3. **Populate script/docs**: Add a small script or documented steps (migrate → seed) and mention in `QUICK_START` / deploy docs.
4. **Local**: Align `docker-compose.yml`, backend Dockerfile/entrypoint, and `.env.example` with Postgres.
5. **Production**: Update `docker-compose.prod`, `env.production.template`, deploy script, and backend image to use Postgres.
6. **Validation**: Run local `docker-compose up` and verify backend uses Postgres; run deploy and verify production uses Postgres.

## Open Questions

- **Seed on deploy**: Always run `prisma db seed` after `migrate deploy` in entrypoint, or only when a specific env var (e.g. `RUN_SEED=true`) is set? Proposal: **always** run seed; it’s idempotent and ensures admin exists on fresh installs.
