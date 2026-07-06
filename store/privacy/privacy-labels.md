# CueYori Privacy and Data Safety Draft

Status: current-code draft for the MVP.

## Current App Behavior

- No account creation.
- No authentication.
- No backend API calls.
- No analytics SDK.
- No advertising SDK.
- No payment SDK.
- No AI service calls.
- Local notifications only.
- Cooking sessions are currently held in local app state.

## Apple App Privacy Draft

Recommended current declaration: Data Not Collected.

Rationale:

- CueYori does not transmit cooking sessions, dishes, stages, device identifiers, usage analytics, diagnostics, contact info, location, or notification tokens to a developer-controlled server.
- Local notification permission is requested on-device for local cooking cues.

Before submission, re-check:

- Expo modules and native SDK privacy manifests.
- Any future persistence, crash reporting, analytics, cloud sync, account system, or AI planning integration.
- Whether TestFlight crash/feedback data is visible in App Store Connect; Apple may process that separately from the app privacy label.

## Google Play Data Safety Draft

Recommended current declaration:

- Data collected: No.
- Data shared: No.
- Data encrypted in transit: Not applicable because the app does not send user data from the device in the current MVP.
- Users can request data deletion: Not applicable for developer servers; uninstalling the app removes local app data.

Before submission, re-check:

- Android notification behavior.
- Any Google Play services, crash reporting, analytics, account, storage, sync, or backend SDKs.
- Whether future local persistence changes the deletion copy in the privacy policy.

## Plain-Language Privacy Policy Draft

CueYori helps you organize cooking sessions on your device. The current version does not require an account and does not send your cooking sessions, dishes, stages, or app usage to CueYori servers. Local notifications are scheduled on your device to remind you about cooking cues. If future versions add cloud sync, analytics, account features, or AI planning, this policy and the store privacy disclosures must be updated before release.
