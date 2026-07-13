# ArcanaScreen

ArcanaScreen is a local-first virtual screen for tabletop game masters. It combines configurable Prepare layouts with a protected Run workspace for notes, quick capture, references, dice, timers and initiative. No backend or account is required; browser storage and portable JSON backups keep the user in control.

## Development

Requires Node.js 22 and npm.

```bash
npm ci
npm run dev
```

The production quality gate is:

```bash
npm run test:ci
npm run check:security
npm run test:e2e
```

`test:ci` builds the app, runs ESLint including JSX accessibility rules, runs Vitest and enforces the JS/CSS budgets. Playwright covers Chromium, Firefox, WebKit and a 390×844 mobile project. Install local browser binaries with `npx playwright install`; CI installs browser-specific host dependencies automatically.

## Release

Versioning follows semantic versioning. The GitHub workflows create immutable preview/staging artifacts and deploy an accepted `v*` tag to GitHub Pages. Do not tag a candidate until all quality and browser jobs are green.

- [User guide](../docs/USER_GUIDE.md)
- [Release and rollback runbook](../docs/RELEASE_RUNBOOK.md)
- [Security policy](../SECURITY.md)
- [Privacy policy](public/privacy.html)
- [Changelog](../CHANGELOG.md)

## Data and privacy

Screens and preferences stay in local storage. The runtime includes no analytics, advertising SDK or automatic error reporting. Data leaves the browser only when the user opens an external link or explicitly exports and shares a backup.
