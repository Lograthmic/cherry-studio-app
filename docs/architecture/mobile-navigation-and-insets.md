# Cherry Mobile Navigation And Insets

Status: current

Related decisions:

- [ADR 0006: Use Platform-Native Navigation Gestures](../adr/0006-use-platform-native-navigation-gestures.md)
- [ADR 0007: Use Component Bottom Sheets For Model Picker](../adr/0007-use-component-bottom-sheets-for-model-picker.md)
- [ADR 0003: Use Pressable Wrappers For Product Buttons](../adr/0003-use-pressable-wrappers-for-product-buttons.md)

This document defines Cherry Mobile v1 navigation gestures, Android predictive back, edge-to-edge, and safe-area/inset strategy. Terms follow [CONTEXT.md](../../CONTEXT.md).

## Principles

- Android edge back is a platform-native capability. Cherry Mobile does not simulate edge-swipe back in JavaScript.
- Expo Router `Stack` / React Navigation native-stack bridges native screen stacks and back animations through `react-native-screens`.
- Edge-to-edge is a platform window layout capability. The app is responsible for fitting headers, chat input, message lists, sheets, and keyboard areas against insets.
- System gesture zones belong to the system. Product horizontal gestures must not compete with Android screen edges.
- Back interception is limited to explicit product states such as unsaved edits, active generation confirmation, or dangerous action confirmation.
- Route-level sheets are used for page-like flows such as settings. Model selection uses a component-level BottomSheet.

## Android Back Gesture

Left/right edge back on Android devices is handled by system navigation gestures. Cherry Mobile only declares navigation structure and screen options:

```tsx
<Stack
  screenOptions={{
    headerShown: false,
  }}
/>
```

Back navigation should use the native stack. Do not add a global `PanGestureHandler` or custom full-screen back gesture on Android just to imitate iOS interactive pop.

## Predictive Back

Android predictive back preview is a system capability, not an app-drawn animation. Expo exposes it through:

```json
{
  "expo": {
    "android": {
      "predictiveBackGestureEnabled": false
    }
  }
}
```

For v1, keep `false` as the conservative default. Enable it after navigation structure, modal behavior, unsaved state, and active generation state are stable, then validate on real devices.

Before enabling it, verify:

- Normal stack back shows the correct preview.
- Nested stack back inside tabs targets the correct screen.
- Modal / sheet dismissal matches platform expectations.
- Local `BackHandler` usage does not break system preview.
- Active generation, unsaved edits, and dangerous confirmations can block or confirm back correctly.

## Current Navigation Shape

- `src/app/_layout.tsx` owns the app root wrappers: gesture handler root, keyboard provider, HeroUI provider, QueryProvider, DataProvider, InitialDataGate, navigation theme, and DrawerRoot.
- `DrawerRoot` owns the root Stack. The `(drawer)` route hides its header; `settings` uses route-level `presentation: 'formSheet'`.
- `DrawerLayout` owns the Expo drawer route group and bridges drawer open/close state into the drawer provider.
- The chat route group is wrapped in `ChatRuntimeProvider`.
- Route files stay thin and generally re-export screen modules from `src/screens`.

## Picker Sheets

Short local pickers, such as model setting selection, use reusable Expo UI `BottomSheet`
components owned by their feature module. These sheets are plain overlays controlled by local
state; their triggers should only pass open/close and selection state.

Model selection is a reusable component-level `ModelPickerBottomSheet`. It is used by chat input and settings/model selection, includes search, tags, grouped model rows, pinning, and an 85% snap point.

Route-level `formSheet` remains appropriate for page-like flows that need navigation history, deep linking, or system-back dismissal semantics. Settings is the current route-level form sheet.

Recommended shape:

```tsx
<Stack.Screen
  name="provider-picker"
  options={{
    presentation: 'formSheet',
    sheetAllowedDetents: [0.5, 0.9],
    sheetInitialDetentIndex: 0,
    sheetCornerRadius: 24,
  }}
/>
```

Do not migrate model selection to a route-level `formSheet` just to reuse page navigation. Reconsider only if the picker becomes a page-like flow with nested navigation, deep linking, or system-back semantics that cannot be handled cleanly as a local sheet.

## Component Sheet Boundary

Component-level bottom sheets are only for local, short-lived panels that do not need navigation history, such as a few quick actions, local filters, or temporary action menus.

Do not add more growing pickers as JavaScript bottom sheets unless the flow explicitly does not need system back preview, deep linking, page-like dismissal semantics, or navigation history. JS sheets usually need their own `BackHandler`, which weakens Android predictive back continuity.

## Edge-to-Edge And Insets

Android edge-to-edge should not be avoided by pinning a system navigation bar background color. Cherry Mobile must handle layout explicitly:

- Top headers avoid the status bar inset.
- Chat input handles both bottom inset and keyboard inset.
- Message list `contentContainerStyle` leaves room for chat input and bottom inset.
- Full-screen pages, image previews, modals, and sheets explicitly choose whether they draw behind system bars.
- Sheets opened from chat input should not leave keyboard, bottom inset, and sheet detents fighting each other.

## Gesture Conflict Boundaries

- Do not place product gestures that require horizontal swiping on the left/right screen edge.
- Drawers, message swipe actions, carousels, and media scrubbers should start from content areas, not the system edge zone.
- If a page must use an edge horizontal gesture, validate on Android that system back remains intact.
- iOS interactive pop and Android system back are not the same product contract; do not flatten them into one JavaScript gesture.

Current drawer implementation uses `swipeEdgeWidth: width`, so drawer swipe can start across the screen. Treat this as a validation risk against Android system edge back until real-device testing confirms the gestures do not conflict.

## Acceptance

- Android system edge back works in normal screens, nested stacks, and modal/sheet flows.
- Back targets, animations, and product confirmation states are predictable before and after enabling predictive back.
- In edge-to-edge mode, headers, chat input, and message lists are not obscured by the status bar, navigation bar, or keyboard.
- Opening model selection from chat input keeps keyboard, sheet detents, and bottom inset stable.
- Product horizontal gestures do not steal system edge back.
- Only screens with explicit product reasons use local back interception.
