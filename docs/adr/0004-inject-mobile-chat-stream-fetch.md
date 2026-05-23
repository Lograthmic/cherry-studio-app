# Inject Mobile Chat Stream Fetch

Cherry Mobile will inject an explicit mobile fetch implementation into AI SDK provider options instead of relying on React Native's default `global.fetch`. The current candidates are `expo/fetch` and `react-native-nitro-fetch`; the final choice remains open until real-device streaming validation is complete.

**Considered Options**

- Use React Native default `global.fetch`.
- Inject `expo/fetch`.
- Inject a `react-native-nitro-fetch` wrapper that passes `{ stream: true }`.

**Consequences**

The business layer should not parse provider-specific SSE directly. AI SDK should continue to own provider parsing and expose `fullStream`, while Cherry consumes converted chunks. Any provider-specific signing wrapper must call the shared mobile fetch transport after adding headers or signatures.
