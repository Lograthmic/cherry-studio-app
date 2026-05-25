import { drizzle, type ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import * as SQLite from 'expo-sqlite';
import { AiService } from '@/ai/AiService';
import { AssistantService } from '../services/AssistantService';
import { MessageService } from '../services/MessageService';
import { ModelService } from '../services/ModelService';
import { PreferenceService } from '../services/PreferenceService';
import { ProviderService } from '../services/ProviderService';
import { TagService } from '../services/TagService';
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
    ai: AiService;
    assistant: AssistantService;
    message: MessageService;
    model: ModelService;
    preference: PreferenceService;
    provider: ProviderService;
    tag: TagService;
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
  const tag = new TagService(db);
  const assistant = new AssistantService(db, model, preference, tag);
  const topic = new TopicService(db);
  const message = new MessageService(db, topic);
  const ai = new AiService({ assistant, model, provider });

  return {
    db,
    sqlite,
    services: {
      ai,
      assistant,
      message,
      model,
      preference,
      provider,
      tag,
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
