import { DefaultPreferences } from './preferenceSchemas';
import type {
  BootConfigKey,
  BootConfigSchema,
  PreferenceKeyType,
  UnifiedPreferenceKeyType,
  UnifiedPreferenceType,
} from './preferenceTypes';

const DefaultBootConfig: BootConfigSchema = {
  'app.disable_hardware_acceleration': false,
  'app.user_data_path': {},
  'temp.user_data_relocation': null,
};

export const BOOT_CONFIG_PREFIX = 'BootConfig.';

/**
 * Type guard: narrow a string to DB-backed preference keys.
 * Use in generic methods (get/set) where the true branch needs PreferenceKeyType narrowing.
 */
export function isPreferenceKey(key: string): key is PreferenceKeyType {
  return key in DefaultPreferences.default;
}

/**
 * Check if a key has the 'BootConfig.' prefix.
 * Accepts plain string (from Object.entries) — use in setMultiple-style iteration.
 */
export function isBootConfigKey(key: string): boolean {
  return key.startsWith(BOOT_CONFIG_PREFIX);
}

/** Strip 'BootConfig.' prefix and return the underlying BootConfigKey */
export function toBootConfigKey(key: string): BootConfigKey {
  return key.slice(BOOT_CONFIG_PREFIX.length) as BootConfigKey;
}

/** Unified default value lookup covering both DB preferences and BootConfig */
export function getDefaultValue<K extends UnifiedPreferenceKeyType>(
  key: K,
): UnifiedPreferenceType[K] {
  if (isPreferenceKey(key)) {
    return DefaultPreferences.default[key] as UnifiedPreferenceType[K];
  }
  const configKey = toBootConfigKey(key);
  return DefaultBootConfig[configKey] as UnifiedPreferenceType[K];
}

export function getPreferenceKeys(): PreferenceKeyType[] {
  return Object.keys(DefaultPreferences.default) as PreferenceKeyType[];
}
