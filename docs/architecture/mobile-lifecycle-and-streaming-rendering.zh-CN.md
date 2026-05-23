# Cherry Mobile 架构索引

状态：草案

本文是 Cherry Studio 移动端 App 的架构索引。项目语言与领域边界记录在 [CONTEXT.md](../../CONTEXT.md)，不可逆或容易被误改的取舍记录在 [docs/adr](../adr)，具体落地方案拆到下面的主题文档。

## 范围

本文覆盖移动端 v1 的 runtime ownership、启动性能、导航手势、edge-to-edge/insets、UI 交互组件、AI SDK chat stream transport、流式 Markdown/LaTeX 渲染和性能验收。

本文不定义 AI provider 接入细节、远程 agent 编排、Expo 工程脚手架、依赖安装、最终 Drizzle schema 或 Expo Web。

## 主题文档

- [Runtime Ownership](./mobile-runtime-ownership.zh-CN.md)：移动端 runtime owner 边界、需要清理的资源、startup gates 和 first chat paint 约束。
- [Navigation And Insets](./mobile-navigation-and-insets.zh-CN.md)：Android 平台原生返回手势、predictive back、edge-to-edge 与 safe-area/inset 策略。
- [UI Components](./mobile-ui-components.zh-CN.md)：基于 `Pressable` 的产品按钮、header button、Liquid Glass 增强与跨平台 fallback。
- [Chat Streaming And Rendering](./mobile-chat-streaming-rendering.zh-CN.md)：AI SDK fetch 注入、`expo/fetch` 与 `react-native-nitro-fetch` 候选、active/stable renderer 边界。

## 决策索引

- [ADR 0001: Use Provider-Owned Runtime Owners](../adr/0001-use-provider-owned-runtime-owners.md)
- [ADR 0002: Use Startup Gates Instead Of Lifecycle Phases](../adr/0002-use-startup-gates-not-lifecycle-phases.md)
- [ADR 0003: Use Pressable Wrappers For Product Buttons](../adr/0003-use-pressable-wrappers-for-product-buttons.md)
- [ADR 0004: Inject Mobile Chat Stream Fetch](../adr/0004-inject-mobile-chat-stream-fetch.md)
- [ADR 0005: Render Active And Stable Message Blocks Differently](../adr/0005-render-active-and-stable-message-blocks-differently.md)
- [ADR 0006: Use Platform-Native Navigation Gestures](../adr/0006-use-platform-native-navigation-gestures.md)
- [ADR 0007: Use Route-Level Form Sheets For Page-Like Pickers](../adr/0007-use-route-level-form-sheets-for-page-like-pickers.md)

## 运行时约束

Cherry Mobile 从一开始就使用 Expo development build，不支持 Expo Go 作为 v1 运行目标。当前计划中的 native/runtime 依赖包括：

- `heroui-native`：移动端 UI 组件候选。
- `react-native-enriched-markdown`：稳定 Markdown、GFM tables、inline/block LaTeX。
- `remend`：streaming Markdown 修复候选。
- 暂缓 `react-native-streamdown` 与 `react-native-worklets` Bundle Mode，直到它们兼容 Expo SDK 稳定 Worklets 版本。
- `expo-sqlite` 与 `drizzle-orm`：本地持久化。
- Chat stream transport 候选：`expo/fetch` 或 `react-native-nitro-fetch`。若选择 Nitro Fetch，还需要 `react-native-nitro-modules` 与 `react-native-nitro-text-decoder`。

初始平台目标是 iOS 与 Android 手机，布局基础应为未来 iPadOS 和 Android 平板留出空间。

## Cherry 数据对齐

移动端数据结构默认跟随 Cherry Studio 桌面端领域模型，除非存在明确移动端理由。必须保留这些概念：

