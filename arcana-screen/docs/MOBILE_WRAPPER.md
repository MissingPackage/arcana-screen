# Lightweight mobile wrapper decision

M4 evaluates a WebView distribution path but does not ship a misleading placeholder binary.

Capacitor is the preferred wrapper because ArcanaScreen already builds to static assets, keeps data local and needs only a narrow native bridge for notifications and file import/export. The PWA remains the primary distribution target.

Before adding the native packages, validate these gates:

- PWA install and offline recovery on Android and iOS.
- Safe-area, keyboard, back-navigation and file-picker behavior.
- Notification permission and background timer behavior.
- A release owner for signing, store privacy declarations and upgrade testing.

If those checks reveal a store-only requirement, add Capacitor with separate Android/iOS projects and keep native plugins behind typed adapters. Otherwise, avoid the maintenance and signing surface.
