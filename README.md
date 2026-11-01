# DixitCoder Security Dashboard UI

A Vue 3 and TypeScript dashboard interface for DixitCoder security tools. This public repository contains the **frontend UI only**; the backend and its scanning, OSINT, authentication, and account-management APIs are intentionally not included.

## What makes the UI useful

- A modular dashboard built with Vue 3, TypeScript, and Vue Router.
- Reusable dashboard components, charts, and responsive layouts.
- A frontend structure that can be configured to connect to a separately operated API.

This repository does not provide a working backend. Sign-in, user management, and API-powered tools will not function without a separately configured backend service.

## Technology

- Vue 3, TypeScript, and Vue Router
- Vite and Tailwind CSS
- ApexCharts and related dashboard components

## Local frontend development

Requirements: Node.js 18 or later and npm.

```bash
npm install
npm run frontend
```

Open the local URL printed by Vite. To create and preview a production frontend build:

```bash
npm run build
npm run preview
```

The UI expects its API to be configured separately. Do not expose a backend or use security utilities against systems without explicit authorization.

## Privacy and responsible use

- Never publish `.env`, credentials, session secrets, password hashes, or personal account data.
- User records and uploaded files are private data and do not belong in this public repository.
- Only assess systems for which you have explicit authorization.

This dashboard UI is customized from an existing Vue dashboard template. Retain applicable third-party notices and comply with the licenses for included components and assets.
