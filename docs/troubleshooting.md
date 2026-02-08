# Troubleshooting

## Prompts Fail in Non-Interactive Environments

Error about TTY:
- Use `--yes`, or
- Use `--template <framework/orm-database>`

## Template Not Found

If generation fails with template path issues:

```bash
npm run build
```

Then retry the CLI command.

## Dependency Installation Failed

Run install manually in generated project:

```bash
npm install
# or pnpm install / yarn / bun install
```

## Git Setup Failed

Ensure git is installed and configured:

```bash
git --version
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

## Deployment CLI Missing

Install required CLI:
- Vercel: `npm i -g vercel`
- Railway: `npm i -g @railway/cli`
