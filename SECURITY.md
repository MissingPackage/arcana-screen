# Security policy

## Supported version

Security fixes target the latest published release candidate or stable release. Older local builds are not maintained.

## Reporting

Do not open a public issue for an exploitable vulnerability or attach campaign data. Use GitHub's private vulnerability reporting for `MissingPackage/arcana-screen`. If private reporting is unavailable, open a minimal issue asking the maintainers for a private contact channel without disclosing the vulnerability.

Include the affected version, browser, reproduction conditions and expected impact. The release owner triages reports within three working days, documents mitigations and uses the hotfix lane described in `docs/RELEASE_RUNBOOK.md`.

## Trust boundary

ArcanaScreen is a static local-first web app. User content belongs in browser storage and portable backups. No account, analytics or error-reporting service is required. External rules links and GitHub feedback leave this boundary and are visibly presented as external navigation.
