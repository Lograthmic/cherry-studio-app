# Use Pressable Wrappers For Product Buttons

Cherry Mobile will not use React Native's built-in `Button` as the product UI button foundation. Product controls will be built from `Pressable` wrappers such as `AppPressable`, `IconButton`, `HeaderIconButton`, and a Liquid Glass-capable glass button variant.

**Considered Options**

- Use React Native `Button` for common actions.
- Use platform-specific native toolbar buttons everywhere.
- Build Cherry-owned interaction buttons on top of `Pressable`.

**Consequences**

Expo Router and React Navigation top-bar buttons should use `headerRight` and `headerLeft` with Cherry-owned `HeaderIconButton` content. iOS-only `Stack.Toolbar` can be a localized polish layer, but it is not the base navigation API because Android needs an equally usable fallback.
