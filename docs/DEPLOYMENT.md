# CueYori Deployment Plan

CueYori uses Expo EAS for production builds and store submission.

## App Identity

- Expo slug: `cueyori`
- URL scheme: `cueyori`
- iOS bundle identifier: `com.bydemirel.cueyori`
- Android package: `com.bydemirel.cueyori`
- App version: `0.1.0`
- iOS build number: `1`
- Android version code: `1`

The source of truth is `app.config.ts`.

## Local Checks

```bash
npm ci
npm run typecheck
npm run expo:config
npm run export:ios
```

## EAS Build

```bash
eas login
eas init
eas build --profile preview --platform ios
eas build --profile production --platform ios
```

Use `--platform android` or `--platform all` after Google Play credentials are ready.

## EAS Submit

```bash
eas submit --profile production --platform ios
eas submit --profile production --platform android
```

## GitHub Actions

Workflows:

- `.github/workflows/ci.yml`: typecheck, Expo config validation, iOS export
- `.github/workflows/eas-preview.yml`: manual preview build
- `.github/workflows/eas-production-submit.yml`: manual production build and submit

Required GitHub secrets:

- `EXPO_TOKEN`
- `APPLE_ID`
- `ASC_APP_ID`
- `APPLE_TEAM_ID`

Android submit will also need Google Play service account credentials before production release.
