# @cherrystudio/ai-sdk-provider

Mobile copy of Cherry Studio's AI SDK provider package. It contains provider adapters that are
used by `@cherrystudio/ai-core` when creating AI SDK models.

## Scope

- CherryIN AI SDK provider implementation.
- Provider exports consumed by `packages/ai-core`.

## Mobile Notes

- Keep provider code compatible with Expo and React Native fetch.
- Do not add fetch polyfills unless a specific runtime failure proves they are required.
- Endpoint defaults and provider behavior should stay aligned with desktop unless mobile has a
  documented compatibility reason to diverge.

## Organization

```text
src/
  cherryin-provider.ts  # CherryIN AI SDK provider
  index.ts              # package export surface
```
