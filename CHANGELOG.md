# Changelog

All notable changes follow [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and semantic versioning.

## [Unreleased]

### Changed

- Release candidates must pass the automated quality, accessibility, security and browser gates.

## [1.0.0-rc.1] — 2026-07-13

### Added

- Screen lifecycle, Prepare/Run modes, session Focus views and local-first recovery.
- Keyboard alternatives for layout operations, skip navigation, visible focus and touch-target rules.
- Chrome, Firefox, Safari/WebKit and mobile smoke tests with automated WCAG checks.
- Performance budgets, dependency scanning, security headers and an explicit privacy policy.
- Preview/staging artifacts, tagged production deployment and documented rollback/hotfix procedures.

### Security

- Updated the dependency graph to remove known npm audit findings at release-candidate creation.
- Added CSP, framing protection, restrictive permissions policy and referrer controls for supported hosts.

[Unreleased]: https://github.com/MissingPackage/arcana-screen/compare/v1.0.0-rc.1...HEAD
[1.0.0-rc.1]: https://github.com/MissingPackage/arcana-screen/releases/tag/v1.0.0-rc.1
