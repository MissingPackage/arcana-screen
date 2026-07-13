# Web release runbook

## Supported release lanes

| Lane       | Trigger                                                | Artifact or URL                                   | Purpose                      |
| ---------- | ------------------------------------------------------ | ------------------------------------------------- | ---------------------------- |
| Preview    | Manual `Release web app` workflow                      | Immutable workflow artifact                       | Product and QA review        |
| Staging    | Manual workflow with the `staging` environment         | Immutable workflow artifact                       | Release-candidate acceptance |
| Production | Signed/approved `v*` tag or manual production dispatch | GitHub Pages deployment and GitHub release assets | Public web release           |

Configure required reviewers for the `staging`, `production` and `github-pages` GitHub environments. GitHub Pages must use **GitHub Actions** as its source.

## Browser and viewport contract

The release matrix covers current stable Chromium, Firefox and WebKit/Safari engines at 1280×720 plus Chromium mobile at 390×844. The 640 CSS-pixel reflow check represents a 1280-pixel desktop viewport at 200% zoom. A release is blocked by horizontal document overflow, an inaccessible core control or an automated WCAG 2.2 A/AA violation.

## Performance budgets

- Any emitted JavaScript bundle: at most 500 KiB uncompressed.
- Any emitted CSS bundle: at most 100 KiB uncompressed.
- Local preview DOMContentLoaded: under 3 seconds in the browser matrix.
- Prepare → Run response: under 1 second in the browser matrix.

`npm run check:budget` enforces asset budgets after build. Playwright enforces startup and interaction budgets. Revisit a budget only with a written changelog entry and measured evidence.

## Candidate procedure

1. Update `arcana-screen/package.json` and `CHANGELOG.md` using semantic versioning.
2. Run `npm ci`, `npm run test:ci`, `npm run check:security` and `npm run test:e2e`.
3. Dispatch Preview. Download the tarball and verify its SHA-256 file.
4. Dispatch Staging and complete the manual acceptance matrix in `docs/specs/acceptance-matrix.md`.
5. Create an annotated tag such as `v1.0.0-rc.1` from the accepted commit and push it.
6. Verify the production URL, privacy page, local persistence, CSP and one export/import round trip.
7. Record the result and any migration note in the changelog.

## Rollback

1. Declare the incident and stop further production approvals.
2. Identify the last known-good tag and download its immutable `arcana-screen-web.tar.gz` plus checksum.
3. Verify `sha256sum -c arcana-screen-web.tar.gz.sha256`.
4. Create a branch from the known-good tag, dispatch the Production workflow for that ref, and verify the Pages URL.
5. Do not clear or rewrite browser storage as part of rollback. If a schema regression exists, ship a forward-compatible migration or recovery build.
6. Add an incident note to the changelog and open a follow-up issue.

## Hotfix

Branch from the production tag using `fix/<issue>-<description>`, make the smallest compatible correction, run the full quality and browser gates, then release the next patch or release-candidate tag. Never bypass data migration or backup tests for urgency.

## Security and privacy checks

The quality workflow runs complete and production-only npm audits; Dependabot covers npm and Actions. Hosting headers are encoded in `public/_headers` and `netlify.toml`, while the HTML CSP provides a baseline on hosts such as GitHub Pages that cannot set custom response headers. Runtime tests fail if the ordinary core flow sends a cross-origin request.
