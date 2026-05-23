import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

type IconType = 'general' | 'models';
type LogoType = 'models';

type SvgPair = {
  light: string;
  dark: string | null;
  fileName: string;
};

type GeneratedIcon = {
  dirName: string;
  componentName: string;
  colorPrimary: string;
  hasDark: boolean;
  hasBackground: boolean;
};

const packageRoot = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const iconsRoot = join(packageRoot, 'icons');
const srcIconsRoot = join(packageRoot, 'src/icons');

const sourceDirByType = {
  general: join(iconsRoot, 'general'),
  models: join(iconsRoot, 'models'),
} as const satisfies Record<IconType, string>;

const outputDirByType = {
  general: join(srcIconsRoot, 'general'),
  models: join(srcIconsRoot, 'models'),
} as const satisfies Record<IconType, string>;

const svgComponentMap: Record<string, string> = {
  circle: 'Circle',
  clipPath: 'ClipPath',
  defs: 'Defs',
  ellipse: 'Ellipse',
  feBlend: 'FeBlend',
  feColorMatrix: 'FeColorMatrix',
  feComposite: 'FeComposite',
  feFlood: 'FeFlood',
  feGaussianBlur: 'FeGaussianBlur',
  feOffset: 'FeOffset',
  filter: 'Filter',
  g: 'G',
  image: 'Image',
  linearGradient: 'LinearGradient',
  mask: 'Mask',
  path: 'Path',
  pattern: 'Pattern',
  radialGradient: 'RadialGradient',
  rect: 'Rect',
  stop: 'Stop',
  svg: 'Svg',
  title: 'Title',
  use: 'Use',
};

const attrNameMap: Record<string, string> = {
  'alignment-baseline': 'alignmentBaseline',
  'baseline-shift': 'baselineShift',
  class: 'className',
  'clip-path': 'clipPath',
  'clip-rule': 'clipRule',
  'color-interpolation-filters': 'colorInterpolationFilters',
  'dominant-baseline': 'dominantBaseline',
  'enable-background': 'enableBackground',
  'fill-opacity': 'fillOpacity',
  'fill-rule': 'fillRule',
  filterUnits: 'filterUnits',
  'flood-color': 'floodColor',
  'flood-opacity': 'floodOpacity',
  'font-family': 'fontFamily',
  'font-size': 'fontSize',
  'font-style': 'fontStyle',
  'font-weight': 'fontWeight',
  'gradient-transform': 'gradientTransform',
  'gradient-units': 'gradientUnits',
  'marker-end': 'markerEnd',
  'marker-mid': 'markerMid',
  'marker-start': 'markerStart',
  'mask-type': 'maskType',
  maskContentUnits: 'maskContentUnits',
  maskUnits: 'maskUnits',
  'pattern-content-units': 'patternContentUnits',
  'pattern-transform': 'patternTransform',
  'pattern-units': 'patternUnits',
  preserveAspectRatio: 'preserveAspectRatio',
  'stop-color': 'stopColor',
  'stop-opacity': 'stopOpacity',
  'stroke-dasharray': 'strokeDasharray',
  'stroke-dashoffset': 'strokeDashoffset',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'stroke-miterlimit': 'strokeMiterlimit',
  'stroke-opacity': 'strokeOpacity',
  'stroke-width': 'strokeWidth',
  'text-anchor': 'textAnchor',
  'vector-effect': 'vectorEffect',
  'xlink:href': 'xlinkHref',
  version: '',
  xmlns: '',
  'xmlns:xlink': '',
};

const literalAttrNames = new Set([
  'cx',
  'cy',
  'dx',
  'dy',
  'fillOpacity',
  'height',
  'k1',
  'k2',
  'k3',
  'k4',
  'offset',
  'opacity',
  'r',
  'rx',
  'ry',
  'strokeDashoffset',
  'strokeMiterlimit',
  'strokeOpacity',
  'strokeWidth',
  'width',
  'x',
  'x1',
  'x2',
  'y',
  'y1',
  'y2',
]);

function parseTypeArg(): IconType | 'all' {
  const arg = process.argv.find((item) => item.startsWith('--type='));
  if (!arg) return 'all';

  const value = arg.split('=')[1];
  if (value === 'general' || value === 'models') return value;

  throw new Error(`Invalid --type value: ${value}. Use general or models.`);
}

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

