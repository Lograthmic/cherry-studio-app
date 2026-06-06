# Use Expo Runtime Fetch For Chat Streaming

Cherry Mobile relies on the Expo/React Native runtime fetch implementation for AI SDK chat streaming instead of injecting a shared mobile fetch transport. Current device testing confirms the existing code streams incrementally, so provider configs should not add a custom transport unless a future platform regression proves it is needed.

**Considered Options**

- Rely on the Expo/React Native runtime fetch behavior used by the current AI SDK provider configs.
- Inject a shared `expo/fetch` transport into every provider config.
- Inject a Nitro fetch wrapper that passes `{ stream: true }`.

**Consequences**

The business layer should not parse provider-specific SSE directly. AI SDK continues to own provider parsing and expose UI message chunks to Cherry. Provider-specific fetch wrappers, such as CherryAI signing, may call runtime `fetch` after adding their headers; they do not need to delegate to a shared mobile transport.
