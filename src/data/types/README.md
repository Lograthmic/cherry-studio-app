# Data Types

Mobile data types migrated from the desktop shared data type packages.

## Scope

- Keep entity schemas, limits, comments, and exported type names aligned with desktop unless mobile
  has a documented runtime compatibility reason to diverge.
- API-shaped DTO schemas live under `src/data/api/schemas`; `src/data/types` owns shared entity and
  runtime data types.
- Excluded desktop domains are not migrated here yet: agent, MCP, knowledge, job, translate,
  miniapp, file, and agent workspace types.
