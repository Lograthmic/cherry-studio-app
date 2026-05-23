import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { icons } from 'lucide';

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const srcDir = join(packageRoot, 'src');
const iconsDir = join(srcDir, 'icons');

function toKebabCase(value: string) {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

rmSync(iconsDir, { recursive: true, force: true });
mkdirSync(iconsDir, { recursive: true });

const exports: string[] = [];

for (const iconName of Object.keys(icons).sort()) {
  const fileName = toKebabCase(iconName);
  const localIconName = `${iconName}IconBase`;

  writeFileSync(
    join(iconsDir, `${fileName}.tsx`),
    `import { ${iconName} as ${localIconName} } from 'lucide-react-native';
import iconWithClassName from '../iconWithClassName';

/**
 * ${iconName} icon.
 * @see https://lucide.dev/icons/${fileName}
 */
export default iconWithClassName(${localIconName});
`,
  );

  exports.push(
    `export {
  default as ${iconName}Icon,
  default as Lucide${iconName},
} from './icons/${fileName}';`,
  );
}

exports.unshift("export type { LucideIcon, LucideProps } from 'lucide-react-native';");
exports.push("export { default as iconWithClassName } from './iconWithClassName';");
exports.push("export type { LucidePropsWithClassName } from './iconWithClassName';");

writeFileSync(join(srcDir, 'index.ts'), `${exports.join('\n')}\n`);
