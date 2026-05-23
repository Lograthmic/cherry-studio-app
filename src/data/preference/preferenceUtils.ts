import { DefaultPreferences } from './preferenceSchemas';
import type { PreferenceDefaultScopeType, PreferenceKeyType } from './preferenceTypes';

/** Default value lookup for mobile DB-backed preferences. */
export function getDefaultValue<K extends PreferenceKeyType>(
  key: K,
): PreferenceDefaultScopeType[K] {
  return DefaultPreferences.default[key];
}

export function isPreferenceKey(key: string): key is PreferenceKeyType {
  return key in DefaultPreferences.default;
}

export function getPreferenceKeys(): PreferenceKeyType[] {
  return Object.keys(DefaultPreferences.default) as PreferenceKeyType[];
}
