import type { Database } from '../client';
import { SeedRunner } from './SeedRunner';
import { MockChatSeeder } from './seeders/MockChatSeeder';
import { PreferenceSeeder } from './seeders/PreferenceSeeder';
import { PresetProviderSeeder } from './seeders/PresetProviderSeeder';
import type { DatabaseSeeder } from './types';

export async function seedDatabase(db: Database) {
  await new SeedRunner(db).runAll(await createSeeders());
}

async function createSeeders(): Promise<DatabaseSeeder[]> {
  const seeders: DatabaseSeeder[] = [new PreferenceSeeder(), new PresetProviderSeeder()];

  if (isDevelopmentBuild()) {
    seeders.push(new MockChatSeeder());
  }

  return seeders;
}

function isDevelopmentBuild() {
  return typeof __DEV__ !== 'undefined' && __DEV__;
}
