import { mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const imageSize = 72;
const packageRoot = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const sourceRoot = join(packageRoot, 'icons/providers');
const outputRoot = join(packageRoot, 'src/icons-png/providers');

type ProviderIconEntry = {
  key: string;
  fileName: string;
  hasDark: boolean;
};

function toCamelCase(fileName: string) {
  const name = fileName.replace(/\.svg$/, '');
  const parts = name.split('-');

  return (
    parts[0] +
    parts
      .slice(1)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('')
  );
}

function safeFileExists(path: string) {
  try {
    statSync(path);
    return true;
  } catch {
    return false;
  }
}

async function renderProviderIcon(sourcePath: string, outputPath: string) {
  await sharp(sourcePath, { density: 192 })
    .resize(imageSize, imageSize, {
      background: { alpha: 0, b: 0, g: 0, r: 0 },
      fit: 'contain',
    })
    .png({
      adaptiveFiltering: true,
      compressionLevel: 9,
    })
    .toFile(outputPath);
}

function writeGeneratedHeader(total: number) {
  return `/**
 * Auto-generated provider icon registry
 * Do not edit manually.
 *
 * Total provider icons: ${total}
 */

`;
}

function formatPropertyKey(key: string) {
  if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)) return key;

  return `'${key.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function buildRegistrySource(entries: ProviderIconEntry[]) {
  const objectBody = entries
    .map(({ fileName, hasDark, key }) => {
      const darkSource = hasDark
        ? `require('./dark/${fileName}.png')`
        : `require('./light/${fileName}.png')`;

      return `  ${formatPropertyKey(key)}: {
    light: require('./light/${fileName}.png'),
    dark: ${darkSource},
  },`;
    })
    .join('\n');

  return `${writeGeneratedHeader(entries.length)}import { PROVIDER_ID_ALIASES } from '../provider-aliases';

export type ProviderIconSource = {
  light: number;
  dark: number;
};

export const PROVIDER_ICONS = {
${objectBody}
} as const satisfies Record<string, ProviderIconSource>;

export type ProviderIconKey = keyof typeof PROVIDER_ICONS;

export function resolveProviderIcon(providerId: string): ProviderIconSource | undefined {
  if (!providerId) return undefined;

  const key = PROVIDER_ID_ALIASES[providerId] ?? providerId;

  return (PROVIDER_ICONS as Record<string, ProviderIconSource>)[key as ProviderIconKey];
}
`;
}

async function main() {
  const lightSourceDir = join(sourceRoot, 'light');
  const darkSourceDir = join(sourceRoot, 'dark');
  const lightAssetDir = join(outputRoot, 'light');
  const darkAssetDir = join(outputRoot, 'dark');
  const files = readdirSync(lightSourceDir)
    .filter((fileName) => fileName.endsWith('.svg'))
    .sort();
  const entries: ProviderIconEntry[] = [];

  rmSync(outputRoot, { recursive: true, force: true });
  mkdirSync(lightAssetDir, { recursive: true });
  mkdirSync(darkAssetDir, { recursive: true });

  for (const fileName of files) {
    const key = toCamelCase(fileName);
    const assetName = fileName.replace(/\.svg$/, '');
    const lightSourcePath = join(lightSourceDir, fileName);
    const darkSourcePath = join(darkSourceDir, fileName);
    const hasDark = safeFileExists(darkSourcePath);

    await renderProviderIcon(lightSourcePath, join(lightAssetDir, `${assetName}.png`));
    if (hasDark) {
      await renderProviderIcon(darkSourcePath, join(darkAssetDir, `${assetName}.png`));
    }

    entries.push({
      fileName: assetName,
      hasDark,
      key,
    });
  }

  writeFileSync(join(outputRoot, 'index.ts'), buildRegistrySource(entries));
  console.log(`Generated ${entries.length} provider icon assets at ${imageSize}px`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
