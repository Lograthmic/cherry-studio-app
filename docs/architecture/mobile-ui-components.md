# Cherry Mobile UI Components

Status: draft

Related decision:

- [ADR 0003: Use Pressable Wrappers For Product Buttons](../adr/0003-use-pressable-wrappers-for-product-buttons.md)
- [ADR 0006: Use Platform-Native Navigation Gestures](../adr/0006-use-platform-native-navigation-gestures.md)

This document defines Cherry Mobile v1 interaction component boundaries, focused on buttons, top navigation actions, and Liquid Glass enhancement strategy. Terms follow [CONTEXT.md](../../CONTEXT.md).

## Principles

- Product UI does not use React Native `Button` as the general button foundation.
- Product buttons are Cherry-owned `Pressable` wrappers that centralize pressed, disabled, loading, hit slop, accessibility, haptics, and visual states.
- Platform features are enhancements, not the base interaction contract. iOS Liquid Glass can enhance appearance, while Android and older iOS must keep equally usable fallbacks.
- Expo Router / React Navigation top-bar buttons use `headerRight` / `headerLeft` with Cherry-owned content.
- Product horizontal gestures must not start from Android system edge zones, so they do not steal platform-native back gestures.

## Component Layers

`AppPressable`:

- Lowest-level interaction primitive.
- Wraps `Pressable` state, hit slop, accessibility role, disabled behavior, and optional haptics.
- Does not bind concrete color, size, or business meaning.

`AppButton`:

- Text or icon+text action button.
- Used for page actions, form submission, empty-state actions, and fixed bottom actions.
- Provides product variants such as primary, secondary, danger, and ghost.

`IconButton`:

- Icon-only action button.
- Used for toolbars, message actions, menus, refresh, close, send, and other clear commands.
- Requires an accessibility label and must not rely on visible explanatory text.

`HeaderIconButton`:

- Top navigation button.
- Used through Expo Router `Stack.Screen` options with `headerRight` / `headerLeft`.
- Keeps tap target, disabled/loading state, and fallback styling consistent across iOS and Android.

`GlassButton` / glass variant:

- Visual enhancement only on supported platforms.
- Uses `expo-glass-effect` or the matching native enhancement when iOS supports Liquid Glass.
- Falls back to the regular `Pressable` style on Android, older iOS, or unsupported glass environments.

## React Native Button Boundary

RN `Button` is acceptable for temporary code, demos, system examples, or non-product test screens. Product screens default away from it because it:

- Has limited styling and is hard to align with Cherry's visual system.
- Does not carry custom pressed/loading/disabled behavior well.
- Is not a good entry point for Liquid Glass enhancement.
- Has less controllable cross-platform behavior.

## Top Navigation Actions

Cross-platform top-right actions use:

```tsx
<Stack.Screen
  options={{
    headerRight: () => (
      <HeaderIconButton
        name="settings"
        accessibilityLabel="Settings"
        onPress={openSettings}
      />
    ),
  }}
/>
```

iOS-only APIs such as `Stack.Toolbar` may be used as a local polish layer, but they are not the base navigation contract. The base capability must work on both iOS and Android.

## Acceptance

- Every product button has disabled, pressed, and accessibility states.
- Header buttons keep consistent tap targets on iOS and Android.
- Buttons remain recognizable, tappable, and accessible when iOS glass enhancement is unavailable.
- Icon buttons do not require nearby explanatory text to be understood. Ambiguous icons need a tooltip or menu context.
- New button variants extend Cherry wrappers instead of repeating `Pressable` state logic inside feature components.
- Swipe actions, drawers, carousels, and similar horizontal components must avoid Android system edge back areas.
