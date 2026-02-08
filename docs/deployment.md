# Deployment

## Vercel

From prompts, choose deploy and select Vercel.

Requirements:
- `vercel` CLI installed
- authenticated (`vercel login`)

Scaffauth will:
- write `vercel.json`
- run `vercel --prod --yes`

## Railway

From prompts, choose deploy and select Railway.

Requirements:
- `railway` CLI installed
- authenticated (`railway login`)

Scaffauth will:
- run `railway init`
- provision PostgreSQL plugin when DB is PostgreSQL
- run `railway up --detach`

## Manual Deployment

If deployment fails, deploy manually inside the generated project directory using your platform CLI and set environment variables from `.env.example`.