function toPascalCase(fileName: string) {
  const name = fileName.replace(/\.svg$/, '');

  if (/^\d/.test(name)) {
    const match = name.match(/^(\d+)(.*)$/);
    if (match) {
      const [, numbers, rest] = match;
      const restCamel = rest.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase());
      return restCamel.charAt(0).toUpperCase() + restCamel.slice(1) + numbers;
    }
  }

  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

function isIdentifier(value: string) {
  return /^[A-Za-z_$][\w$]*$/.test(value);
}

function quoteObjectKey(value: string) {
  return isIdentifier(value) ? value : JSON.stringify(value);
}

function isNumericLiteral(value: string) {
  return /^-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?$/i.test(value);
}

function isString(value: string | null): value is string {
  return value !== null;
}

function normalizeSvg(svgCode: string) {
  return svgCode
    .replace(/<\?xml[\s\S]*?\?>/g, '')
    .replace(/<!DOCTYPE[\s\S]*?>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<\/?metadata[\s\S]*?>/gi, '')
    .replace(/<title[\s\S]*?<\/title>/gi, '');
}

function ensureViewBox(svgCode: string) {
  if (/viewBox\s*=\s*"[^"]*"/.test(svgCode)) return svgCode;

  const widthMatch = svgCode.match(/<svg[^>]*\bwidth="(\d+(?:\.\d+)?)"/);
  const heightMatch = svgCode.match(/<svg[^>]*\bheight="(\d+(?:\.\d+)?)"/);

  if (widthMatch && heightMatch) {
    return svgCode.replace(/<svg\b/, `<svg viewBox="0 0 ${widthMatch[1]} ${heightMatch[1]}"`);
  }

  return svgCode;
}

