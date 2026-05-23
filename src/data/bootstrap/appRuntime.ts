import { Uniwind } from 'uniwind';

import type { DatabaseRuntime } from '@/data/db/client';
import { ThemeMode } from '@/data/preference';
import { initI18n } from '@/i18n';

const bootPreferenceKeys = ['app.language', 'ui.theme_mode'] as const;

export async function bootstrapAppRuntime(runtime: DatabaseRuntime) {
  const preferences = runtime.services.preference.getMultipleCached(bootPreferenceKeys);

  applyThemeModePreference(preferences['ui.theme_mode']);
  await initI18n(preferences['app.language']);
}

export function applyThemeModePreference(themeMode: ThemeMode) {
  switch (themeMode) {
    case ThemeMode.dark:
      Uniwind.setTheme('dark');
      break;
    case ThemeMode.light:
      Uniwind.setTheme('light');
      break;
    case ThemeMode.system:
      Uniwind.setTheme('system');
      break;
  }
}
