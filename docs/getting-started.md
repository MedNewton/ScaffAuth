# Getting Started

## Prerequisites

- Node.js 18+
- npm, pnpm, yarn, or bun

## Create a New Project

```bash
npx create-scaffauth
```

## Fast Path

Use defaults:

```bash
npx create-scaffauth --yes
```

Select a stack directly:

```bash
npx create-scaffauth --template hono/drizzle-postgres
```

## After Generation

```bash
cd <project-name>
cp .env.example .env
# set DATABASE_URL and provider credentials
npm run db:push
npm run dev
```

Your auth server will run on `http://localhost:3000`.
