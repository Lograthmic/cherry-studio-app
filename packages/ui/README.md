# UI Package

Shared Cherry Studio UI assets for the mobile app. This package owns the mobile
PNG runtime for the desktop UI icon set.

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

Generated PNG assets are consumed by the mobile app through static Metro
registries:

```txt
packages/ui/src/icons-png/general/light
packages/ui/src/icons-png/general/dark
packages/ui/src/icons-png/models/light
packages/ui/src/icons-png/models/dark
packages/ui/src/icons-png/providers/light
packages/ui/src/icons-png/providers/dark
packages/ui/src/icons-png/**/index.ts
```

The source SVGs under `packages/ui/icons` are conversion inputs only. Runtime
imports should come from `@cherrystudio/ui/icons` or `@cherrystudio/ui/icons-png`,
not from the source SVG directories.

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

The PNG generator is:

```txt
packages/ui/src/scripts/generate-icons.ts
```

It renders general, model, and provider SVG sources to 72px PNGs with `sharp`,
writes light and dark assets under `src/icons-png`, and generates static
`require()` registries for Metro. SVGs using `currentColor` are rendered as
theme foreground PNG pairs.

Current generated counts:

- General icons: 22
- Provider icons: 159
- Model icons: 35

## PNG Runtime

Icons use PNG source pairs:

```ts
import { resolveIcon, resolveProviderIcon } from '@cherrystudio/ui/icons';

const icon = resolveIcon(modelId, providerId) ?? resolveProviderIcon(providerId);
const source = icon?.[theme];
```

Call sites pass the selected source to `expo-image`. Theme switching is handled
by choosing `light` or `dark` from the returned pair.

If a dark SVG does not exist, the generated dark PNG entry points to the light
PNG unless the source uses `currentColor`. This keeps the API stable while still
allowing later dark assets to be added without changing call sites.

Provider id aliases live in:

```txt
packages/ui/src/icons-png/provider-aliases.ts
```

When adding a new provider id that differs from the source SVG name, add an
alias and extend `packages/ui/src/icons-png/__tests__/providers.test.ts`.

## App Wiring

The app resolves `@cherrystudio/ui` through the workspace package and tsconfig
paths.

Generated icon directories are excluded from Biome checks in `biome.json`.
Run Biome against hand-written package files instead of generated icon output.

The model picker and settings pages render resolver output with `expo-image`.

## Validation

After syncing or changing icons, run:

```sh
pnpm ui:icons:generate
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
