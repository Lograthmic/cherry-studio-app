# Cherry Mobile Navigation And Insets

状态：草案

相关决策：

- [ADR 0006: Use Platform-Native Navigation Gestures](../adr/0006-use-platform-native-navigation-gestures.md)
- [ADR 0007: Use Route-Level Form Sheets For Page-Like Pickers](../adr/0007-use-route-level-form-sheets-for-page-like-pickers.md)
- [ADR 0003: Use Pressable Wrappers For Product Buttons](../adr/0003-use-pressable-wrappers-for-product-buttons.md)

本文定义 Cherry Mobile v1 的导航手势、Android predictive back、edge-to-edge 与 safe-area/inset 策略。术语以 [CONTEXT.md](../../CONTEXT.md) 为准。

## 原则

- Android 边缘返回手势是平台原生能力，Cherry Mobile 不用 JavaScript 自己模拟 edge-swipe back。
- Expo Router `Stack` / React Navigation native-stack 负责接入原生页面栈与返回动画，底层依赖 `react-native-screens`。
- edge-to-edge 是平台窗口布局能力，App 负责把 header、tab、chat input、message list 和 keyboard 区域正确适配 inset。
- 系统手势区域属于系统。业务横向手势不能抢 Android 屏幕边缘。
- 返回拦截只用于明确业务状态，例如未保存编辑、正在生成中的确认、危险操作确认。
- 页面级 picker 和可增长的选择流优先建模为 route-level `formSheet`，让 Android 系统返回先关闭 sheet。

## Android 返回手势

Android 设备上的左右边缘返回由系统导航手势处理。Cherry Mobile 只声明导航结构和 screen options：

```tsx
<Stack
  screenOptions={{
    headerShown: false,
  }}
/>
```

页面返回优先走原生 stack。不要为了“统一 iOS 侧滑体验”在 Android 上添加全局 `PanGestureHandler` 或自定义全屏返回手势。

## Predictive back

Android predictive back preview 是系统能力，不是应用自绘动画。Expo 配置入口是：

```json
{
  "expo": {
    "android": {
      "predictiveBackGestureEnabled": false
    }
  }
}
```

v1 建议保持 `false` 作为保守默认。等导航结构、modal 行为、未保存状态和生成中状态稳定后，再开启并做真机验证。

开启前必须验证：

- 普通 stack 返回显示正确 preview。
- tab 内 nested stack 返回目标正确。
- modal / sheet 关闭行为符合平台预期。
- 局部 `BackHandler` 不破坏系统 preview。
- 正在生成、未保存编辑、危险确认等页面能正确阻止或确认返回。

## Route-level formSheet

模型选择、provider 选择、附件来源选择、带搜索/分组/说明的长列表 picker，默认使用 Expo Router route-level `formSheet`。这类 sheet 是 navigation stack 顶层 route，不是普通 overlay；Android 系统返回应该先 dismiss/pop sheet，再返回底层聊天页面。

推荐形状：

```tsx
<Stack.Screen
  name="model-picker"
  options={{
    presentation: 'formSheet',
    sheetAllowedDetents: [0.5, 0.9],
    sheetInitialDetentIndex: 0,
    sheetCornerRadius: 24,
  }}
/>
```

从 chat input 打开模型选择时，先 blur 输入框，再 push sheet route：

```ts
inputRef.current?.blur()
router.push('/chat/model-picker')
```

选择完成后更新 draft model，然后返回：

```ts
setDraftModel(modelId)
router.back()
```

v1 中 `formSheet` 内容保持单屏。可以在同一 sheet 内做搜索、provider 分组、最近使用和能力标签，但不要在 Android sheet 内再嵌套 push 详情页。需要详情时，关闭 sheet 后进入普通页面，或在 sheet 内使用本地 state 展开详情。

## 组件级 sheet 边界

组件级 bottom sheet 只用于纯局部、短生命周期、无需进入 navigation history 的面板，例如少量快捷项、局部 filter 或临时操作菜单。

不要把模型选择这类会增长的 picker 做成 JS bottom sheet，除非确认不需要系统返回 preview、深链、页面级关闭语义和 navigation history。JS sheet 通常需要自己接 `BackHandler`，会削弱 Android predictive back 的原生连续性。

## Edge-to-edge 与 insets

Android edge-to-edge 不应该通过给系统 navigation bar 固定背景色来规避。Cherry Mobile 需要在布局层显式处理：

- 顶部 header 避开 status bar inset。
- 底部 tab 避开 navigation bar inset。
- chat input 同时处理 bottom inset 和 keyboard inset。
- message list 的 `contentContainerStyle` 为 chat input、tab 和 bottom inset 留出空间。
- 全屏页面、图片预览、modal 和 sheet 明确选择是否绘制到系统栏后面。
- 从 chat input 打开的 `formSheet` 先 blur keyboard，避免 keyboard、bottom inset 和 sheet detent 互相影响。

NativeTabs 可以承担一部分系统适配，但 chat input 和 message list 的底部空间仍属于产品布局责任。

## 手势冲突边界

- 屏幕最左/最右边缘不要放需要横滑启动的产品手势。
- drawer、message swipe action、carousel、media scrubber 等横向手势应从内容区域启动，而不是系统 edge zone。
- 如果某个页面必须使用边缘横滑，必须在 Android 上单独验证返回手势不会被破坏。
- iOS 的交互式返回和 Android 的系统返回不是同一个产品合同，不要求用一套 JS 手势抹平。

## 验收

- Android 系统边缘返回在普通页面、nested stack、modal/sheet 场景下可用。
- 模型选择 `formSheet` 打开后，Android 系统返回先关闭 sheet，不直接退出聊天页。
- 开启 predictive back 前后，返回目标、动画和业务确认状态都可预期。
- edge-to-edge 模式下 header、tab、chat input、message list 不被 status bar、navigation bar 或 keyboard 遮挡。
- chat input 打开模型选择时，keyboard 已收起，sheet detent 与 bottom inset 表现稳定。
- 横向业务手势不抢系统 edge back。
- 只有有明确业务理由的页面使用局部 back interception。
