# Deployment Skill

## Required Setup

- `eas.json`
- Expo account
- EAS project
- GitHub Actions
- `EXPO_TOKEN` secret

## Commands

```bash
eas build --profile preview --platform all
eas submit --platform ios
eas submit --platform android
```

## Rule

Never commit secrets.
