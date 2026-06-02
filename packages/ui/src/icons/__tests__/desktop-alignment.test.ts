import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { MODEL_ICONS } from '../../icons-png/models';
import { PROVIDER_ICONS } from '../../icons-png/providers';

const desktopUiRoot = '/Users/eeee/Code/03_Forks/cherry/cherry-studio-base/packages/ui';

function readDesktopCatalogKeys(catalogPath: string, exportName: string) {
  const source = readFileSync(catalogPath, 'utf-8');
  const start = source.indexOf(`export const ${exportName} = {`);
  const bodyStart = source.indexOf('{', start);
  const bodyEnd = source.indexOf('\n} as const', bodyStart);
  const body = source.slice(bodyStart + 1, bodyEnd);

  return [...body.matchAll(/^ {2}(?:'([^']+)'|([A-Za-z0-9_$]+)):/gm)]
    .map((match) => match[1] ?? match[2])
    .sort();
}

const describeIfDesktopUiExists = existsSync(desktopUiRoot) ? describe : describe.skip;

describeIfDesktopUiExists('desktop icon alignment', () => {
  test('keeps model icon keys aligned with desktop catalog', () => {
    const desktopKeys = readDesktopCatalogKeys(
      join(desktopUiRoot, 'src/components/icons/models/catalog.ts'),
      'MODEL_ICON_CATALOG',
    );

    expect(Object.keys(MODEL_ICONS).sort()).toEqual(desktopKeys);
    expect(MODEL_ICONS.hunyuan).toBeDefined();
    expect(MODEL_ICONS.mimo).toBeDefined();
  });

  test('keeps provider icon keys aligned with desktop catalog', () => {
    const desktopKeys = readDesktopCatalogKeys(
      join(desktopUiRoot, 'src/components/icons/providers/catalog.ts'),
      'PROVIDER_ICON_CATALOG',
    );

    expect(Object.keys(PROVIDER_ICONS).sort()).toEqual(desktopKeys);
    expect(PROVIDER_ICONS['github-copilot']).toBeDefined();
    expect(PROVIDER_ICONS['arcee-ai']).toBeDefined();
  });
});
