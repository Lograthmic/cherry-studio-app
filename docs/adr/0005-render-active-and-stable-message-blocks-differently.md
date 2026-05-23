# Render Active And Stable Message Blocks Differently

Cherry Mobile will render active streaming assistant output through a streaming Markdown renderer and completed historical blocks through a stable Markdown renderer. Rendering follows Cherry's message block model instead of reparsing a whole message tree for every stream delta.

**Considered Options**

- Render every message through one Markdown path.
- Keep active streaming blocks and stable historical blocks on separate rendering paths.

**Consequences**

Active main text blocks use `react-native-streamdown` with throttled UI updates and a Streaming Text Store so only the active streaming Message item rerenders. Stable historical Markdown uses `react-native-enriched-markdown` or the same abstraction with streaming behavior disabled. The Message History Window stays database-backed and static; active assistant output is composed through an in-memory Streaming Message Overlay until final `parts`, status, stats, and metadata are persisted. Persistence checkpoints are owned by the runtime, not by render components, and should use a slower cadence than UI token updates.
