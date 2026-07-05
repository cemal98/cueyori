# GitHub Skills to Install

This starter intentionally points agents to maintained GitHub skills instead of inventing everything locally.

## 1. Official Expo Skills

Best source for Expo, EAS, deployment, Expo Router, native UI, and CI/CD guidance.

Install for Codex:
```bash
codex plugin add expo@openai-curated
```

Install for Cursor/other agents:
```bash
npx skills add expo/skills
```

Useful Expo skills for CueYori:
- building-native-ui
- expo-deployment
- expo-cicd-workflows
- expo-tailwind-setup
- expo-examples
- native-data-fetching
- upgrading-expo

Source: https://github.com/expo/skills
Docs: https://docs.expo.dev/skills/

## 2. Callstack Agent Skills

Best for React Native performance, GitHub workflows, and upgrade discipline.

Claude Code plugin:
```text
/plugin marketplace add callstackincubator/agent-skills
/plugin install react-native-best-practices@callstack-agent-skills
/plugin install github-actions@callstack-agent-skills
/plugin install github@callstack-agent-skills
```

Source: https://github.com/callstackincubator/agent-skills

## 3. Vercel React Native Skills

Good compact React Native/Expo best-practice checklist.

Source: https://github.com/vercel-labs/agent-skills/tree/main/skills/react-native-skills

## 4. Expo Toolkit

Useful for Claude Code style Expo workflows from project setup through app store submission.

Claude Code:
```text
/plugin marketplace add rahulkeerthi/expo-toolkit
/plugin install expo-toolkit
```

Source: https://github.com/rahulkeerthi/expo-toolkit

## Agent prompt after installation

```text
Use the Expo official skills, Callstack React Native best-practices skill, and this repo's AGENTS.md. Build CueYori MVP with Expo Router, Zustand, NativeWind, and Expo Notifications. Keep deployment EAS-first.
```
