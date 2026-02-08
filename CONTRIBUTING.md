# Contributing to create-scaffauth

Thanks for contributing.

## Development Setup

1. Install dependencies:
```bash
npm install
```
2. Run quality checks:
```bash
npm run lint
npm run typecheck
npm test
```
3. Build the CLI:
```bash
npm run build
```

## Local CLI Testing

Run the built CLI:

```bash
node dist/index.js --help
node dist/index.js init --yes --no-install --no-git
```

Run template mode:

```bash
node dist/index.js init --template hono/drizzle-postgres --no-install --no-git
```

## Pull Request Guidelines

- Keep changes focused and small.
- Update tests for behavior changes.
- Update `PROGRESS.md` when roadmap status changes.
- Keep TypeScript strict and lint-clean.

## Commit Guidance

- Use clear commit messages.
- Mention impacted area (CLI, templates, deployers, docs, tests).
