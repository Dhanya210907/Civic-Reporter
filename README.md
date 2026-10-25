# Swachh Bharat Complaint System

### A Software Engineering Project for Community Cleanliness and Civic Issue Reporting

The **Swachh Bharat Complaint System** is a social-impact software engineering project that explores how mobile technology can help people report local cleanliness and civic problems and follow their progress. Its companion mobile app is currently named **Civic Reporter**.

The idea is inspired by the cleanliness goals of Swachh Bharat. Residents can create reports about issues such as overflowing garbage, potholes, water leaks, and broken streetlights. A demo admin view can review reports and update their status. This is a project prototype; it is not an official Government of India or municipal service and is not connected to civic authorities.

## Social problem and proposed solution

Local cleanliness and infrastructure problems are easier to act on when residents can describe the issue, identify where it is happening, and see whether it has been addressed. This project prototypes a simple digital process for capturing those reports and showing their status:

1. A resident creates a report with its category, description, address, and ward.
2. The report appears in a complaint list with a status.
3. A demo administrator reviews the report and can update its status and add a note.
4. The resident can review the report and see in-app activity derived from those updates.

The current implementation demonstrates this workflow on one device. It does not transmit complaints to a real city or council.

## Features in the prototype

- Citizen registration, sign-in, and profile screens
- Reports for garbage, potholes, water leaks, streetlights, drainage, transformers, dead animals, and other issues
- Complaint list and detail screens
- Statuses for `Pending`, `In progress`, `Resolved`, and `Rejected`
- Demo admin dashboard with status filters and report updates
- In-app activity items for report submissions and status changes
- Sample complaints on first launch
- Community events screen scaffold for future event listings

## Technologies used

| Technology | Role in the project |
| --- | --- |
| Expo SDK 57 | React Native app runtime and native device integrations |
| React Native 0.86 and React 19 | Cross-platform mobile interface |
| TypeScript | App screens, data models, and component types |
| Expo Router | File-based navigation for citizen and admin flows |
| AsyncStorage | On-device persistence for demo accounts and complaint data |
| TanStack Query | Query client provider configured at the app root; current account and complaint flows use local state |
| Expo and React Native modules | Haptics, gradients, Inter fonts, icons, safe areas, and gesture/keyboard handling |
| pnpm workspaces | Dependency and package management across the monorepo |
| EAS Build | Cloud builds, including the Android APK preview profile |

## Project structure

```text
artifacts/
  civic-reporter/   Expo mobile app
  api-server/       Separate API server workspace package; not connected to the mobile app yet
  mockup-sandbox/   UI mockup workspace artifact
lib/                Shared workspace packages
pnpm-lock.yaml      Locked dependency versions for the workspace
pnpm-workspace.yaml Workspace configuration
```

## Run the app locally

Install Node.js and pnpm. From the repository root, install the workspace dependencies:

```bash
pnpm install
```

Then start Expo from the mobile app directory:

```bash
cd artifacts/civic-reporter
pnpm exec expo start
```

Open the QR code with an Expo Go version compatible with SDK 57. If Expo Go on your device is incompatible, use a compatible client or build and install the Android APK below.

## Build an Android APK

The `preview` profile in `artifacts/civic-reporter/eas.json` is configured to produce an installable APK through EAS Build:

```bash
cd artifacts/civic-reporter
npx eas-cli login
npx eas-cli build --platform android --profile preview
```

The app is currently linked to the maintainer's Expo project. If you are building a fork under your own Expo account, link it to a project you control with `npx eas-cli init` before building. To share an APK broadly, publish it as an asset on a GitHub Release.

## Current scope, privacy, and security

This is a client-side prototype. Accounts, passwords, complaints, and status updates are stored in AsyncStorage on the current device. They do not sync between people or devices, and reports are not sent to a live civic service. Notifications are in-app activity items rather than push notifications. The events screen is a scaffold, not a live event feed.

Authentication is demonstration-only, and the app seeds a demo admin account from `artifacts/civic-reporter/context/AuthContext.tsx`. Do not use real passwords or personal complaint data with this version. A public production service would need a secure backend, protected authentication, shared complaint storage, and a real process for routing reports to civic teams.

## Contributing

Keep workspace changes compatible with pnpm, and commit `pnpm-lock.yaml` when dependency versions change. Do not commit `node_modules/`, Expo caches, signing keys, access tokens, or environment files containing secrets.
