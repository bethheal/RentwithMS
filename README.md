# MS Frontend

MS is a frontend rental management experience built with React, Vite, React Router, and Tailwind CSS. The current app ships a marketing landing page, auth flows backed by local mock state, and a protected dashboard shell ready for real API integration.

## What Is Included

- Responsive landing page with modular home sections
- Login and sign-up flows using local storage backed demo auth
- Protected dashboard route with mock activity, stats, and task data
- Shared layout system for marketing, auth, and app screens
- Reusable UI primitives, navigation, and reveal animations

## Tech Stack

- React 19
- Vite
- React Router DOM
- Tailwind CSS v4
- Lucide React
- ESLint

## Getting Started

### Requirements

- Node.js 20+
- npm 10+

### Install And Run

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal after the dev server starts.

## Available Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Current App Behavior

### Routes

- `/` renders the marketing landing page
- `/login` renders the guest-only login screen
- `/signup` renders the guest-only registration screen
- `/dashboard` renders the protected dashboard shell
- `*` renders the not-found screen

### Demo Authentication

Authentication is currently frontend-only. User data is stored in `localStorage` under `MS-auth-user`, and the auth context exposes `login`, `register`, and `logout` helpers for the demo flows.

### Data Sources

- Landing page content is configured directly in the home page module
- Dashboard cards and activity feed use mock data from `src/data/mockApi/dashboard.js`

## Project Structure

```text
src/
  assets/
  components/
    cards/
    common/
    navigation/
    sections/
  context/
  data/
    mockApi/
  hooks/
  layouts/
  pages/
    auth/
    dashboard/
    home/
    not-found/
  routes/
  utils/
docs/
  MAINTENANCE.md
CHANGELOG.md
```

## Architecture Notes

- `src/layouts/` contains route-level shells such as `MainLayout`, `AuthLayout`, and `DashboardLayout`.
- `src/components/sections/` contains the landing page sections used by the home route.
- `src/components/common/` holds shared UI primitives and app helpers.
- `src/context/` manages shared state such as authentication and app shell behavior.
- `src/data/mockApi/` keeps demo payloads shaped like future backend responses.
- `src/hooks/` contains reusable UI utilities such as scroll reveal and body scroll locking.

## Documentation Workflow

Documentation is treated as part of the work, not a follow-up task.

- Update `CHANGELOG.md` whenever code or project setup changes
- Update this `README.md` when routes, setup steps, architecture, or scripts change
- Review `docs/MAINTENANCE.md` before larger updates

## Suggested Next Steps

- Replace mock auth and dashboard data with real backend endpoints
- Add form validation and submission handling for auth flows
- Connect the blog and FAQ content to a CMS or API when content ownership is defined
- Add tests around routing, auth guards, and critical UI states
