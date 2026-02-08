# create-scaffauth

Scaffold production-ready Better Auth backends in minutes.

`create-scaffauth` generates standalone auth backend projects with:
- Frameworks: Hono, Fastify, Express
- Databases: PostgreSQL, MySQL, SQLite
- ORMs/query builders: Drizzle, Prisma, Kysely
- Auth features: email/password, OAuth providers, 2FA, email providers, RBAC
- Optional GitHub repo creation and deployment (Vercel/Railway)

## Quick Start

```bash
npx create-scaffauth
```

Or run non-interactively with defaults:

```bash
npx create-scaffauth --yes
```

Use a specific template directly:

```bash
npx create-scaffauth --template hono/drizzle-postgres
```

## CLI Usage

```bash
create-scaffauth [options] [command]
```

Default command: `init`

Options:
- `-y, --yes`: skip prompts and use defaults
- `--no-install`: skip dependency installation
- `--no-git`: skip git initialization
- `-t, --template <template>`: use `framework/orm-database` format
- `-d, --debug`: enable debug output
- `-h, --help`: show help
- `-V, --version`: show version

Examples:
- `create-scaffauth --template fastify/prisma-mysql --no-install`
- `create-scaffauth init --yes --no-git`

## Generated Project

A generated project includes:
- `src/index.ts`: API server entrypoint
- `src/auth.ts`: Better Auth configuration
- Database files for selected ORM/database
- `.env.example`: required environment variables
- `README.md`: stack-specific setup guide

## Requirements

- Node.js `>=18`
- npm/pnpm/yarn/bun
- Optional for integrations:
  - `git` for repository init/push
  - `gh` CLI or GitHub token for GitHub repo automation
  - `vercel` CLI for Vercel deployment
  - `railway` CLI for Railway deployment

## Development

```bash
npm install
npm run lint
npm run typecheck
npm test
npm run build
```

## License

MIT
