import { drizzle, type ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import * as SQLite from 'expo-sqlite';
import { MessageService } from '../services/MessageService';
import { ModelService } from '../services/ModelService';
import { PreferenceService } from '../services/PreferenceService';
import { ProviderService } from '../services/ProviderService';
import { TopicService } from '../services/TopicService';
import { customSqlStatements } from './customSql';
import { migrations } from './migrations';
import { type DatabaseSchema, schema } from './schema';
import { seedDatabase } from './seeding';

const databaseName = 'cherry.db';

export type Database = ExpoSQLiteDatabase<DatabaseSchema>;

export type DatabaseRuntime = {
  db: Database;
  sqlite: SQLite.SQLiteDatabase;
  services: {
    message: MessageService;
    model: ModelService;
    preference: PreferenceService;
    provider: ProviderService;
    topic: TopicService;
  };
  init: () => Promise<void>;
  dispose: () => void;
};

export function createDatabaseRuntime(): DatabaseRuntime {
  const sqlite = SQLite.openDatabaseSync(databaseName, { enableChangeListener: true });
  const db = drizzle(sqlite, { casing: 'snake_case', schema });
  const preference = new PreferenceService(db);
  const provider = new ProviderService(db);
  const model = new ModelService(db);
  const topic = new TopicService(db);
  const message = new MessageService(db, topic);

  return {
    db,
    sqlite,
    services: {
      message,
      model,
      preference,
      provider,
      topic,
    },
    init: async () => {
      await migrate(db, migrations);
      for (const statement of customSqlStatements) {
        sqlite.execSync(statement);
      }
      await seedDatabase(db);
      await preference.init();
    },
    dispose: () => {
      sqlite.closeSync();
    },
  };
}
