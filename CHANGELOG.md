# Changelog

All notable project changes should be recorded in this file.

This repo uses a simple rule: when code changes, documentation changes with it. Add new entries to the `Unreleased` section while work is in progress, then cut a dated section when you want to snapshot a release or milestone.

## Unreleased

- Completed the missing backend runtime wiring so `backend/server.js` now starts the Express API and serves the built frontend through the same production server.
- Added the missing backend package dependencies for Express, Prisma, JWT auth, Cloudinary uploads, validation, and security middleware.
- Improved backend readiness with JWT error handling, upload file-type validation, graceful shutdown, and multi-origin CORS support.
- Rewrote the README to document backend setup, env configuration, Prisma migrations, admin seeding, API routes, and deployment.
- Moved backend-owned files into `backend/` and updated server, Prisma, lint, and env paths to match the new structure.
- Documentation workflow established so README and changelog stay in sync with future code changes.
- Refined the About and Mission section spacing and removed the bottom divider for a cleaner presentation.
- Fixed Render deployment support by adding a production Node server that serves the built app on `0.0.0.0:$PORT` with SPA fallback routes.

## 2026-04-05

### Added

- Initial MS frontend scaffold with landing page, auth routes, protected dashboard shell, and reusable layout structure.
- Project documentation for setup, architecture, routes, and maintenance workflow.

### Notes

- Authentication currently uses mock frontend state stored in local storage.
- Dashboard metrics and activity are powered by mock data.
