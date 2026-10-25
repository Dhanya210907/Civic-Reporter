# Civic Reporter

Civic Reporter is a mobile prototype for reporting neighborhood issues and following their status. Residents can submit a report with its category and location; an admin view can review reports and update their status.

The repository is a pnpm monorepo. The mobile app lives in `artifacts/civic-reporter/` alongside other workspace packages and project artifacts.

## Features

- Citizen registration, sign-in, and profile management
- Issue reports for garbage, potholes, water leaks, streetlights, drainage, transformers, dead animals, and other concerns
- Report history and detail screens with `Pending`, `In progress`, `Resolved`, and `Rejected` statuses
- Admin dashboard with status filters and report updates
- In-app activity notifications generated from report submissions and status changes
- A community events screen scaffold for future event listings
- Sample complaint data to make the prototype usable on first launch

## Technology

| Technology | How it is used |
| --- | --- |
| Expo SDK 57 | React Native app runtime and native device integrations |
| React Native 0.86 and React 19 | Cross-platform mobile UI |
| TypeScript | App screens, models, and shared component types |
| Expo Router | File-based navigation for citizen and admin flows |
| AsyncStorage | On-device persistence for demo accounts and complaint data |
| TanStack Query | Query client provider configured at the app root; current complaint and account flows use local state |
| Expo and React Native modules | Haptics, gradients, Inter fonts, icons, safe areas, and gesture/keyboard handling |
| pnpm workspaces | Dependency and package management across the monorepo |
| EAS Build | Cloud builds, including the Android APK preview profile |

## Project layout

```text
artifacts/
  civic-reporter/   Expo mobile app
  api-server/       Separate API server workspace package (not connected to the mobile app yet)
  mockup-sandbox/   UI mockup workspace artifact
lib/                Shared workspace packages
pnpm-lock.yaml      Locked dependency versions for the workspace
pnpm-workspace.yaml Workspace configuration
```

## Run the app locally

Install Node.js and pnpm, then install the workspace dependencies from the repository root:

```bash
pnpm install
```

Start Expo from the mobile app directory:

```bash
cd artifacts/civic-reporter
pnpm exec expo start
```

Open the QR code with an Expo Go version compatible with SDK 57. If the Expo Go version on your device is incompatible, use an SDK-compatible client or build and install the Android APK below.

## Build an Android APK

The `preview` profile in `artifacts/civic-reporter/eas.json` is configured to produce an installable APK through EAS Build.

```bash
cd artifacts/civic-reporter
npx eas-cli login
npx eas-cli build --platform android --profile preview
```

The app configuration is currently linked to the maintainer's Expo project. If you are building a fork under your own Expo account, link it to a project you control with `npx eas-cli init` before starting a build. For broad downloads, publish the resulting APK as an asset on a GitHub Release.

## Prototype scope and data

This version is a client-side prototype. It does not send complaints to a live city or council service. Accounts, complaint records, and updates are stored in AsyncStorage on the current device, so they do not sync between people or devices. The app also includes seeded sample complaints; the events screen is a scaffold rather than a live event feed, and notifications are in-app activity items rather than push notifications.

Authentication is demonstration-only. The app stores account data locally, and a demo admin account is seeded in `artifacts/civic-reporter/context/AuthContext.tsx`. Do not use real passwords or personal complaint data with this prototype. Replace the demo authentication and local storage with a secure backend before a public production launch.

## Contributing

Keep workspace changes compatible with pnpm, and commit `pnpm-lock.yaml` when dependency versions change. Do not commit `node_modules/`, Expo caches, signing keys, access tokens, or environment files containing secrets.
