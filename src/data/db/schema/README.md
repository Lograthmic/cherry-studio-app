# Data DB Schemas

Mobile Drizzle schemas migrated from the desktop `src/main/data/db/schemas` directory.

## Scope

- Keep table names, column names, indexes, constraints, and schema comments aligned with desktop
  unless mobile has a documented runtime compatibility reason to diverge.
- `_columnHelpers.ts` mirrors desktop `_columnHelpers.ts` but keeps Expo-compatible UUID generation
  for drizzle-kit and React Native runtime loading.
- Excluded desktop domains are not migrated here yet: agent, MCP, knowledge, job, translate,
  miniapp, file, and agent workspace tables.

## Migration Flow

After changing a schema file, run `pnpm db:generate` and add the generated SQL import to
`src/data/db/migrations.ts` so Expo can bundle the migration.
