# Cherry Mobile Chat Streaming And Rendering

状态：草案

相关决策：

- [ADR 0004: Inject Mobile Chat Stream Fetch](../adr/0004-inject-mobile-chat-stream-fetch.md)
- [ADR 0005: Render Active And Stable Message Blocks Differently](../adr/0005-render-active-and-stable-message-blocks-differently.md)

本文定义 Cherry Mobile 的 AI SDK stream transport、Chat Runtime 与 Markdown/LaTeX 渲染边界。术语以 [CONTEXT.md](../../CONTEXT.md) 为准。

## 原则

- AI SDK 继续负责 provider request 和 provider-specific stream parsing。
- Cherry Mobile 负责注入能在移动端产生真实 `ReadableStream` body 的 fetch transport。
- Chat Runtime 消费 AI SDK `fullStream`，转换成 Cherry chunk/message block 更新。
- Message History Window 仍然由数据库驱动且保持静态：通过 React Query 分页暴露 SQLite 中已持久化的 active-branch Messages。
- Active assistant output 通过内存中的 Streaming Message Overlay 组合到列表中，而不是每个 token 都修改 Message History Window。
- active streaming output 和 stable historical output 使用不同渲染路径。
- 渲染组件不直接写 SQLite；checkpoint 和 persistence 属于 runtime owner。

## Fetch transport 选型

当前保留两个候选：

`expo/fetch`：

- 保守候选，符合 Expo 路线。
- 需要验证 AI SDK `streamText` 在 iOS/Android 真机上的 chunk cadence、Abort 和 background 行为。

`react-native-nitro-fetch`：

- 高性能候选，适合重点验证 chat stream。
- 需要 wrapper 传入 `{ stream: true }`。
- 增量 UTF-8 decoding 需要配合 `react-native-nitro-text-decoder`。
- 引入后还需要接受 Nitro Modules 的 native dependency 成本。

无论最终选择哪个 transport，业务层都不直接解析 provider SSE。provider-specific signing wrapper 可以加 header、签名或认证信息，但最后仍调用共享 mobile fetch transport。

## Transport wrapper 形状

推荐把 transport 包在一个 Cherry-owned adapter 后面，避免 AI SDK 调用点散落平台判断：

```ts
export function createMobileFetchTransport(): typeof fetch {
  return async (input, init) => {
    if (transportKind === 'nitro') {
      return nitroFetch(input, {
        ...init,
        stream: true,
      } as NitroFetchInit) as Promise<Response>
    }

    return expoFetch(input, init)
  }
}
```

这段代码只表达边界：AI SDK 接收 `options.fetch`，而不是直接依赖 React Native 默认 `global.fetch`。

## Chat Runtime 边界

Chat Runtime 拥有：

- active request state。
- AbortController。
- stream reader 存活边界。
- partial text/chunk buffer。
- checkpoint scheduler。
- foreground/background restore 或 abort 策略。

Chat Runtime 不拥有：

- Markdown component tree。
- provider/model catalog refresh。
- 完整历史消息预取。
- UI scroll position。

## Message Window 与 Streaming Overlay

聊天列表接收的 presentation sequence 来自两个来源：

1. Message History Window：从 SQLite 读取已持久化的 active-branch Messages。
2. Streaming Message Overlay：生成期间提供当前内存中的 assistant Message。

Message History Window 负责 older-message loading、prefetch 和 reveal policy。它不接收每个 token delta。overlay 负责 active output identity 和临时内容，直到 assistant turn 完成。

推荐流程：

1. 用户 Message 立即持久化。
2. stream 开始前预留一个稳定的 assistant placeholder Message id。
3. AI SDK stream delta 写入 Streaming Text Store。
4. 生成期间通过 overlay 渲染 active assistant Message。
5. stream 完成后持久化最终 `parts`、`status`、metadata、stats 和 model snapshot。
6. invalidate 或更新相关 messages query，让持久化 Message 接管 overlay。

assistant placeholder id 在整个 run 中必须保持稳定，避免列表把每次 stream delta 都当成新 item。

## Persistence 与 Checkpointing

UI delta 和 SQLite 写入使用不同节奏：

- UI 更新可以按约 30-60 ms throttle，保证 active output 响应及时。
- SQLite checkpoint 应该慢得多。普通响应优先只在结束时保存；长响应或 foreground/background 切换时可以按 1-2 秒 checkpoint。

避免频繁数据库写入，因为更新 `message.data` 也会更新派生 searchable text 和 FTS 状态。token 级 persistence 会和滚动、输入响应争抢资源。

error、abort、pause 或 app background 时可以持久化 partial output，但 checkpoint 策略由 Chat Runtime 拥有。

## 渲染路径

Active streaming main text block：

- 使用 `react-native-streamdown` 渲染 token 到达期间的不完整 Markdown constructs。
- 通过 Streamdown 使用 `react-native-enriched-markdown` 作为 Markdown rendering substrate。
- UI 更新需要 throttle，避免每个 token 都触发完整 message tree re-render。
- active main text 从 Streaming Text Store 读取，让只有 streaming Message item 重渲染。

Stable historical main text block：

- 使用 `react-native-enriched-markdown`，覆盖 GFM tables、links、inline math 和 block math。
- 或通过同一 abstraction 关闭 streaming behavior。
- 从 persisted message block 读取，不重新模拟 active stream。

非文本 block：

- thinking、tool、citation、image、file、translation、error 等 block 按 Cherry message block 类型渲染。
- 不把 message 压扁成单一 Markdown 字符串后再推断 block 类型。

## 验收

- AI SDK `streamText` 在 iOS 和 Android 真机上能产生增量输出，而不是请求结束后一次性返回。
- Abort 能停止 active stream，并清理 reader、buffer 和 checkpoint timer。
- background/foreground 切换后，要么恢复可恢复状态，要么进入明确失败/可重试状态。
- active response 包含 paragraphs、lists、code fences、tables、links、inline math、block math 和 malformed math 时不崩溃。
- 10k+ Markdown characters streaming 时，滚动和输入仍可响应。
- `expo/fetch` 与 `react-native-nitro-fetch` 在最终选型前必须跑同一套真机场景。
