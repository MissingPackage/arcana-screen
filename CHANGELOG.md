# Changelog

All notable changes follow [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and semantic versioning.

## [Unreleased]

### Added

- Advanced per-device canvas layouts with focus, sidecar, continuous drag/resize, second-monitor and pop-out views.
- Screen folders, tags, archive, cross-screen search, personal templates and reusable reference packs.
- Dice and timer presets, desktop timer notifications, richer notes, advanced CSV tables and a threshold Resource Counter.
- Installable PWA assets, offline runtime caching, storage quota controls, compact density, accent themes and EN/IT shell localization.
- An explicit threat/conflict model that keeps optional cloud sync disabled until its activation gates are approved.

### Changed

- Adopted the canonical design-token layer from the Claude Design project (`src/styles/tokens.css`): colors, typography, spacing, elevation and motion now flow from one `--as-*` source consumed by both the Run cockpit and the Prepare shell.
- Body typeface switched from Inter to Work Sans per the design system (Cinzel unchanged); fonts remain self-hosted via `@fontsource` (CSP `font-src 'self'`).
- Release candidates must pass the automated quality, accessibility, security and browser gates.

### Fixed

- WebKit/Safari rendered a blank app on any plain-HTTP host (local preview, the e2e suite): unlike Chromium/Firefox, WebKit applies `upgrade-insecure-requests` to localhost subresources, so every asset request failed its TLS handshake. The directive now lives only in the production `_headers` file; with all assets same-origin relative, HTTPS deployments lose nothing. The WebKit e2e lane passes for the first time (8/8 + 1 skip).
- `--as-wine` and `--as-display` were referenced but never defined: the capture "Review N" badge background was invisible and review/source accents fell back to inherited ink. They now map to the token layer (with a dark-theme lift for the wine accent).
- Dark theme: eyebrows/section labels now lift to `#f0c463` and several popovers (oracle, party glance) use dark surfaces instead of leftover light parchment.
- Portable backups now include M4 templates, reference packs and appearance preferences while still accepting schema 1 files.
- Dark theme: the initiative, batch-initiative, mint-NPC and add-combatant inputs kept a hardcoded white background under parchment-cream ink (~1.35:1, unreadable). They now use the raised-surface token (`--as-surface-raised`), identical in light theme and 10.2:1 in dark.

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
