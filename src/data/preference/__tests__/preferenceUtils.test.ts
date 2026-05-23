import {
  DefaultPreferences,
  getDefaultValue,
  getPreferenceKeys,
  isPreferenceKey,
  ThemeMode,
} from '..';

describe('preference defaults', () => {
  test('keeps the mobile preference surface intentionally small', () => {
    expect(getPreferenceKeys().sort()).toEqual([
      'app.language',
      'app.user.id',
      'app.user.name',
      'chat.default_model_id',
      'chat.web_search.compression.cutoff_limit',
      'chat.web_search.compression.method',
      'chat.web_search.default_fetch_urls_provider',
      'chat.web_search.default_search_keywords_provider',
      'chat.web_search.exclude_domains',
      'chat.web_search.max_results',
      'chat.web_search.provider_overrides',
      'feature.quick_assistant.model_id',
      'feature.translate.model_id',
      'ui.theme_mode',
    ]);
  });

  test('returns Cherry-aligned default values', () => {
    expect(getDefaultValue('app.language')).toBeNull();
    expect(getDefaultValue('app.user.id')).toBe('uuid()');
    expect(getDefaultValue('app.user.name')).toBe('');
    expect(getDefaultValue('chat.default_model_id')).toBeNull();
    expect(getDefaultValue('chat.web_search.compression.cutoff_limit')).toBe(2000);
    expect(getDefaultValue('chat.web_search.compression.method')).toBe('none');
    expect(getDefaultValue('chat.web_search.default_fetch_urls_provider')).toBeNull();
    expect(getDefaultValue('chat.web_search.default_search_keywords_provider')).toBeNull();
    expect(getDefaultValue('chat.web_search.exclude_domains')).toEqual([]);
    expect(getDefaultValue('chat.web_search.max_results')).toBe(5);
    expect(getDefaultValue('chat.web_search.provider_overrides')).toEqual({});
    expect(getDefaultValue('feature.quick_assistant.model_id')).toBeNull();
    expect(getDefaultValue('feature.translate.model_id')).toBeNull();
    expect(getDefaultValue('ui.theme_mode')).toBe(ThemeMode.system);
  });

  test('narrows known preference keys', () => {
    expect(isPreferenceKey('app.language')).toBe(true);
    expect(isPreferenceKey('chat.default_model_id')).toBe(true);
    expect(isPreferenceKey('chat.web_search.max_results')).toBe(true);
    expect(isPreferenceKey('BootConfig.example')).toBe(false);
    expect(Object.keys(DefaultPreferences.default)).toHaveLength(14);
  });
});
