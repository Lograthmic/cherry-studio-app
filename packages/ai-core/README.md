# @cherrystudio/ai-core

Mobile copy of the desktop AI core package. It keeps the desktop package shape so provider,
runtime, plugin, and agent code can be migrated with minimal naming drift.

## Scope

- Provider extension registry and provider instance creation.
- Runtime executor and plugin pipeline for AI SDK calls.
- Agent factory used by the mobile `src/ai` adapter.
- Model, option, runtime, plugin, and provider types shared by the AI layer.

## Mobile Notes

- This package is consumed directly from TypeScript source by Expo Metro.
- Keep runtime dependencies React Native compatible. Avoid Node-only modules and `node:` imports.
- Provider instance caching uses `quick-lru@^5.1.1` to stay aligned with desktop.
- Public exports should stay compatible with desktop unless the mobile adapter explicitly narrows
  behavior.

## Not Yet Ported

- Full desktop agent session orchestration.
- Desktop IPC integration.
- Desktop-only tool and process integrations.

## Organization

```text
src/
  core/
    agents/       # AI SDK ToolLoopAgent factory
    models/       # model helpers and types
    options/      # option factories and types
    plugins/      # plugin contracts and manager
    providers/    # provider extensions and registry
    runtime/      # runtime executor and convenience calls
    utils/        # shared core helpers
```
