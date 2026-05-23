# Use Startup Gates Instead Of Lifecycle Phases

Cherry Mobile will use `Bootstrap`, `InitialDataGate`, and `AfterFirstPaint` as startup gates for performance and first chat paint boundaries. These gates are not Expo, React Native, OS, or desktop lifecycle phases.

**Considered Options**

- Keep Cherry desktop phase names such as `BeforeReady`, `WhenReady`, and `Background`.
- Rename them to mobile startup gates.

**Consequences**

`InitialDataGate` is the only gate allowed to block first chat paint, and it must stay small: database readiness, initial preferences, current assistant/topic, minimum message window, and minimum chat stream ownership. Provider catalog refresh, search index, full history, sync, and diagnostics run after first paint.
