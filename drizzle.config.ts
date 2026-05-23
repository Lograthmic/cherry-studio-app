import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/data/db/schema/index.ts',
  out: './migrations/sqlite-drizzle',
  dialect: 'sqlite',
  casing: 'snake_case',
});
