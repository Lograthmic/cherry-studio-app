# UI Package

Shared Cherry Studio UI assets for the mobile app. This package currently owns
the React Native version of the desktop UI icon set.

## Icon Sync

The source icons are copied from the desktop repository:

```txt
/Users/eeee/Code/03_Forks/cherry/cherry-studio/packages/ui
```

Synced source SVGs live in this package under:

```txt
packages/ui/icons/general
packages/ui/icons/providers/light
packages/ui/icons/providers/dark
packages/ui/icons/models/light
packages/ui/icons/models/dark
```

Provider icons are consumed by the mobile app as generated PNG assets:

```txt
packages/ui/src/icons-png/providers/light
packages/ui/src/icons-png/providers/dark
packages/ui/src/icons-png/providers/index.ts
```

The source SVGs under `packages/ui/icons/providers` are conversion inputs only.
Runtime provider icon imports should come from `@cherrystudio/ui/icons-png`,
not from the SVG component registry.

Generated React Native SVG components live under:

```txt
packages/ui/src/icons/general
packages/ui/src/icons/models
```

Do not edit generated icons directly. Update the SVG source or the generator,
then run the relevant generator again.

## Generation

Run all icon generation from the app workspace root:

```sh
pnpm ui:icons:generate
```

Scoped generation is also available:

```sh
pnpm ui:icons:generate:general
pnpm ui:provider-icons:generate
pnpm ui:icons:generate:models
```

The SVG component generator is:

```txt
packages/ui/src/scripts/generate-icons.ts
```

It converts SVG markup to `react-native-svg`, strips desktop-only SVG metadata,
normalizes SVG prop names, preserves `viewBox`, and creates catalogs/barrel
exports for non-provider SVG runtime usage.

Use `pnpm ui:icons:generate:svg` only when regenerating SVG runtime components
for general and model icons without touching provider PNG output.

The provider PNG generator is:

```txt
packages/ui/src/scripts/generate-provider-icons.ts
```

It renders the provider source SVGs to 72px PNGs with `sharp`, writes light and
dark assets directly under `src/icons-png/providers`, and generates a static
`require()` registry for Metro.

Current generated counts:

- General icons: 22
- Provider icons: 159
- Model icons: 35

## Provider PNG Runtime

Provider icons use PNG source pairs:

```ts
import { resolveProviderIcon } from '@cherrystudio/ui/icons-png/providers';

const icon = resolveProviderIcon(providerId);
const source = icon?.[theme];
```

Call sites pass the selected source to `expo-image`. Theme switching is handled
by choosing `light` or `dark` from the returned pair.

If a dark provider SVG does not exist, the generated dark PNG entry points to
the light PNG. This keeps the API stable while still allowing later dark assets
to be added without changing call sites.

Provider id aliases live in:

```txt
packages/ui/src/icons-png/provider-aliases.ts
```

When adding a new provider id that differs from the source SVG name, add an
alias and extend `packages/ui/src/icons-png/__tests__/providers.test.ts`.

## SVG Runtime

General icons and model icons remain SVG components:

```tsx
import { AddCategory } from '@cherrystudio/ui/icons';

<AddCategory className="size-6" />
```

The SVG runtime currently exposes general icons, model icon components, and the
model resolver:

```txt
packages/ui/src/icons/registry.ts
```

## App Wiring

The app resolves `@cherrystudio/ui` through the workspace package and tsconfig
paths. The global stylesheet includes this package as a Uniwind source so icon
`className` values can resolve:

```css
@source "../../packages/ui/src";
```

Generated icon directories are excluded from Biome checks in `biome.json`.
Run Biome against hand-written package files instead of generated icon output.

The model service settings page imports provider icons from
`@cherrystudio/ui/icons-png/providers` and renders them through
`SettingsItem.imageSource` with `expo-image`.

## Validation

After syncing or changing icons, run:

```sh
pnpm ui:icons:generate
pnpm ui:provider-icons:generate
pnpm typecheck
pnpm test packages/ui/src/icons/__tests__/registry.test.ts packages/ui/src/icons-png/__tests__/providers.test.ts --runInBand
pnpm exec biome check packages/ui
git diff --check
```

If the root app adds or removes the workspace dependency, also update
`pnpm-lock.yaml` with:

```sh
pnpm install --lockfile-only
```
