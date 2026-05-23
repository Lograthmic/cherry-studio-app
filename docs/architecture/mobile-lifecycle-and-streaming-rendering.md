# Cherry Mobile Architecture Index

Status: draft

This document is the architecture index for the Cherry Studio mobile app. Project language and domain boundaries are captured in [CONTEXT.md](../../CONTEXT.md), hard-to-reverse or easy-to-misread decisions are captured in [docs/adr](../adr), and concrete implementation guidance is split into the topic documents below.

## Scope

This document covers mobile v1 runtime ownership, startup performance, navigation gestures, edge-to-edge/insets, UI interaction components, AI SDK chat stream transport, streaming Markdown/LaTeX rendering, and performance acceptance.

It does not define AI provider integration details, remote agent orchestration, Expo scaffolding, package installation, final Drizzle schemas, or Expo Web support.

## Topic Documents

- [Runtime Ownership](./mobile-runtime-ownership.md): mobile runtime owner boundaries, resources that need cleanup, startup gates, and first chat paint constraints.
- [Navigation And Insets](./mobile-navigation-and-insets.md): Android platform-native back gestures, predictive back, edge-to-edge, and safe-area/inset strategy.
- [UI Components](./mobile-ui-components.md): `Pressable`-based product buttons, header buttons, Liquid Glass enhancement, and cross-platform fallback.
- [Chat Streaming And Rendering](./mobile-chat-streaming-rendering.md): AI SDK fetch injection, `expo/fetch` and `react-native-nitro-fetch` candidates, and active/stable renderer boundaries.

## Decision Index

- [ADR 0001: Use Provider-Owned Runtime Owners](../adr/0001-use-provider-owned-runtime-owners.md)
- [ADR 0002: Use Startup Gates Instead Of Lifecycle Phases](../adr/0002-use-startup-gates-not-lifecycle-phases.md)
- [ADR 0003: Use Pressable Wrappers For Product Buttons](../adr/0003-use-pressable-wrappers-for-product-buttons.md)
- [ADR 0004: Inject Mobile Chat Stream Fetch](../adr/0004-inject-mobile-chat-stream-fetch.md)
- [ADR 0005: Render Active And Stable Message Blocks Differently](../adr/0005-render-active-and-stable-message-blocks-differently.md)
- [ADR 0006: Use Platform-Native Navigation Gestures](../adr/0006-use-platform-native-navigation-gestures.md)
- [ADR 0007: Use Route-Level Form Sheets For Page-Like Pickers](../adr/0007-use-route-level-form-sheets-for-page-like-pickers.md)

## Runtime Constraints

Cherry Mobile uses Expo development builds from the beginning and does not support Expo Go as a v1 runtime. Planned native/runtime dependencies include:

- `heroui-native` as a mobile UI component candidate.
- `react-native-enriched-markdown` for stable Markdown, GFM tables, and inline/block LaTeX.
- `remend` as a candidate for streaming Markdown repair.
- `react-native-streamdown` and `react-native-worklets` Bundle Mode are deferred until they work with Expo SDK stable Worklets versions.
- `expo-sqlite` with `drizzle-orm` for local persistence.
- Chat stream transport candidates: `expo/fetch` or `react-native-nitro-fetch`. If Nitro Fetch is selected, the app also needs `react-native-nitro-modules` and `react-native-nitro-text-decoder`.

The initial platform target is iOS and Android phones, with layout foundations for future iPadOS and Android tablets.

## Cherry Data Alignment

Mobile data structures follow Cherry Studio desktop's domain model by default unless there is a clear mobile-specific reason. These concepts must be preserved:

- Assistant: reusable configuration with prompt and selected/default model references.
- Topic: chat thread or conversation.
- Message: belongs to a topic and preserves role, status, model snapshot, timing/stat metadata, and deletion state where applicable.
- Message Block: typed content block such as main text, thinking, tool, citation, image, file, translation, or error.
- Provider / Model: configuration direction should remain compatible with Cherry desktop, even if complete provider request architecture is deferred in v1.

v1 may simplify UI surface area, but it must not collapse these concepts into a single chat table.

## Current Baseline

- Runtime ownership: use Provider-owned runtime owners, not the desktop lifecycle or a `defineService` DSL. See [Runtime Ownership](./mobile-runtime-ownership.md).
- Startup gates: `Bootstrap`, `InitialDataGate`, and `AfterFirstPaint` express startup performance boundaries only. See [Runtime Ownership](./mobile-runtime-ownership.md).
- Navigation: Android edge back, predictive back preview, and native stack transitions use platform-native capabilities instead of JavaScript edge-swipe simulation. See [Navigation And Insets](./mobile-navigation-and-insets.md).
- Picker sheets: page-like pickers such as model selection opened from chat input use route-level `formSheet`, not JavaScript bottom sheets. See [Navigation And Insets](./mobile-navigation-and-insets.md).
- UI interaction: product buttons default to `Pressable` wrappers, and header buttons use Cherry-owned `HeaderIconButton`. See [UI Components](./mobile-ui-components.md).
- Chat stream transport: AI SDK provider options must receive a mobile fetch transport, with final selection still open between `expo/fetch` and `react-native-nitro-fetch`. See [Chat Streaming And Rendering](./mobile-chat-streaming-rendering.md).
- Rendering: active streaming and stable historical message blocks use different rendering paths. See [Chat Streaming And Rendering](./mobile-chat-streaming-rendering.md).

## Performance Acceptance Scenarios

Minimum scenarios:

- Cold start into an existing current conversation.
- 100+ historical messages in a topic.
- One assistant response with 10k+ Markdown characters.
- Streaming response containing paragraphs, lists, code fences, tables, links, inline math, block math, and malformed math.
- Streaming response containing incomplete Markdown constructs that `remend` should repair while tokens arrive.
- Scrolling while a long assistant message is streaming.
- App background during active streaming, then foreground restore.
- In Android edge-to-edge mode, headers, tabs, chat input, message lists, and keyboard insets do not obscure each other.
- Android system edge back, nested stack back, and modal/sheet back match platform expectations on real devices.
- Opening the model picker `formSheet` from chat input blurs the keyboard first, and Android back closes the sheet before leaving chat.
- Compare `expo/fetch` and `react-native-nitro-fetch` with AI SDK `streamText` on real devices.
- Low-memory or low-end Android profiling pass before claiming performance is acceptable.

Success criteria:

- First chat paint does not wait for non-current history or provider/model refresh.
- Scrolling remains responsive during streaming.
- Keyboard/input remains responsive during streaming.
- Incomplete Markdown and LaTeX do not crash rendering.
- Background/foreground transitions preserve recoverable stream state.
- Android system back gestures are not stolen by product horizontal gestures.

## Open Questions For Later

- Exact virtualization library selection.
- Exact SQLite migration generation workflow for Expo.
- Exact tablet layout behavior for iPadOS and Android tablets.
- Provider/model request runtime architecture.
- When Android predictive back preview should move from conservative disabled default to enabled.
- Model picker `formSheet` detents, search/grouping density, and iPad/tablet behavior.
- Final chat stream transport choice: `expo/fetch` or `react-native-nitro-fetch`.
- Which Expo-compatible streaming Markdown renderer should replace the deferred `react-native-streamdown` Bundle Mode path.
