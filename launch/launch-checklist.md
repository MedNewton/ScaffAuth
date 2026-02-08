# Launch Checklist

## Pre-Launch

- [ ] Finalize package metadata and version
- [ ] Run `npm run lint && npm run typecheck && npm test && npm run build`
- [ ] Run `npm pack --dry-run` and verify package contents
- [ ] Ensure `README.md` and `LICENSE` are present

## Publish

- [ ] `npm login`
- [ ] `npm publish --access public`
- [ ] Verify install: `npx create-scaffauth@latest --help`

## Announcement

- [ ] Publish launch thread on X
- [ ] Submit Product Hunt listing
- [ ] Post Reddit launch message
- [ ] Share in developer communities

## Post-Launch

- [ ] Monitor npm downloads
- [ ] Triage incoming issues quickly
- [ ] Collect first-user feedback and prioritize fixes
