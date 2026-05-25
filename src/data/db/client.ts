import { drizzle, type ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import * as SQLite from 'expo-sqlite';
import { AiService } from '@/ai/AiService';
import { AssistantService } from '../services/AssistantService';
import { GroupService } from '../services/GroupService';
import { MessageService } from '../services/MessageService';
import { ModelService } from '../services/ModelService';
import { PinService } from '../services/PinService';
import { PreferenceService } from '../services/PreferenceService';
import { PromptService } from '../services/PromptService';
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
    group: GroupService;
    message: MessageService;
    model: ModelService;
    pin: PinService;
    preference: PreferenceService;
    prompt: PromptService;
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
  const group = new GroupService(db);
  const pin = new PinService(db);
  const prompt = new PromptService(db);
  const assistant = new AssistantService(db, model, preference, tag, pin);
  const topic = new TopicService(db, pin);
  const message = new MessageService(db, topic);
  const ai = new AiService({ assistant, model, provider });

  return {
    db,
    sqlite,
    services: {
      ai,
      assistant,
      group,
      message,
      model,
      pin,
      preference,
      prompt,
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
