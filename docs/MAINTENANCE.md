# Maintenance Guide

This project expects documentation to be updated alongside code. Treat the items below as part of the definition of done for every meaningful change.

## Update Checklist

1. Add or revise an entry in `CHANGELOG.md`.
2. Update `README.md` if setup, scripts, routes, features, or architecture changed.
3. Update any nearby inline comments or mock data docs if the data shape changed.
4. Run the relevant verification step, usually `npm run build` and `npm run lint`.
5. Commit code and documentation together when possible.

## When To Update Which File

- Update `README.md` for onboarding, setup, route, script, or architecture changes.
- Update `CHANGELOG.md` for every shipped feature, fix, refactor, or repo setup change.
- Update component-level comments only when they explain behavior that is not obvious from code.

## Initial Repository Conventions

- Do not commit `node_modules/` or `dist/`.
- Keep docs concise and accurate.
- Prefer documenting real behavior over planned behavior.
