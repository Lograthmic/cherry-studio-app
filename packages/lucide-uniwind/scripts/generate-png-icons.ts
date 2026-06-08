import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { icons } from 'lucide';
import sharp from 'sharp';

/**
 * Every lucide icon, mirrored as a cheap PNG variant. The PNG mount cost is a fraction of
 * react-native-svg's (which dominates cold mounts of icon-dense screens like the model picker),
 * so the app imports icons from `lucide-uniwind/png` instead of `lucide-uniwind`.
 *
 * Derived from lucide's full `icons` map so `lucide-uniwind/png` is a 1:1 drop-in mirror of the
 * SVG barrel (`lucide-uniwind`) — same `${Name}Icon` / `Lucide${Name}` export names. Regenerate
 * with `pnpm generate:icons:png` from the repo root after upgrading lucide.
 */
const pngIconNames = Object.keys(icons as Record<string, unknown>).sort();

const renderSize = 128;

type IconNode = [string, Record<string, string | number>];

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const outDir = join(packageRoot, 'src', 'png-icons');
const assetsDir = join(outDir, 'assets');
const generatedDir = join(outDir, 'generated');

function toKebabCase(value: string) {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

function toSvgAttributes(attributes: Record<string, string | number>) {
  return Object.entries(attributes)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');
}

function toSvgMarkup(nodes: IconNode[]) {
  const body = nodes
    .map(([tag, attributes]) => `<${tag} ${toSvgAttributes(attributes)} />`)
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${renderSize}" height="${renderSize}" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}

async function main() {
  rmSync(assetsDir, { recursive: true, force: true });
  rmSync(generatedDir, { recursive: true, force: true });
  mkdirSync(assetsDir, { recursive: true });
  mkdirSync(generatedDir, { recursive: true });

  const exportLines: string[] = [
    "export { createPngIcon } from './createPngIcon';",
    "export type { PngIconProps } from './createPngIcon';",
  ];

  for (const iconName of [...pngIconNames].sort()) {
    const nodes = (icons as Record<string, IconNode[]>)[iconName];

    if (!nodes) {
      throw new Error(`Unknown lucide icon: ${iconName}`);
    }

    const fileName = toKebabCase(iconName);

    await sharp(Buffer.from(toSvgMarkup(nodes)))
      .resize(renderSize, renderSize, {
        background: { r: 0, g: 0, b: 0, alpha: 0 },
        fit: 'contain',
      })
      .png()
      .toFile(join(assetsDir, `${fileName}.png`));

    writeFileSync(
      join(generatedDir, `${fileName}.tsx`),
      `import { createPngIcon } from '../createPngIcon';

/**
 * ${iconName} icon (PNG variant).
 * @see https://lucide.dev/icons/${fileName}
 */
export default createPngIcon(require('../assets/${fileName}.png'), '${iconName}Icon');
`,
    );

    exportLines.push(
      `export { default as ${iconName}Icon, default as Lucide${iconName} } from './generated/${fileName}';`,
    );
  }

  writeFileSync(join(outDir, 'index.ts'), `${exportLines.join('\n')}\n`);

  console.log(`Generated ${pngIconNames.length} PNG icon assets at ${renderSize}px`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
