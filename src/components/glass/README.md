# Glass Components

This directory centralizes Liquid Glass usage for app UI components.

Use these exports instead of importing `expo-glass-effect` directly from feature code:

```tsx
import { GlassContainer, GlassView, TouchableGlass, isAppGlassAvailable } from '@/components/glass';
```

## What It Does

- iOS with Liquid Glass support uses `expo-glass-effect`.
- Unsupported iOS versions and non-iOS platforms fall back to `expo-blur`.
- Android currently uses `expo-blur` with `blurMethod="none"` by default, which behaves like a translucent view without expensive native blur.
- `isAppGlassAvailable()` is the shared runtime guard for places that need to configure native navigation options.

## Basic Usage

Use `GlassView` for non-interactive glass surfaces:

```tsx
import { GlassView } from '@/components/glass';

export function FloatingPanel() {
  return (
    <GlassView
      className="rounded-3xl px-4 py-3"
      glassEffectStyle="regular"
      fallbackTint="systemChromeMaterial"
    >
      {/* content */}
    </GlassView>
  );
}
```

Use `TouchableGlass` for buttons or tappable floating controls:

```tsx
import { TouchableGlass } from '@/components/glass';

export function NewChatButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableGlass
      accessibilityLabel="New chat"
      accessibilityRole="button"
      className="size-11 items-center justify-center rounded-full"
      glassEffectStyle="regular"
      hitSlop={8}
      onPress={onPress}
    >
      {/* icon */}
    </TouchableGlass>
  );
}
```

Use `GlassContainer` when multiple glass children should visually merge on iOS:

```tsx
import { GlassContainer, TouchableGlass } from '@/components/glass';

export function FloatingToolbar() {
  return (
    <GlassContainer className="flex-row gap-2" spacing={8}>
      <TouchableGlass className="size-10 rounded-full" />
      <TouchableGlass className="size-10 rounded-full" />
    </GlassContainer>
  );
}
```

## Fallback Props

`GlassView` and `TouchableGlass` accept these fallback-only props:

- `fallbackTint`: passed to `expo-blur` when Liquid Glass is unavailable.
- `fallbackIntensity`: blur intensity for the fallback view.
- `fallbackBlurMethod`: Android blur method. Defaults to `none`.

These props are intentionally stripped before rendering the native iOS `GlassView`.

## Current Project Guidance

- Keep the native navigation header using `@expo/ui` / Expo Router toolbar APIs.
- Use this glass layer for app-owned floating controls, composer surfaces, scroll-to-bottom buttons, and compact toolbars.
- Do not use it for the drawer search field or HeroUI controls unless there is a specific design reason.
