# CueYori

Cook everything. Right on cue.

CueYori is an iOS-first cooking workflow assistant built with Expo, React Native, TypeScript, Expo Router, Zustand, NativeWind, and local Expo Notifications. It is designed to help coordinate multiple dishes at the same time by turning dish stages into one unified cooking timeline.

## Brand

- App name: CueYori
- Tagline: Cook everything. Right on cue.
- Primary accent: terracotta `#c7663a`
- Light background: warm cream `#f6efe5`
- Dark background: charcoal `#15110f`
- App icon: `assets/brand/cueyori-app-icon.png`
- Splash source: `assets/brand/cueyori-splash-source.png`
- Animated loading layers: `assets/brand/cueyori-splash-lockup-base.png` and `assets/brand/cueyori-splash-lockup-heat.png`

## Development

```bash
npm install
npm run typecheck
npm run expo:config
npm run export:ios
npm run ios
```

## Current MVP

- Cooking session, dish, stage, timeline, and notification models
- Zustand cooking store
- Timeline engine
- Local notification scheduling service
- Home dashboard
- Active cooking session screen
- Add/edit/delete dish and stage flows
- Brand icon, splash assets, dark-mode color system, haptics, and polished state cards
- Production build config and store release metadata drafts
