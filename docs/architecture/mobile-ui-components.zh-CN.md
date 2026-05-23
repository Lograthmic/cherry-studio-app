# Cherry Mobile UI Components

状态：草案

相关决策：

- [ADR 0003: Use Pressable Wrappers For Product Buttons](../adr/0003-use-pressable-wrappers-for-product-buttons.md)
- [ADR 0006: Use Platform-Native Navigation Gestures](../adr/0006-use-platform-native-navigation-gestures.md)

本文定义 Cherry Mobile v1 的交互组件边界，重点是按钮、顶部导航动作和 Liquid Glass 增强策略。术语以 [CONTEXT.md](../../CONTEXT.md) 为准。

## 原则

- 产品 UI 不直接使用 React Native `Button` 作为通用按钮基础。
- 产品按钮基于 Cherry-owned `Pressable` wrapper，统一处理 pressed、disabled、loading、hit slop、accessibility、haptics 和视觉状态。
- 平台特性是增强层，不是基础交互合同。iOS Liquid Glass 可以增强按钮外观，但 Android 和旧 iOS 必须有同等可用 fallback。
- Expo Router / React Navigation 的顶部按钮使用 `headerRight` / `headerLeft` 注入 Cherry-owned content。
- 横向业务手势不能从 Android 系统 edge zone 启动，避免抢占平台原生返回手势。

## 组件分层

`AppPressable`：

- 最底层交互 primitive。
- 封装 `Pressable` state、hit slop、accessibility role、disabled 行为和可选 haptic。
- 不绑定具体颜色、尺寸或业务语义。

`AppButton`：

- 文本或 icon+text 操作按钮。
- 用于普通页面动作、表单提交、空状态动作和底部固定操作。
- 提供 primary、secondary、danger、ghost 等产品语义 variant。

`IconButton`：

- 纯 icon 操作按钮。
- 用于工具栏、消息操作、更多菜单、刷新、关闭、发送等明确命令。
- 必须有 accessibility label；不依赖可见文字解释功能。

`HeaderIconButton`：

- 顶部导航栏按钮。
- 通过 Expo Router `Stack.Screen` options 的 `headerRight` / `headerLeft` 使用。
- 保持 iOS 和 Android 一致的点击区域、disabled/loading 状态和 fallback 样式。

`GlassButton` / glass variant：

- 仅作为可用平台上的视觉增强。
- 在 iOS 支持 Liquid Glass 时使用 `expo-glass-effect` 或对应 native enhancement。
- 在 Android、旧 iOS 或不支持 glass 的场景降级到普通 `Pressable` 样式。

## React Native Button 的使用边界

RN `Button` 可以用于临时代码、demo、系统示例或非产品化测试界面。产品界面默认不使用它，因为它：

- 样式能力有限，难以跟 Cherry 视觉系统统一。
- 难以承载自定义 pressed/loading/disabled 状态。
- 不适合作为 Liquid Glass 增强入口。
- 跨平台表现不够可控。

## 顶部导航动作

跨平台顶部右侧动作使用：

```tsx
<Stack.Screen
  options={{
    headerRight: () => (
      <HeaderIconButton
        name="settings"
        accessibilityLabel="Settings"
        onPress={openSettings}
      />
    ),
  }}
/>
```

`Stack.Toolbar` 这类 iOS-only API 可以在局部页面作为 polish layer，但不能成为基础导航合同。基础能力必须能在 iOS 和 Android 上同时成立。

## 验收

- 所有产品按钮都有 disabled、pressed 和 accessibility 状态。
- header button 在 iOS 和 Android 上点击区域一致，不因为平台样式差异变小。
- iOS glass enhancement 关闭或不可用时，按钮仍可识别、可点击、可访问。
- 图标按钮不依赖临近说明文字才能理解；无法直观看懂的图标必须有 tooltip 或菜单上下文。
- 新增按钮 variant 时，优先扩展 Cherry wrapper，不在业务组件中重复拼 `Pressable` 状态逻辑。
- swipe action、drawer、carousel 等横向组件必须避开 Android 系统边缘返回区域。
