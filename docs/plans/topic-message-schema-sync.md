# Topic/Message Schema Sync Status

## Summary

The current mobile data-layer work is a **minimal topic/message sync**, not a full
copy of Cherry desktop's data layer.

The goal is to make `topic` and `message` real local SQLite entities for the
mobile app while keeping the dependency surface small enough to implement safely.

Reference source:

- `/Users/eeee/Code/03_Forks/cherry/cherry-studio-base`
- branch: `DeJeune/ai-service`

## What Is Aligned

- `topic` and `message` tables are aligned with Cherry's current schema shape:
  fields, core indexes, foreign keys, soft-delete columns, status/role checks,
  and message tree fields.
- `MessageData` now supports Cherry's v2 `data.parts` shape using AI SDK message
  part types.
- `blocks?` remains in the TypeScript type only for Cherry compatibility, but
  mobile runtime code should not write or render `blocks`.
- `BranchMessagesResponse` includes `activeNodeId` and `assistantId`, matching
  the current Cherry response contract.
- Local services implement the first read path:
  `TopicService.listByCursor`, `TopicService.getById`, and
  `MessageService.getBranchMessages`.
- `src/data/services` follows Cherry's service-layer shape for this area:
  `MessageService.ts`, `TopicService.ts`, `base/IBaseService.ts`, and
  service-local utilities under `utils/`.

## Minimal Dependency Tables

These dependency tables exist so `topic` and `message` can keep Cherry-compatible
foreign keys:

- `user_provider`
- `user_model`
- `assistant`
- `group`
- `pin`

These are **schema compatibility tables only** for now. The mobile app does not
yet implement their full service behavior or UI workflows.

## Intentional Differences

- This is not a full Cherry data-layer port.
- The following Cherry tables/features are not included yet:
  - `assistant_mcp_server`
  - `assistant_knowledge_base`
  - `knowledge_*`
  - `mcp_server`
  - `tag` / `entity_tag`
  - full provider/model registry merge behavior
  - assistant relation services
- `message_fts` intentionally differs from Cherry desktop today:
  - desktop currently extracts searchable text from legacy `data.blocks`
  - mobile extracts searchable text from `data.parts` only
- Runtime seeding does not insert mock topics/messages. `seedDatabase()` only
  seeds preferences.
- Existing prototype UI is not switched to SQLite yet. The DB-backed hook exists
  separately as `useDbTopicMessageWindow`.

## Current Contract

- New mobile chat data should be written as:

```ts
{
  data: {
    parts: [...]
  }
}
```

- Mobile code should not introduce new `data.blocks` usage.
- Query keys should group message reads under `queryKeys.messages`, while keeping
  the resolved endpoint key value:

```ts
queryKeys.messages.topic(topicId, limit)
// -> [`/topics/${topicId}/messages`, { limit }]
```

## Next Steps

- Decide when to switch the topic route and drawer topic list from mock data to
  SQLite-backed repositories.
- Add write paths only when the input/streaming flow is ready:
  create topic, create message, set active node, and eventually
  `reserveAssistantTurn`.
- Revisit dependency tables when implementing provider/model/assistant settings.
- Revisit `message_fts` if Cherry desktop also migrates its FTS trigger from
  `blocks` to `parts`.