function sanitizeRootSvgAttrs(attrSource: string) {
  return attrSource
    .replace(/\swidth=(["'])[^"']*\1/g, '')
    .replace(/\sheight=(["'])[^"']*\1/g, '')
    .replace(/\srole=(["'])[^"']*\1/g, '')
    .replace(/\sstyle=(["'])[^"']*\1/g, '');
}

function extractRootSvg(svgCode: string) {
  const match = svgCode.match(/<svg\b([^>]*)>([\s\S]*?)<\/svg>/i);
  if (!match) throw new Error('SVG root not found');

  return {
    attrs: sanitizeRootSvgAttrs(match[1]),
    body: match[2],
  };
}

function splitAttributes(source: string) {
  const attrs: Array<{ name: string; value: string | true }> = [];
  const attrPattern =
    /([:@A-Za-z_][:@A-Za-z0-9_.-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

  for (const match of source.matchAll(attrPattern)) {
    const [, name, doubleQuoted, singleQuoted, unquoted] = match;
    attrs.push({ name, value: doubleQuoted ?? singleQuoted ?? unquoted ?? true });
  }

  return attrs;
}

function convertStyle(value: string): string | undefined {
  const entries: string[] = value
    .split(';')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [rawKey, ...rest] = item.split(':');
      const rawValue = rest.join(':').trim();
      const key = attrNameMap[rawKey.trim()] ?? toCamelCase(rawKey.trim());

      if (!key || !rawValue) return null;
      return `${key}: ${formatAttrValue(key, rawValue)}`;
    })
    .filter(isString);

  return entries.length > 0 ? `{{ ${entries.join(', ')} }}` : undefined;
}

function formatAttrValue(name: string, value: string | true): string | undefined {
  if (value === true) return '{true}';

  if (name === 'colorInterpolationFilters') {
    return undefined;
  }

  if (name === 'style') {
    return convertStyle(value);
  }

  if (literalAttrNames.has(name) && isNumericLiteral(value)) {
    return `{${value}}`;
  }

  if ((name === 'values' || name === 'strokeDasharray') && value.includes(' ')) {
    const values = value.split(/[\s,]+/).filter(Boolean);
    if (values.every(isNumericLiteral)) {
      return `{[${values.join(', ')}]}`;
    }
  }

  return JSON.stringify(value);
}

function convertAttributes(source: string) {
  const attrs: string[] = [];

  for (const attr of splitAttributes(source)) {
    const mappedName = attrNameMap[attr.name] ?? attr.name;
    if (!mappedName) continue;

    const mappedValue = formatAttrValue(mappedName, attr.value);
    if (!mappedValue) continue;

    attrs.push(`${mappedName}=${mappedValue}`);
  }

  return attrs.length > 0 ? ` ${attrs.join(' ')}` : '';
}

function convertXmlToJsx(xml: string, usedComponents: Set<string>): string {
  let output = xml;

  output = output.replace(
    /<([A-Za-z][A-Za-z0-9:-]*)([^<>]*?)(\/?)>/g,
    (_, rawTag: string, attrs: string, selfClosing: string) => {
      const tag = svgComponentMap[rawTag];
      if (!tag) return '';
      usedComponents.add(tag);
      return `<${tag}${convertAttributes(attrs)}${selfClosing ? ' /' : ''}>`;
    },
  );

  output = output.replace(/<\/([A-Za-z][A-Za-z0-9:-]*)>/g, (_, rawTag: string) => {
    const tag = svgComponentMap[rawTag];
    return tag ? `</${tag}>` : '';
  });

  return output.trim();
}

function extractColorPrimary(svgCode: string) {
  const colorCounts = new Map<string, number>();

  for (const [, color] of svgCode.matchAll(/(?:fill|stroke)=["']([^"']+)["']/g)) {
    if (color === 'none' || color === 'currentColor' || color.startsWith('url(')) continue;
    if (/^(?:white|#fff(?:fff)?|#FFFFFF)$/i.test(color)) continue;
    colorCounts.set(color, (colorCounts.get(color) ?? 0) + 1);
  }

  let maxColor = '#000000';
  let maxCount = 0;

  for (const [color, count] of colorCounts) {
    if (count > maxCount) {
      maxColor = /^black$/i.test(color) ? '#000000' : color;
      maxCount = count;
    }
  }

  return maxColor;
}

function hasBackground(svgCode: string) {
  const viewBox = svgCode.match(/viewBox\s*=\s*"([^"]+)"/);
  if (!viewBox) return false;

  const [, , widthValue, heightValue] = viewBox[1]
    .split(/[\s,]+/)
    .map((value) => Number.parseFloat(value)) as [number, number, number, number];
  const width = Number.isFinite(widthValue) ? widthValue : 0;
  const height = Number.isFinite(heightValue) ? heightValue : 0;
  if (width <= 0 || height <= 0) return false;

  const rectMatch = svgCode.match(/<rect\b([^>]*)>/i);
  if (rectMatch) {
    const attrs = Object.fromEntries(
      splitAttributes(rectMatch[1])
        .filter((attr): attr is { name: string; value: string } => typeof attr.value === 'string')
        .map((attr) => [attr.name, attr.value]),
    );
    const rectWidth = Number.parseFloat(attrs.width ?? '0');
    const rectHeight = Number.parseFloat(attrs.height ?? '0');
    if (rectWidth >= width * 0.75 && rectHeight >= height * 0.75 && attrs.fill !== 'none') {
      return true;
    }
  }

  const pathMatch = svgCode.match(/<path\b([^>]*)>/i);
  const d = pathMatch?.[1].match(/\bd=(["'])(.*?)\1/)?.[2];
  return Boolean(d && (d.includes('H') || d.includes('h')) && (d.includes('V') || d.includes('v')));
}

function buildComponentSource(svgPath: string, componentName: string, typeImportPath: string) {
  const rawSvg = readFileSync(svgPath, 'utf-8');
  const normalized = ensureViewBox(normalizeSvg(rawSvg));
  const root = extractRootSvg(normalized);
  const usedComponents = new Set<string>();
  const rootAttrs = convertAttributes(root.attrs);
  const body = convertXmlToJsx(root.body, usedComponents);
  const imports = ['Svg', ...Array.from(usedComponents).filter((name) => name !== 'Svg')].sort();

  return `import { ${imports.join(', ')} } from 'react-native-svg';

import { useIconProps } from '${typeImportPath.replace(/types$/, 'icon-style')}';
import type { IconComponent } from '${typeImportPath}';

const ${componentName}: IconComponent = ({ className, ...props }) => {
  const iconProps = useIconProps(className, props);

  return (
    <Svg${rootAttrs} width="1em" height="1em" {...iconProps}>
      ${body}
    </Svg>
  );
};

export { ${componentName} };
export default ${componentName};
`;
}

function collectFlatSvgs() {
  return readdirSync(sourceDirByType.general)
    .filter((fileName) => fileName.endsWith('.svg'))
    .sort();
}

function collectLogoPairs(type: LogoType) {
  const lightDir = join(sourceDirByType[type], 'light');
  const darkDir = join(sourceDirByType[type], 'dark');

  return readdirSync(lightDir)
    .filter((fileName) => fileName.endsWith('.svg'))
    .sort()
    .map((fileName): SvgPair => {
      const darkPath = join(darkDir, fileName);
      return {
        light: join(lightDir, fileName),
        dark: safeFileExists(darkPath) ? darkPath : null,
        fileName,
      };
    });
}

function safeFileExists(path: string) {
  try {
    readFileSync(path);
    return true;
  } catch {
    return false;
  }
}

function writeGeneratedHeader(total: number, label: string) {
  return `/**
 * Auto-generated ${label}
 * Do not edit manually.
 *
 * Total icons: ${total}
 */

`;
}

function generateGeneral() {
  const outputDir = outputDirByType.general;
  rmSync(outputDir, { recursive: true, force: true });
  mkdirSync(outputDir, { recursive: true });

  const files = collectFlatSvgs();
  const exports: string[] = [];

  for (const fileName of files) {
    const componentName = toPascalCase(fileName);
    const outputName = `${toCamelCase(fileName)}.tsx`;
    const source = buildComponentSource(
      join(sourceDirByType.general, fileName),
      componentName,
      '../types',
    );

    writeFileSync(join(outputDir, outputName), source);
    exports.push(`export { ${componentName} } from './${outputName.replace(/\.tsx$/, '')}';`);
  }

  writeFileSync(
    join(outputDir, 'index.ts'),
    `${writeGeneratedHeader(files.length, 'general icon exports')}${exports.join('\n')}\n`,
  );
  console.log(`Generated ${files.length} general icons`);
}

function generateMeta(iconDir: string, dirName: string, colorPrimary: string) {
  writeFileSync(
    join(iconDir, 'meta.ts'),
    `import type { IconMeta } from '../../types';

export const meta: IconMeta = {
  id: '${dirName}',
  colorPrimary: '${colorPrimary}',
  colorScheme: 'color',
};
`,
  );
}

function generateAvatar(iconDir: string, componentName: string, variant: 'padded' | 'full-bleed') {
  const iconSize = variant === 'full-bleed' ? 'size * 0.82' : 'size * 0.7';
  const backgroundFallback = variant === 'full-bleed' ? 'transparent' : '#FFFFFF';

  writeFileSync(
    join(iconDir, 'avatar.tsx'),
    `import { View } from 'react-native';
import { useUniwind } from 'uniwind';

import type { IconAvatarProps } from '../../types';
import { ${componentName}Dark } from './dark';
import { ${componentName}Light } from './light';

export function ${componentName}Avatar({
  size = 32,
  shape = 'circle',
  background = '${backgroundFallback}',
  className: _className,
}: Omit<IconAvatarProps, 'icon'>) {
  const { theme } = useUniwind();
  const Icon = theme === 'dark' ? ${componentName}Dark : ${componentName}Light;
  const borderRadius = shape === 'circle' ? size / 2 : size * 0.2;
  const iconSize = ${iconSize};

  return (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: background,
        borderRadius,
        height: size,
        justifyContent: 'center',
        overflow: 'hidden',
        width: size,
      }}
    >
      <Icon height={iconSize} width={iconSize} />
    </View>
  );
}
`,
  );
}

function generateCompoundIndex(
  iconDir: string,
  componentName: string,
  colorPrimary: string,
  hasDarkVariant: boolean,
) {
  const darkAliasImport = hasDarkVariant
    ? `import { ${componentName}Dark } from './dark';`
    : `import { ${componentName}Light as ${componentName}Dark } from './light';`;

  writeFileSync(
    join(iconDir, 'index.tsx'),
    `import { useUniwind } from 'uniwind';

import type { CompoundIcon, CompoundIconProps } from '../../types';
import { ${componentName}Avatar } from './avatar';
${darkAliasImport}
import { ${componentName}Light } from './light';

const ${componentName} = ({ variant, ...props }: CompoundIconProps) => {
  const { theme } = useUniwind();
  const resolvedVariant = variant ?? (theme === 'dark' ? 'dark' : 'light');
  const Icon = resolvedVariant === 'dark' ? ${componentName}Dark : ${componentName}Light;

  return <Icon {...props} />;
};

export const ${componentName}Icon: CompoundIcon = Object.assign(${componentName}, {
  Avatar: ${componentName}Avatar,
  colorPrimary: '${colorPrimary}',
});

export default ${componentName}Icon;
`,
  );
}

function generateBarrelIndex(outputDir: string, entries: GeneratedIcon[]) {
  const exports = entries
    .map(
      ({ dirName, componentName }) =>
        `export { ${componentName}Icon as ${componentName} } from './${dirName}';`,
    )
    .join('\n');

  writeFileSync(
    join(outputDir, 'index.ts'),
    `${writeGeneratedHeader(entries.length, 'compound icon exports')}${exports}\n`,
  );
}

function generateCatalog(outputDir: string, entries: GeneratedIcon[], catalogName: string) {
  const imports = entries
    .map(({ dirName, componentName }) => `import { ${componentName}Icon } from './${dirName}';`)
    .join('\n');
  const objectBody = entries
    .map(({ dirName, componentName }) => `  ${quoteObjectKey(dirName)}: ${componentName}Icon,`)
    .join('\n');
  const keyTypeName = `${catalogName
    .replace(/_CATALOG$/, '')
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')}Key`;

  writeFileSync(
    join(outputDir, 'catalog.ts'),
    `${writeGeneratedHeader(entries.length, 'icon catalog')}import type { CompoundIcon } from '../types';
${imports}

export const ${catalogName} = {
${objectBody}
} as const satisfies Record<string, CompoundIcon>;

export type ${keyTypeName} = keyof typeof ${catalogName};
`,
  );
}

function generateLogos(type: LogoType) {
  const outputDir = outputDirByType[type];
  rmSync(outputDir, { recursive: true, force: true });
  mkdirSync(outputDir, { recursive: true });

  const entries: GeneratedIcon[] = [];

  for (const pair of collectLogoPairs(type)) {
    const dirName = toCamelCase(pair.fileName);
    const componentName = toPascalCase(pair.fileName);
    const iconDir = join(outputDir, dirName);
    const lightSvg = readFileSync(pair.light, 'utf-8');
    const colorPrimary = extractColorPrimary(lightSvg);
    const background = hasBackground(ensureViewBox(normalizeSvg(lightSvg)));

    mkdirSync(iconDir, { recursive: true });
    writeFileSync(
      join(iconDir, 'light.tsx'),
      buildComponentSource(pair.light, `${componentName}Light`, '../../types'),
    );
    if (pair.dark) {
      writeFileSync(
        join(iconDir, 'dark.tsx'),
        buildComponentSource(pair.dark, `${componentName}Dark`, '../../types'),
      );
    } else {
      writeFileSync(
        join(iconDir, 'dark.tsx'),
        `export { ${componentName}Light as ${componentName}Dark } from './light';
export { ${componentName}Light as default } from './light';
`,
      );
    }
    generateMeta(iconDir, dirName, colorPrimary);
    generateAvatar(iconDir, componentName, background ? 'full-bleed' : 'padded');
    generateCompoundIndex(iconDir, componentName, colorPrimary, Boolean(pair.dark));

    entries.push({
      dirName,
      componentName,
      colorPrimary,
      hasDark: Boolean(pair.dark),
      hasBackground: background,
    });
  }

  generateBarrelIndex(outputDir, entries);
  generateCatalog(outputDir, entries, 'MODEL_ICON_CATALOG');
  console.log(`Generated ${entries.length} ${type} icons`);
}

function main() {
  const type = parseTypeArg();

  if (type === 'all' || type === 'general') generateGeneral();
  if (type === 'all' || type === 'models') generateLogos('models');
}

main();
