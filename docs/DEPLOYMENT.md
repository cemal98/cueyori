# CueYori Deployment Plan

## Fast path
Use Expo EAS Build + EAS Submit.

## Accounts needed
- Expo account
- Apple Developer Program account
- Google Play Console account

## Commands
```bash
npm install -g eas-cli
eas login
eas init
eas build:configure
```

## Builds
```bash
eas build --profile preview --platform all
eas build --profile production --platform all
```

## Submits
```bash
eas submit --platform ios --profile production
eas submit --platform android --profile production
```

## CI/CD
Use GitHub Actions only after local EAS build works.

Required GitHub secrets:
- EXPO_TOKEN
- APPLE_ID (optional for submit automation)
- ASC_APP_ID (optional)
- APPLE_TEAM_ID (optional)
- GOOGLE_SERVICE_ACCOUNT_JSON (optional)
