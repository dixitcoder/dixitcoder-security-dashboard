# DixitCoder Security Dashboard

A large Vue 3 and TypeScript dashboard project that brings workspace dashboards, account screens, reusable UI, developer utilities, system diagnostics, and security-tool interfaces into one application.

> **Public-repository scope:** this repository contains the frontend source and its visual assets. The backend/API source is intentionally not published here. The project is therefore a substantial UI preview, not a complete standalone deployment: authentication, user management, and API-powered tools need a separately operated backend.

## Project at a glance

- **62 route definitions** in the Vue Router, including public sign-in/sign-up and fallback routes.
- **59 Vue view files** covering dashboards, tools, forms, charts, and account pages.
- **56 reusable Vue components** for layouts, navigation, charts, tables, forms, and common UI.
- A Vite-powered Vue 3 + TypeScript frontend with a modular, lazy-loaded route structure.

Counts describe the current source tree; they are not a claim that every screen or service is fully operational.

## Visual preview

The shared browser session currently shows the sign-in page. An authenticated dashboard screenshot is not included because it requires a valid local account.

![DixitCoder Security Dashboard sign-in screen](./public/images/readme-signin-preview.png)

## What's inside

### Dashboards and workspace

- Main workspace dashboard with API status, recent navigation, saved activity, and quick-launch areas.
- Security overview and security-center screens.
- Search/navigation, theme preferences, profile, calendar, and settings interfaces.

### Network and security interfaces

- IP information, ping sweep, port/service scanner, network mapper, and scan-history screens.
- Traceroute, GeoIP, packet-capture, bandwidth, router, and network-statistics interfaces.
- WHOIS, DNS records, DNS privacy, SSL/TLS, HTTP security headers, firewall, and website-monitor screens.
- Web-scan and vulnerability-scan interfaces.

These are frontend interfaces. Their presence does not mean an API is available or that every function has been tested. Use security and network features only on systems for which you have explicit authorization.

### System and developer utilities

- System information, CPU monitoring, process listing, ARP, port-forwarding, and file-integrity screens.
- Base64, hash, JSON-formatting, regular-expression, and API-diagnostics interfaces.
- Image-analysis, charts, tables, form elements, and a set of reusable UI-element examples.

### Shared frontend building blocks

- Responsive admin and full-screen layouts with sidebar/header navigation.
- Reusable form controls, modals, alerts, badges, tables, and profile cards.
- Chart widgets, dashboard cards, image components, theme controls, and route-aware breadcrumbs.
- Client-side preferences for recently visited pages, favorites, and scan history.

## Technology

- Vue 3, TypeScript, Vue Router, and Vuex
- Vite and Tailwind CSS
- Axios for frontend API requests
- ApexCharts and reusable chart components

## Run the frontend preview

Requirements: Node.js 18 or later and npm.

```bash
npm install
npm run frontend
```

Open the local address printed by Vite (typically `http://127.0.0.1:5173`). You can inspect the public sign-in/sign-up screens and frontend assets. Protected pages redirect to sign-in unless a separately configured backend recognizes a valid session.

Create and type-check the frontend production build with:

```bash
npm run build
```

To preview the generated build locally:

```bash
npm run preview
```

## Backend and service availability

This public repository does **not** contain the server/API source. Cloning it alone cannot start the API, authenticate users, manage accounts, or run API-backed tools. A separately operated backend must provide the API routes expected by the frontend and be configured for the frontend origin.

A backend health endpoint may report that its process is reachable; this alone does not verify each route, integration, or feature. The frontend build passing likewise verifies compilation, not end-to-end service behavior.

## Privacy and responsible use

- Never publish `.env`, credentials, session secrets, password hashes, user records, or uploaded files.
- Do not expose an unreviewed development server to the internet.
- Only test systems and data you own or have explicit permission to assess.

## Third-party notices

This project is customized from an existing Vue dashboard template and includes third-party components and assets. Retain applicable notices and comply with the licenses of all included work.
