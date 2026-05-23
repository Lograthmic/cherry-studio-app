import { MODEL_ICON_CATALOG } from '../models/catalog';
import { resolveModelIcon } from '../registry';

describe('icon registry', () => {
  test('resolves the most specific model icon first', () => {
    expect(resolveModelIcon('gpt-5.1-codex-mini')).toBe(MODEL_ICON_CATALOG.gpt51CodexMini);
  });

  test('returns undefined when no model pattern matches', () => {
    expect(resolveModelIcon('unknown-model')).toBeUndefined();
  });
});
