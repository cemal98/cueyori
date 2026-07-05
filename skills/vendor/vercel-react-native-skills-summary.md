# Vercel React Native Skills — Local Summary

Source: https://github.com/vercel-labs/agent-skills/blob/main/skills/react-native-skills/SKILL.md
License shown upstream: MIT

Use when building React Native or Expo apps, optimizing list performance, implementing animations, working with images/media, configuring native modules, fonts, or monorepo native dependencies.

Priority checklist:
1. List performance: virtualized lists, memoized items, stable callbacks, optimized images.
2. Animation: animate transform/opacity, use Reanimated patterns.
3. Navigation: prefer native stacks/tabs where possible.
4. UI: use safe areas, Expo Image, Pressable, native modals, NativeWind or StyleSheet.
5. State: minimize state subscriptions and unnecessary renders.
6. Rendering: wrap text in Text, avoid falsy conditional rendering pitfalls.
7. Configuration: use config plugins for native setup where possible.
