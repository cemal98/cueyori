# CueYori Mobile Starter Kit

Expo + React Native + TypeScript starter documentation pack for building CueYori with AI coding agents.

## What this zip contains

- `docs/PRD.md` — CueYori product brief
- `docs/ARCHITECTURE.md` — recommended Expo app architecture
- `docs/DEPLOYMENT.md` — App Store / Google Play deployment plan
- `skills/INSTALL_GITHUB_SKILLS.md` — GitHub skill sources and install commands
- `skills/vendor/` — vendored/adapter skill notes from public GitHub sources
- `.cursor/rules/` — Cursor rules for this project
- `.github/workflows/` — GitHub Actions templates for CI and EAS
- `.eas/workflows/` — EAS workflow templates
- `eas.json` — EAS build/submit profile template
- `AGENTS.md` — root instructions for Codex/Cursor/Claude-style agents

## Recommended setup

```bash
npx create-expo-app@latest cueyori
cd cueyori
unzip ../cueyori_mobile_starter.zip -d .
npm install zustand expo-notifications expo-router nativewind react-native-safe-area-context
npm install -D typescript
npx expo install expo-dev-client
```

Then open the repo in Codex/Cursor and prompt:

```text
Read AGENTS.md, docs/PRD.md, docs/ARCHITECTURE.md, and skills/INSTALL_GITHUB_SKILLS.md. Build the CueYori MVP using Expo Router, TypeScript, Zustand, and local notifications.
```

## Important

This pack does not include private keys or store credentials. Add them as GitHub Secrets or EAS credentials only.
