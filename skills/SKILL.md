---
name: scaffauth-skill
description: Use this skill when the user wants to scaffold a Better Auth backend with create-scaffauth, choose framework/database/ORM/auth options, or generate/review the exact CLI command and post-generation steps.
---

# Scaffauth Skill

## When to Use

Use this skill when a request is about:
- creating a new auth backend with `create-scaffauth`
- choosing stack options (framework, database, ORM)
- enabling auth features (OAuth, 2FA, email provider, RBAC, session settings)
- using CLI flags (`--yes`, `--template`, `--no-install`, `--no-git`, `--debug`)
- troubleshooting generated project startup or deployment

## Core Workflow

1. Clarify desired stack and features.
2. Build the command:
   - interactive: `npx create-scaffauth`
   - defaults: `npx create-scaffauth --yes`
   - direct stack: `npx create-scaffauth --template <framework/orm-database>`
3. Generate follow-up steps:
   - `cd <project-name>`
   - `cp .env.example .env`
   - set required environment variables
   - run DB command (`db:push` or ORM-specific migration)
   - run `dev`
4. If deployment requested, include platform-specific notes for Vercel or Railway.

## Supported Stack Matrix

- Frameworks: `hono`, `fastify`, `express`
- ORMs/query builders: `drizzle`, `prisma`, `kysely`
- Databases: `postgres`, `mysql`, `sqlite`
- Template format: `<framework>/<orm>-<database>`
  - Example: `hono/drizzle-postgres`

## Auth Feature Guidance

- OAuth: choose providers needed by product scope only.
- 2FA: enable for dashboards/admin surfaces.
- Email provider:
  - `resend` for fast setup
  - `sendgrid` for enterprise-grade sending
  - `smtp` for custom infrastructure
- RBAC: enable when role/permission boundaries are required.
- Session config:
  - strategy: `database` or `database-cookie-cache`
  - tune `expiresIn`, `updateAge`, and cookie cache max age for UX vs security.

## Troubleshooting Playbook

- Non-interactive environment: use `--yes` or `--template`.
- Template format error: enforce `framework/orm-database`.
- Missing templates/build artifacts: run `npm run build`.
- Install failure: install dependencies manually in generated project.
- Git/deploy CLI not available: provide install commands and manual fallback.
