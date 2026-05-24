import m0000 from '../../../migrations/sqlite-drizzle/0000_create_preference.sql';
import m0001 from '../../../migrations/sqlite-drizzle/0001_create_app_state.sql';
import m0002 from '../../../migrations/sqlite-drizzle/0002_shocking_mandarin.sql';
import m0003 from '../../../migrations/sqlite-drizzle/0003_loving_justin_hammer.sql';
import journal from '../../../migrations/sqlite-drizzle/meta/_journal.json';

// Expo SQLite migrations must be bundled into JS; unlike the desktop main
// process, mobile runtime cannot read the Drizzle migration folder directly.
// Keep this module in the dependency graph when editing imported `.sql` files:
// Metro/Babel inline-import can otherwise serve stale inlined SQL from cache.
export const migrations = {
  journal,
  migrations: {
    m0000,
    m0001,
    m0002,
    m0003,
  },
};
