# DixitCoder Security Dashboard

A Vue-based dashboard that brings account administration and security-oriented utilities together in one interface. It combines a modern web UI with a server-side API and is intended for learning, development, and authorized security work.

## What makes it useful

- **One place to work:** a dashboard interface for viewing and using the project's available utilities.
- **Modular design:** frontend pages and backend API routes are separated, making the project easier to maintain and extend.
- **Account controls:** authenticated sessions and administrator-focused user management are included.
- **Broad technical foundation:** the project combines a responsive Vue interface with a Node.js/Express backend.
- **Security and network diagnostics:** the codebase includes diagnostic and inspection features. Use them only on systems and data you own or have explicit permission to assess.

Some capabilities are experimental or intentionally disabled. Availability may vary by configuration.

## Technology

- Vue 3, TypeScript, and Vue Router
- Vite and Tailwind CSS
- Node.js and Express
- ApexCharts and related dashboard components

## Privacy and responsible use

- Never publish `.env`, credentials, session secrets, password hashes, or personal account data.
- Keep `server/data/users.json` and files in `server/uploads/` out of any public repository. Uploaded files may contain personal information.
- Do not expose a development server or security utility to the internet without a separate security review and appropriate access controls.
- Only assess systems for which you have explicit authorization. Do not use the project to access, scan, or collect information from third-party systems without permission.

This dashboard is customized from an existing Vue dashboard template. Retain applicable third-party notices and comply with the licenses for included components and assets.
# dixitcoder-security-dashboard
