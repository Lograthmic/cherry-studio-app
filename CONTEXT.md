# Cherry Mobile Context

Cherry Mobile is the React Native / Expo client for Cherry Studio. It keeps Cherry's chat domain model compatible with desktop while using mobile-native runtime ownership, navigation, rendering, and resource cleanup patterns.

## Language

**Cherry Mobile**:
The mobile Cherry Studio client built on Expo and React Native.
_Avoid_: mobile clone, assistant clone

**Assistant**:
A reusable Cherry configuration that defines prompt and selected/default model behavior.
_Avoid_: bot, character

**Topic**:
A chat thread or conversation owned by an assistant context.
_Avoid_: chat table, room

**Message**:
A persisted chat item in a topic with role, status, model snapshot, metadata, and block content.
_Avoid_: row, text item

**Message Block**:
A typed unit of message content, such as main text, thinking, tool, citation, image, file, translation, or error.
_Avoid_: flat message text

**Message History Window**:
The database-backed active-branch message window for a Topic. It owns history pagination, older-message prefetch, reveal policy, and the static persisted Messages handed to the chat list.
_Avoid_: stream state, live message buffer

**Streaming Message Overlay**:
The in-memory active assistant Message layer composed on top of the Message History Window while a Chat Runtime is generating.
_Avoid_: persisted history page, query page

**Streaming Text Store**:
A lightweight subscription store for active main-text deltas. It lets the streaming Message item update without replacing the full Message array on every token.
_Avoid_: React Query cache for token deltas

**Runtime Owner**:
A Provider-owned runtime object that owns long-lived resources and defines resume, background, and dispose behavior.
_Avoid_: service registry, desktop lifecycle service

**Startup Gate**:
A named performance boundary that controls what can block first chat paint.
_Avoid_: lifecycle phase, OS background phase

**Chat Stream Transport**:
The fetch implementation injected into AI SDK provider options to produce real mobile streaming responses.
_Avoid_: default React Native fetch

**Chat Runtime**:
The runtime owner for active LLM streams, AbortControllers, stream buffers, foreground resume, and background checkpointing.
_Avoid_: UI state, screen state

**Streaming Renderer**:
The message renderer path for incomplete assistant output that is still receiving deltas.
_Avoid_: final Markdown renderer

**Stable Renderer**:
The message renderer path for completed or cached historical Markdown blocks.
_Avoid_: streaming renderer

**Interaction Button**:
A Cherry-owned Pressable wrapper used for product buttons, icon buttons, and header buttons.
_Avoid_: React Native Button as a product UI primitive

**Navigation Drawer**:
A side navigation container that can be opened from a header action or platform-appropriate product gesture.
_Avoid_: ad hoc side overlay

**System Gesture Zone**:
The screen-edge region reserved for operating-system gestures such as Android edge back.
_Avoid_: app-owned edge

**Product Horizontal Gesture**:
A Cherry-owned horizontal gesture for product UI such as drawers, swipe actions, carousels, or scrubbers.
_Avoid_: system back gesture

## Relationships

- A **Topic** contains many **Messages**.
- A **Message** contains one or more **Message Blocks**.
- A **Message History Window** exposes persisted Messages for the active branch of a **Topic**.
- A **Streaming Message Overlay** may add or replace the active assistant **Message** above the **Message History Window** during generation.
- A **Chat Runtime** owns the active stream for a **Message** while it is being generated.
- A **Streaming Text Store** carries active main-text deltas from the **Chat Runtime** to the **Streaming Renderer**.
- A **Runtime Owner** may consume AppState, screen focus, and Provider mount/unmount signals.
- A **Startup Gate** can block first chat paint only when the user-visible initial chat screen depends on it.
- A **Chat Stream Transport** feeds AI SDK `fullStream`; the **Chat Runtime** consumes Cherry chunks after AI SDK provider parsing.
- A **Streaming Renderer** renders active main text blocks; a **Stable Renderer** renders completed historical blocks.
- An **Interaction Button** can be used in Expo Router `headerRight` and `headerLeft`.
- A **Navigation Drawer** may use a **Product Horizontal Gesture**, but Android **System Gesture Zones** remain owned by the system.

## Example dialogue

> **Dev:** "Should the chat request helper become a Runtime Owner?"
> **Domain expert:** "Only if it owns a stream, AbortController, timer, listener, or other resource that can outlive the current function. One-shot request helpers stay plain functions."
>
> **Dev:** "Can we use the default React Native fetch for AI SDK streamText?"
> **Domain expert:** "No. The Chat Stream Transport must be injected because mobile fetch has to provide a real `ReadableStream` body."
>
> **Dev:** "Can a header button use React Native Button?"
> **Domain expert:** "Not for product UI. Use an Interaction Button so iOS Liquid Glass enhancement and Android fallback share the same behavior."

## Flagged ambiguities

- "lifecycle" was used for both desktop-style service orchestration and mobile resource cleanup. Resolved: use **Runtime Owner** for mobile long-lived resources and **Startup Gate** for performance boundaries.
- "streaming" was used for both network transport and Markdown rendering. Resolved: use **Chat Stream Transport** for AI SDK fetch streaming and **Streaming Renderer** for active Markdown rendering.
- "button" was used for both React Native `Button` and app-specific controls. Resolved: product controls are **Interaction Buttons** built on `Pressable`.