- Assistant：可复用配置，包含 prompt、选中模型或默认模型引用。
- Topic：聊天线程或会话。
- Message：属于 topic，保留 role、status、model snapshot、timing/stat metadata、删除状态等信息。
- Message Block：main text、thinking、tool、citation、image、file、translation、error 等 typed content block。
- Provider / Model：配置方向应与 Cherry 桌面端兼容，即使 v1 延后实现完整 provider 请求架构。

v1 可以简化 UI 表面，但不能把这些概念压扁成单一 chat table。

## 当前基线

- Runtime ownership：使用 Provider-owned runtime owners，不引入 desktop lifecycle 或 `defineService` DSL。详见 [Runtime Ownership](./mobile-runtime-ownership.zh-CN.md)。
- Startup gates：`Bootstrap`、`InitialDataGate`、`AfterFirstPaint` 只表达启动性能边界。详见 [Runtime Ownership](./mobile-runtime-ownership.zh-CN.md)。
- Navigation：Android 边缘返回、predictive back preview 和 native stack transition 使用平台原生能力，不用 JS 模拟 edge-swipe back。详见 [Navigation And Insets](./mobile-navigation-and-insets.zh-CN.md)。
- Picker sheets：chat input 打开的模型选择等页面级 picker 使用 route-level `formSheet`，不是 JS bottom sheet。详见 [Navigation And Insets](./mobile-navigation-and-insets.zh-CN.md)。
- UI interaction：产品按钮默认基于 `Pressable` wrapper，header button 使用 Cherry-owned `HeaderIconButton`。详见 [UI Components](./mobile-ui-components.zh-CN.md)。
- Chat stream transport：AI SDK provider options 必须注入 mobile fetch transport，最终在 `expo/fetch` 与 `react-native-nitro-fetch` 间选型。详见 [Chat Streaming And Rendering](./mobile-chat-streaming-rendering.zh-CN.md)。
- Rendering：active streaming 与 stable historical message block 使用不同渲染路径。详见 [Chat Streaming And Rendering](./mobile-chat-streaming-rendering.zh-CN.md)。

## 性能验收场景

最低验收场景：

- 冷启动进入已有当前会话。
- 一个 topic 中有 100+ historical messages。
- 单条 assistant response 包含 10k+ Markdown characters。
- Streaming response 包含 paragraphs、lists、code fences、tables、links、inline math、block math 和 malformed math。
- Streaming response 包含 tokens 到达期间应由 `remend` 修复的不完整 Markdown constructs。
- 长 assistant message streaming 时滚动列表。
- Active streaming 期间 App 进入 background，然后 foreground restore。
- Android edge-to-edge 下 header、tab、chat input、message list 和 keyboard inset 不互相遮挡。
- Android 系统边缘返回、nested stack 返回、modal/sheet 返回在真机上符合平台预期。
- chat input 打开模型选择 `formSheet` 时先收起 keyboard，Android 返回先关闭 sheet。
- 对比 `expo/fetch` 与 `react-native-nitro-fetch` 的 AI SDK `streamText` 真机表现。
- 在声称性能可接受前，完成低内存或低端 Android profiling pass。

成功标准：

- First chat paint 不等待非当前历史或 provider/model refresh。
- Streaming 期间滚动保持响应。
- Streaming 期间 keyboard/input 保持响应。
- 不完整 Markdown 和 LaTeX 不会导致渲染崩溃。
- Background/foreground transitions 能保留可恢复的 stream state。
- Android 系统返回手势不被产品横向手势抢占。

## 后续开放问题

- 精确 virtualization library 选择。
- Expo 下 SQLite migration generation 的具体工作流。
- iPadOS 与 Android 平板布局行为。
- Provider/model request runtime architecture。
- Android predictive back preview 何时从保守默认关闭改为开启。
- 模型选择 `formSheet` 的 detent 比例、搜索/分组信息密度和 iPad/tablet 表现。
- Chat stream transport 最终选择：`expo/fetch` 还是 `react-native-nitro-fetch`。
- 哪个兼容 Expo 的 streaming Markdown renderer 应替代暂缓的 `react-native-streamdown` Bundle Mode 路径。
