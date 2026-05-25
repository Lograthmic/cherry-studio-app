import { eq } from 'drizzle-orm';

import type { Database } from '@/data/db/client';
import { preferenceTable } from '@/data/db/schema';
import {
  DefaultPreferences,
  getDefaultValue,
  getPreferenceKeys,
  isPreferenceKey,
  type PreferenceDefaultScopeType,
  type PreferenceKeyType,
  type PreferenceUpdateOptions,
} from '@/data/preference';

type PreferenceListener = () => void;
type PreferenceValue = PreferenceDefaultScopeType[PreferenceKeyType];
type PreferenceUpdates<K extends PreferenceKeyType = PreferenceKeyType> = Partial<
  Pick<PreferenceDefaultScopeType, K>
>;
type PreferenceMultipleResult<K extends PreferenceKeyType> = {
  [P in K]: PreferenceDefaultScopeType[P];
};
type PreferenceUpdateMap = Partial<Record<PreferenceKeyType, PreferenceValue>>;

const defaultScope = 'default';
const defaultUpdateOptions: PreferenceUpdateOptions = {
  optimistic: true,
};

/**
 * Mobile PreferenceService providing cached access to SQLite-backed preferences.
 *
 * Features:
 * - In-memory cache initialized from defaults and database values
 * - Optimistic and pessimistic update strategies
 * - Batch operations for multiple preferences
 * - Integration with React's useSyncExternalStore
 */
export class PreferenceService {
  private cache: PreferenceUpdateMap = { ...DefaultPreferences.default };
  private listeners = new Map<PreferenceKeyType, Set<PreferenceListener>>();

  constructor(private readonly db: Database) {}

  async init() {
    this.cache = { ...DefaultPreferences.default };

    const rows = await this.db
      .select({
        key: preferenceTable.key,
        value: preferenceTable.value,
      })
      .from(preferenceTable)
      .where(eq(preferenceTable.scope, defaultScope));

    for (const row of rows) {
      if (isPreferenceKey(row.key)) {
        this.cache[row.key] = row.value as PreferenceValue;
      }
    }
  }

  async get<K extends PreferenceKeyType>(key: K): Promise<PreferenceDefaultScopeType[K]> {
    return this.getCachedValue(key) ?? getDefaultValue(key);
  }

  getCachedValue<K extends PreferenceKeyType>(key: K): PreferenceDefaultScopeType[K] | undefined {
    return this.cache[key] as PreferenceDefaultScopeType[K] | undefined;
  }

  async getMultipleRaw<K extends PreferenceKeyType>(
    keys: readonly K[],
  ): Promise<PreferenceMultipleResult<K>> {
    return this.getMultipleCached(keys);
  }

  getMultipleCached<K extends PreferenceKeyType>(keys: readonly K[]): PreferenceMultipleResult<K> {
    const result = {} as PreferenceMultipleResult<K>;

    for (const key of keys) {
      result[key] = this.getCachedValue(key) ?? getDefaultValue(key);
    }

    return result;
  }

  async set<K extends PreferenceKeyType>(
    key: K,
    value: PreferenceDefaultScopeType[K],
    options: PreferenceUpdateOptions = defaultUpdateOptions,
  ) {
    await this.setMultiple({ [key]: value } as PreferenceUpdates<K>, options);
  }

  async setMultiple<K extends PreferenceKeyType>(
    updates: PreferenceUpdates<K>,
    options: PreferenceUpdateOptions = defaultUpdateOptions,
  ) {
    const updateMap = updates as PreferenceUpdateMap;
    const keys = this.getUpdateKeys(updateMap);

    if (keys.length === 0) {
      return;
    }

    const previousValues = this.pickCachedValues(keys);

    if (options.optimistic) {
      this.applyUpdates(updateMap, keys);
    }

    try {
      await this.persistUpdates(updateMap, keys);

      if (!options.optimistic) {
        this.applyUpdates(updateMap, keys);
      }
    } catch (error) {
      if (options.optimistic) {
        this.restoreValues(previousValues, keys);
      }

      throw error;
    }
  }

  subscribeChange<K extends PreferenceKeyType>(key: K) {
    return (listener: PreferenceListener) => {
      const listeners = this.listeners.get(key) ?? new Set<PreferenceListener>();
      listeners.add(listener);
      this.listeners.set(key, listeners);

      return () => {
        listeners.delete(listener);

        if (listeners.size === 0) {
          this.listeners.delete(key);
        }
      };
    };
  }

  private getUpdateKeys(updates: PreferenceUpdateMap) {
    return getPreferenceKeys().filter((key) => key in updates && updates[key] !== undefined);
  }

  private pickCachedValues(keys: PreferenceKeyType[]) {
    const values: PreferenceUpdateMap = {};

    for (const key of keys) {
      values[key] = this.getCachedValue(key) ?? getDefaultValue(key);
    }

    return values;
  }

  private applyUpdates(updates: PreferenceUpdateMap, keys: PreferenceKeyType[]) {
    for (const key of keys) {
      this.cache[key] = updates[key];
    }

    this.notify(keys);
  }

  private restoreValues(values: PreferenceUpdateMap, keys: PreferenceKeyType[]) {
    for (const key of keys) {
      this.cache[key] = values[key];
    }

    this.notify(keys);
  }

  private async persistUpdates(updates: PreferenceUpdateMap, keys: PreferenceKeyType[]) {
    await this.db.transaction((tx) => {
      for (const key of keys) {
        const value = updates[key] as PreferenceValue;

        tx.insert(preferenceTable)
          .values({
            key,
            scope: defaultScope,
            value,
          })
          .onConflictDoUpdate({
            target: [preferenceTable.scope, preferenceTable.key],
            set: {
              value,
            },
          })
          .run();
      }
    });
  }

  private notify(keys: PreferenceKeyType[]) {
    for (const key of keys) {
      const listeners = this.listeners.get(key);

      if (!listeners) {
        continue;
      }

      for (const listener of listeners) {
        listener();
      }
    }
  }
}
