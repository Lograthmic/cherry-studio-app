import type { DatabaseSeeder } from '../types';

jest.mock('@/core/logger/loggerService', () => ({
  loggerService: {
    withContext: () => ({
      debug: jest.fn(),
      info: jest.fn(),
    }),
  },
}));

const { SeedRunner } = jest.requireActual('../SeedRunner') as typeof import('../SeedRunner');

type JournalRow = {
  description?: string;
  key: string;
  value: unknown;
};

describe('SeedRunner', () => {
  test('runs a new seeder and writes its journal', async () => {
    const db = createFakeDatabase();
    let runCount = 0;
    const seeder = createSeeder('test-seed', 'v1', async () => {
      runCount += 1;
    });

    await new SeedRunner(db).runAll([seeder]);

    expect(runCount).toBe(1);
    expect(db.journals.get('seed:test-seed')).toMatchObject({
      description: 'Test seed description',
      key: 'seed:test-seed',
      value: { version: 'v1' },
    });
  });

  test('skips a seeder when the recorded version matches', async () => {
    const db = createFakeDatabase();
    let runCount = 0;
    const seeder = createSeeder('test-seed', 'v1', async () => {
      runCount += 1;
    });
    const runner = new SeedRunner(db);

    await runner.runAll([seeder]);
    await runner.runAll([seeder]);

    expect(runCount).toBe(1);
  });

  test('reruns a seeder when the version changes', async () => {
    const db = createFakeDatabase();
    let runCount = 0;
    const runner = new SeedRunner(db);

    await runner.runAll([
      createSeeder('test-seed', 'v1', async () => {
        runCount += 1;
      }),
    ]);
    await runner.runAll([
      createSeeder('test-seed', 'v2', async () => {
        runCount += 1;
      }),
    ]);

    expect(runCount).toBe(2);
    expect(db.journals.get('seed:test-seed')?.value).toEqual({ version: 'v2' });
  });
});

function createSeeder(
  name: string,
  version: string,
  run: (db: ReturnType<typeof createFakeDatabase>) => Promise<void>,
): DatabaseSeeder {
  return {
    description: 'Test seed description',
    name,
    run: async (db) => run(db as ReturnType<typeof createFakeDatabase>),
    version,
  };
}

function createFakeDatabase() {
  const journals = new Map<string, JournalRow>();

  const db = {
    journals,
    select: () => ({
      from: () => ({
        where: () => Promise.resolve(Array.from(journals.values())),
      }),
    }),
    insert: () => ({
      values: (row: JournalRow) => ({
        onConflictDoUpdate: ({ set }: { set: Partial<JournalRow> }) => ({
          run: () => {
            journals.set(row.key, {
              ...row,
              ...set,
              key: row.key,
            });
          },
        }),
      }),
    }),
  };

  return db as typeof db & ConstructorParameters<typeof SeedRunner>[0];
}
