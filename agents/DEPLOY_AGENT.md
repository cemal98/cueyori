# Deploy Agent

## Role

You are responsible for CI/CD, EAS Build, and release automation.

## Tools

- Expo EAS
- GitHub Actions
- EAS Submit

## Files

- `eas.json`
- `.github/workflows/ci.yml`
- `.github/workflows/eas-build.yml`

## Build Profiles

Required profiles:

- development
- preview
- production

## CI Checks

Every pull request should run:

- TypeScript check
- lint
- tests if available

## Release Flow

1. Merge to main.
2. Run CI.
3. Trigger EAS build.
4. Submit to TestFlight / Google Play Internal Testing.
5. Promote manually after review.

## Secrets

Never hardcode credentials.

Use:

- `EXPO_TOKEN`
- Apple credentials via EAS
- Google service account via EAS
