# Reddit Launch Post Draft

Title:
I built `create-scaffauth`: an open-source CLI to scaffold Better Auth backends

Body:

I built an OSS CLI called `create-scaffauth` to reduce auth backend setup time.

It scaffolds production-ready Better Auth backends with:
- Hono / Fastify / Express
- PostgreSQL / MySQL / SQLite
- Drizzle / Prisma / Kysely
- OAuth, 2FA, email verification, RBAC, and session settings

Optional extras:
- GitHub repo setup
- Vercel or Railway deployment

You can try it with:

```bash
npx create-scaffauth
```

Feedback on DX, generated structure, and missing features is welcome.
