# Cherry Mobile Navigation And Insets

Status: draft

Related decisions:

- [ADR 0006: Use Platform-Native Navigation Gestures](../adr/0006-use-platform-native-navigation-gestures.md)
- [ADR 0007: Use Route-Level Form Sheets For Page-Like Pickers](../adr/0007-use-route-level-form-sheets-for-page-like-pickers.md)
- [ADR 0003: Use Pressable Wrappers For Product Buttons](../adr/0003-use-pressable-wrappers-for-product-buttons.md)

This document defines Cherry Mobile v1 navigation gestures, Android predictive back, edge-to-edge, and safe-area/inset strategy. Terms follow [CONTEXT.md](../../CONTEXT.md).

## Principles

- Android edge back is a platform-native capability. Cherry Mobile does not simulate edge-swipe back in JavaScript.
- Expo Router `Stack` / React Navigation native-stack bridges native screen stacks and back animations through `react-native-screens`.
- Edge-to-edge is a platform window layout capability. The app is responsible for fitting headers, tabs, chat input, message lists, and keyboard areas against insets.
- System gesture zones belong to the system. Product horizontal gestures must not compete with Android screen edges.
- Back interception is limited to explicit product states such as unsaved edits, active generation confirmation, or dangerous action confirmation.
- Page-like pickers and selection flows that can grow should be route-level `formSheet` screens so Android system back dismisses the sheet first.

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

## Route-Level formSheet

Model selection, provider selection, attachment source selection, and long-list pickers with search/grouping/explanations default to Expo Router route-level `formSheet`. This kind of sheet is the top route in the navigation stack, not a plain overlay; Android system back should dismiss/pop the sheet before the underlying chat screen receives back.

Recommended shape:

```tsx
<Stack.Screen
  name="model-picker"
  options={{
    presentation: 'formSheet',
    sheetAllowedDetents: [0.5, 0.9],
    sheetInitialDetentIndex: 0,
    sheetCornerRadius: 24,
  }}
/>
```

When opening model selection from chat input, blur the input before pushing the sheet route:

```ts
inputRef.current?.blur()
router.push('/chat/model-picker')
```

After selection, update the draft model and return:

```ts
setDraftModel(modelId)
router.back()
```

In v1, `formSheet` content stays single-screen. Search, provider grouping, recent models, and capability labels are allowed in the same sheet, but do not push nested detail screens inside the Android sheet. If details are needed, close the sheet and enter a normal page, or expand detail with local state inside the sheet.

## Component Sheet Boundary

Component-level bottom sheets are only for local, short-lived panels that do not need navigation history, such as a few quick actions, local filters, or temporary action menus.

Do not build growing pickers such as model selection as JavaScript bottom sheets unless the flow explicitly does not need system back preview, deep linking, page-like dismissal semantics, or navigation history. JS sheets usually need their own `BackHandler`, which weakens Android predictive back continuity.

## Edge-to-Edge And Insets

Android edge-to-edge should not be avoided by pinning a system navigation bar background color. Cherry Mobile must handle layout explicitly:

- Top headers avoid the status bar inset.
- Bottom tabs avoid the navigation bar inset.
- Chat input handles both bottom inset and keyboard inset.
- Message list `contentContainerStyle` leaves room for chat input, tabs, and bottom inset.
- Full-screen pages, image previews, modals, and sheets explicitly choose whether they draw behind system bars.
- `formSheet` screens opened from chat input blur the keyboard first, so keyboard, bottom inset, and sheet detents do not fight each other.

NativeTabs can cover part of this platform adaptation, but chat input and message list bottom spacing remain product layout responsibilities.

## Gesture Conflict Boundaries

- Do not place product gestures that require horizontal swiping on the left/right screen edge.
- Drawers, message swipe actions, carousels, and media scrubbers should start from content areas, not the system edge zone.
- If a page must use an edge horizontal gesture, validate on Android that system back remains intact.
- iOS interactive pop and Android system back are not the same product contract; do not flatten them into one JavaScript gesture.

## Acceptance

- Android system edge back works in normal screens, nested stacks, and modal/sheet flows.
- When the model picker `formSheet` is open, Android system back closes the sheet before leaving the chat screen.
- Back targets, animations, and product confirmation states are predictable before and after enabling predictive back.
- In edge-to-edge mode, headers, tabs, chat input, and message lists are not obscured by the status bar, navigation bar, or keyboard.
- Opening model selection from chat input dismisses the keyboard and keeps sheet detents plus bottom inset stable.
- Product horizontal gestures do not steal system edge back.
- Only screens with explicit product reasons use local back interception.
