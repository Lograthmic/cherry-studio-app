# Data Services

Mobile DB services migrated from the desktop `src/main/data/services` directory.

## Scope

- Keep service names, method names, ordering semantics, and service comments aligned with desktop
  unless mobile has a documented runtime compatibility reason to diverge.
- Mobile services receive `Database` through the constructor instead of using the desktop
  `application.get('DbService')` singleton.
- Desktop logger calls are omitted here unless mobile has an equivalent logging service.
- Excluded desktop domains are not migrated here yet: agent, MCP, knowledge, job, translate,
  miniapp, file, and agent workspace services.

## Runtime

Services that are part of the mobile runtime are instantiated in `src/data/db/client.ts` and exposed
through `DatabaseRuntime.services`.
