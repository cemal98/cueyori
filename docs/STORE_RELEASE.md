# CueYori Store Release Checklist

This checklist is based on the current CueYori MVP: offline-first cooking sessions, local state, local notifications, no account system, no backend, no analytics, no ads, and no AI service calls.

Re-audit this document before every release if the app adds cloud sync, analytics, AI planning, authentication, payments, or third-party SDKs.

## Apple App Store

### App Store Connect

- Create app record for `CueYori`.
- Bundle ID: `com.bydemirel.cueyori`.
- SKU suggestion: `cueyori-ios`.
- Primary category suggestion: Food & Drink.
- Secondary category suggestion: Productivity.
- Add privacy policy URL before review.
- Add support URL before review.

### Metadata

- Use `store/apple/metadata.json` as the first draft.
- Confirm subtitle, keywords, category, and age rating in App Store Connect.
- Add review notes explaining local notifications and offline-only data.

### Privacy

- Use `store/privacy/privacy-labels.md` as the current-code declaration draft.
- Current recommendation: Data Not Collected.
- Confirm no new SDK collects identifiers, diagnostics, usage data, or device data before submission.

### TestFlight

- Build with `eas build --profile production --platform ios`.
- Submit with `eas submit --profile production --platform ios`.
- Add internal testers first.
- Run a full cooking session test:
  - Start demo session.
  - Add a custom dish.
  - Edit a stage.
  - Complete and uncomplete stages.
  - Pause/resume.
  - Confirm local notifications permission behavior.
  - Complete/reset session.
- Move to external testing after internal QA is stable.

### Review Submission

- Upload final screenshots.
- Confirm app icon and splash match final brand.
- Confirm privacy labels and accessibility labels.
- Submit for review after TestFlight build is accepted.

## Google Play

### Play Console

- Create app record for `CueYori`.
- Package name: `com.bydemirel.cueyori`.
- App type: App.
- Category suggestion: Food & Drink.
- Set app access to unrestricted unless future auth is added.
- Add privacy policy URL before review.

### Store Listing

- Use `store/google/listing.json` as the first draft.
- Prepare phone screenshots from the same flows used for App Store.
- Add feature graphic before production release.

### Data Safety

- Use `store/privacy/privacy-labels.md` as the current-code declaration draft.
- Current recommendation: no data collected and no data shared.
- Re-check if Android notification, crash, analytics, or account SDKs are added.

### Testing Tracks

- Internal testing: upload first signed build and run QA.
- Closed testing: use after internal testing is stable.
- Production: promote only after the release checklist passes.

### Production Release

- Build with `eas build --profile production --platform android`.
- Submit with `eas submit --profile production --platform android`.
- Complete Play Console app content sections:
  - Data safety
  - Privacy policy
  - App access
  - Ads
  - Content rating
  - Target audience
  - News apps

## Official References

- Apple App Privacy Details: https://developer.apple.com/app-store/app-privacy-details/
- Apple TestFlight: https://developer.apple.com/testflight/
- Google Play Data Safety: https://support.google.com/googleplay/android-developer/answer/10787469
- Google Play Testing Tracks: https://support.google.com/googleplay/android-developer/answer/9845334
