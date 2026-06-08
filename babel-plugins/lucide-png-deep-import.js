/**
 * Rewrites barrel imports from `lucide-uniwind/png` into per-icon deep default imports, so Metro
 * only bundles the PNG assets that are actually referenced.
 *
 * The package keeps its full ~1944-icon barrel for ergonomic named imports and type-checking, but
 * the barrel re-exports every icon (each doing a side-effectful `require('…png')`), which defeats
 * Metro/Expo tree-shaking — without this transform the whole icon set ships (~3.3MB). Rewriting to
 * deep imports at compile time means only the imported icons enter the module graph.
 *
 *   import { PinIcon as NativePinIcon, CameraIcon } from 'lucide-uniwind/png';
 * becomes
 *   import NativePinIcon from 'lucide-uniwind/png/generated/pin';
 *   import CameraIcon from 'lucide-uniwind/png/generated/camera';
 *
 * Non-icon exports (`createPngIcon`, the `PngIconProps` type) stay on the barrel; tsc still resolves
 * the original named imports for types since this only runs in Babel, after type-checking.
 */
const BARREL = 'lucide-uniwind/png';
const GENERATED_PREFIX = 'lucide-uniwind/png/generated';

// Mirror the generator's filename casing (packages/lucide-uniwind/scripts/generate-png-icons.ts).
function toKebabCase(value) {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

// Map an exported member name to its generated file's base name, or null if it isn't an icon.
// Exports come in two shapes: `${Name}Icon` and `Lucide${Name}`. `createPngIcon` also ends with
// "Icon" but is a factory, not an icon — exclude it explicitly.
function iconBaseName(name) {
  if (name === 'createPngIcon') {
    return null;
  }
  if (name.endsWith('Icon')) {
    return name.slice(0, -'Icon'.length);
  }
  if (name.startsWith('Lucide')) {
    return name.slice('Lucide'.length);
  }
  return null;
}

module.exports = function lucidePngDeepImport({ types: t }) {
  return {
    name: 'lucide-png-deep-import',
    visitor: {
      ImportDeclaration(path) {
        const node = path.node;

        if (node.source.value !== BARREL) {
          return;
        }
        // Leave whole-declaration type imports (`import type { … }`) untouched.
        if (node.importKind === 'type') {
          return;
        }

        const deepImports = [];
        const residual = [];

        for (const spec of node.specifiers) {
          const isNamedValue =
            t.isImportSpecifier(spec) &&
            spec.importKind !== 'type' &&
            t.isIdentifier(spec.imported);
          const base = isNamedValue ? iconBaseName(spec.imported.name) : null;

          if (base) {
            deepImports.push(
              t.importDeclaration(
                [t.importDefaultSpecifier(t.identifier(spec.local.name))],
                t.stringLiteral(`${GENERATED_PREFIX}/${toKebabCase(base)}`),
              ),
            );
          } else {
            residual.push(spec);
          }
        }

        if (deepImports.length === 0) {
          return;
        }

        const replacement = [];
        if (residual.length > 0) {
          replacement.push(t.importDeclaration(residual, t.stringLiteral(BARREL)));
        }
        replacement.push(...deepImports);
        path.replaceWithMultiple(replacement);
      },
    },
  };
};
