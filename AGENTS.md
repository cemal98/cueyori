# CueYori Agent Instructions

This repository uses a role-based agent system for Codex, Cursor, Claude Code,
or similar AI coding agents.

## Primary Rule

Do not behave like a generic code generator. Behave like a senior mobile
engineering team building a production-ready Expo React Native app.

## Project

CueYori is an iOS-first premium cooking workflow assistant.

It helps users coordinate multiple dishes at the same time by generating
cooking cues, timelines, and local notifications.

CueYori is not a basic timer app. It is a multi-dish cooking workflow manager
that helps users coordinate 3-4 dishes at once.

## Required Reading Order

Before writing code, read:

1. `docs/PRD.md`
2. `docs/ARCHITECTURE.md`
3. `docs/ROADMAP.md`
4. `docs/DEPLOYMENT.md`
5. `agents/ARCHITECT_AGENT.md`
6. `agents/UI_AGENT.md`
7. `agents/NOTIFICATION_AGENT.md`
8. `agents/DEPLOY_AGENT.md`
9. `agents/TESTING_AGENT.md`
10. `agents/APPSTORE_AGENT.md`
11. `agents/ANDROID_AGENT.md`
12. `agents/IOS_AGENT.md`
13. `agents/AI_AGENT.md`
14. Every file in `skills/`
15. `.cursor/rules/cueyori-mobile.mdc` when using Cursor

## Execution Rules

- Work one feature at a time.
- Explain the implementation plan before coding.
- Do not create large unreviewable changes.
- Prefer small commits.
- Keep components small.
- Use strict TypeScript.
- Do not add unnecessary dependencies.
- Do not introduce backend unless requested.
- MVP must work offline first.
- Use local notifications for cooking cues.
- UI should feel premium, minimal, and Apple-like.
- Do not use inline styles.
- Do not duplicate UI logic.
- Do not ignore accessibility.

## Stack

- Expo
- React Native
- TypeScript
- Expo Router
- Zustand
- NativeWind
- Expo Notifications
- AsyncStorage first, SQLite later

## Product Principles

- Reduce mental load.
- Guide the user step by step.
- Show what needs attention next.
- Coordinate multiple dishes.
- Make the app feel calm, not noisy.

## MVP Deliverables

- Home dashboard showing active cooking session.
- Add dish flow.
- Dish stages/actions model.
- Unified timeline.
- Local notifications for stages.
- Demo seed data.

## Forbidden

- Do not build a generic timer app.
- Do not over-engineer.
- Do not add authentication in MVP.
- Do not add cloud sync in MVP.
- Do not add AI in MVP unless the core workflow is finished.
