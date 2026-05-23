# Cherry Mobile Chat Streaming And Rendering

Status: draft

Related decisions:

- [ADR 0004: Inject Mobile Chat Stream Fetch](../adr/0004-inject-mobile-chat-stream-fetch.md)
- [ADR 0005: Render Active And Stable Message Blocks Differently](../adr/0005-render-active-and-stable-message-blocks-differently.md)

This document defines Cherry Mobile's AI SDK stream transport, Chat Runtime, and Markdown/LaTeX rendering boundaries. Terms follow [CONTEXT.md](../../CONTEXT.md).

## Principles

- AI SDK continues to own provider requests and provider-specific stream parsing.
- Cherry Mobile injects a fetch transport that can produce a real `ReadableStream` body on mobile.
- Chat Runtime consumes AI SDK `fullStream` and converts it into Cherry chunk/message block updates.
- Message History Window remains database-backed and static: it exposes persisted active-branch Messages from SQLite through React Query pagination.
- Active assistant output is composed through an in-memory Streaming Message Overlay instead of mutating the Message History Window for every token.
- Active streaming output and stable historical output use different rendering paths.
- Render components do not write SQLite directly. Checkpointing and persistence belong to the runtime owner.

## Fetch Transport Candidates

Two candidates remain open:

`expo/fetch`:

- Conservative candidate that follows the Expo path.
- Must be validated with AI SDK `streamText` on real iOS/Android devices for chunk cadence, Abort, and background behavior.

`react-native-nitro-fetch`:

- High-performance candidate worth focused chat stream validation.
- Requires a wrapper that passes `{ stream: true }`.
- Incremental UTF-8 decoding requires `react-native-nitro-text-decoder`.
- Also adds the native dependency cost of Nitro Modules.

Regardless of final transport, the business layer should not parse provider SSE directly. Provider-specific signing wrappers may add headers, signatures, or auth data, but they still call the shared mobile fetch transport.

## Transport Wrapper Shape

Put the transport behind a Cherry-owned adapter so AI SDK call sites do not spread platform branching:

```ts
export function createMobileFetchTransport(): typeof fetch {
  return async (input, init) => {
    if (transportKind === 'nitro') {
      return nitroFetch(input, {
        ...init,
        stream: true,
      } as NitroFetchInit) as Promise<Response>
    }

    return expoFetch(input, init)
  }
}
```

This snippet only describes the boundary: AI SDK receives `options.fetch` instead of relying on React Native's default `global.fetch`.

## Chat Runtime Boundary

Chat Runtime owns:

- Active request state.
- AbortController.
- Stream reader lifetime.
- Partial text/chunk buffer.
- Checkpoint scheduler.
- Foreground/background restore or abort policy.

Chat Runtime does not own:

- Markdown component trees.
- Provider/model catalog refresh.
- Full history prefetch.
- UI scroll position.

## Message Window And Streaming Overlay

The chat list receives a presentation sequence built from two sources:

1. The Message History Window, which reads persisted active-branch Messages from SQLite.
2. The Streaming Message Overlay, which provides the current in-memory assistant Message while generation is active.

The Message History Window owns older-message loading, prefetch, and reveal policy. It should not receive every token delta. The overlay owns active output identity and temporary content until the assistant turn is complete.

Recommended flow:

1. Persist the user Message immediately.
2. Reserve a stable assistant placeholder Message id before streaming starts.
3. Feed AI SDK stream deltas into a Streaming Text Store.
4. Render the active assistant Message from the overlay while generation is active.
5. Persist final `parts`, `status`, metadata, stats, and model snapshot when the stream finishes.
6. Invalidate or update the relevant messages query so the persisted Message takes over from the overlay.

The assistant placeholder id must remain stable for the whole run so the list does not treat each stream delta as a new item.

## Persistence And Checkpointing

UI deltas and SQLite writes use different cadence:

- UI updates may be throttled around 30-60 ms to keep active output responsive.
- SQLite checkpoints should be much slower. Prefer final-save-only for normal responses, with optional 1-2 second checkpoints for long responses or foreground/background transitions.

Frequent database writes are avoided because updating `message.data` also updates derived searchable text and FTS state. Token-level persistence would compete with scrolling and input responsiveness.

Partial output may be persisted on error, abort, pause, or app backgrounding, but the Chat Runtime owns those checkpoint decisions.

## Rendering Paths

Active streaming main text block:

- Uses `react-native-streamdown` for incomplete Markdown constructs while tokens arrive.
- Uses `react-native-enriched-markdown` through Streamdown for the Markdown rendering substrate.
- Throttles UI updates instead of re-rendering the full message tree for every token.
- Reads active main text from a Streaming Text Store so only the streaming Message item rerenders.

Stable historical main text block:

- Uses `react-native-enriched-markdown` for GFM tables, links, inline math, and block math.
- Or uses the same abstraction with streaming behavior disabled.
- Reads from persisted message blocks and does not simulate an active stream again.

Non-text blocks:

- thinking, tool, citation, image, file, translation, error, and similar blocks render from Cherry message block types.
- The app should not flatten a message into one Markdown string and infer block types afterward.

## Acceptance

- AI SDK `streamText` produces incremental output on real iOS and Android devices instead of returning once at request completion.
- Abort stops the active stream and cleans reader, buffer, and checkpoint timers.
- Background/foreground transitions either restore recoverable state or enter a clear failed/retryable state.
- Active responses with paragraphs, lists, code fences, tables, links, inline math, block math, and malformed math do not crash rendering.
- Scrolling and input remain responsive while streaming 10k+ Markdown characters.
- `expo/fetch` and `react-native-nitro-fetch` run through the same real-device scenarios before final selection.
