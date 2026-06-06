# Use Pressable Wrappers For Product Buttons

Cherry Mobile will not use React Native's built-in `Button` as the product UI button foundation. Product controls use Cherry-owned or feature-local `Pressable` wrappers, with shared wrappers added only when repeated behavior needs one.

**Considered Options**

- Use React Native `Button` for common actions.
- Use platform-specific native toolbar buttons everywhere.
- Build Cherry-owned interaction buttons on top of `Pressable`.

**Consequences**

Android top-bar buttons use Cherry-owned header content such as `HeaderIconButton`; iOS may use `Stack.Toolbar` where it provides better native behavior. Any iOS-only polish must have an equally usable Android path.
