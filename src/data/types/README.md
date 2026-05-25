# Data Types

Mobile data types migrated from the desktop `packages/shared/data/types` and
`packages/shared/data/api/schemas` directories.

## Scope

- Keep entity schemas, DTO schemas, limits, comments, and exported type names aligned with desktop
  unless mobile has a documented runtime compatibility reason to diverge.
- Mobile currently keeps entity and DTO schemas together under `src/data/types` instead of mirroring
  the desktop package split between shared entity types and Data API endpoint schemas.
- Excluded desktop domains are not migrated here yet: agent, MCP, knowledge, job, translate,
  miniapp, file, and agent workspace types.
