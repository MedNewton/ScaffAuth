# Configuration

## CLI Flags

- `--yes`: use defaults and skip prompts
- `--template <framework/orm-database>`: stack selection without prompts
- `--no-install`: skip dependency install
- `--no-git`: skip git init
- `--debug`: show debug logs

## Prompted Configuration

Scaffauth configures:
- Framework: Hono, Fastify, Express
- Database: PostgreSQL, MySQL, SQLite
- ORM/query builder: Drizzle, Prisma, Kysely
- OAuth providers
- 2FA
- Email provider (Resend, SendGrid, SMTP)
- RBAC
- Session settings:
  - strategy (`database` or `database-cookie-cache`)
  - session lifetime (`expiresIn`)
  - refresh/update interval (`updateAge`)
  - cookie cache max age

## Generated Environment Variables

Each generated template includes:
- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `CORS_ORIGIN`
- OAuth provider credentials for selected providers
- Email provider credentials when email is enabled
