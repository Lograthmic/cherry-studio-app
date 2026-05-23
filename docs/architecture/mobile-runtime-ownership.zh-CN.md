# Cherry Mobile Runtime Ownership

状态：草案

相关决策：

- [ADR 0001: Use Provider-Owned Runtime Owners](../adr/0001-use-provider-owned-runtime-owners.md)
- [ADR 0002: Use Startup Gates Instead Of Lifecycle Phases](../adr/0002-use-startup-gates-not-lifecycle-phases.md)

本文定义 Cherry Mobile 中哪些对象需要拥有运行时资源，以及哪些启动工作可以阻塞 first chat paint。术语以 [CONTEXT.md](../../CONTEXT.md) 为准。

## 原则

- 移动端不移植 Cherry 桌面端生命周期框架、全局 service registry、`defineService` DSL 或 phase dependency graph。
- Runtime owner 只用于能在当前函数返回后继续存在的资源。
- Runtime owner 优先由 React Provider 持有，存活边界跟随 Provider mount/unmount、AppState 和 screen focus。
- Startup gate 只表达启动性能边界，不表达 OS lifecycle，也不表达 desktop service phase。
- 普通 helper、repository、query wrapper、parser、validator、transform 和 UI state 默认不是 runtime owner。

## 需要 owner 的资源

以下资源必须有明确 owner、background/resume 行为和 cleanup：

- SQLite/Drizzle connection、migration lock 或长期事务边界。
- AI chat stream、stream reader、AbortController、stream buffer 和 checkpoint scheduler。
- AppState listener、navigation/screen focus listener、native event listener。
- timer、debounce scheduler、retry queue、background queue、worker。
- socket、subscription、download/upload task、native module session。
- 带 invalidation 或 refresh 逻辑的长期 cache。

一次性网络请求、纯函数转换、schema validation、message block parser 和 render component 不因为存在业务含义就自动成为 owner。只有当它们持有上面的资源时，才提升为 runtime owner。

## v1 owner 边界

`DatabaseProvider`：

- 拥有 SQLite/Drizzle 初始化和可关闭资源。
- 对上提供 repository/query 能力。
- 不拥有 chat stream，也不阻塞 provider/model refresh。

`CurrentSessionProvider`：

- 拥有当前 assistant、topic 和最小 message window。
- 可以依赖 database ready。
- 不拥有完整历史预取、搜索索引或远程 provider catalog refresh。

`ChatRuntimeProvider`：

- 拥有 active LLM stream、AbortController、stream buffer、checkpoint scheduler 和 foreground/background 恢复策略。
- 消费 AI SDK `fullStream` 后转换成 Cherry chunk/message block 更新。
- 不直接把渲染组件变成 persistence owner。

`PreferenceProvider` / `ProviderCache`：

- 只有在持有长期 cache、listener 或 refresh task 时才作为 runtime owner。
- 如果只是读取一次配置，保持普通 hook/helper。

`PerfProvider`：

- 只在开发或 profiling 场景启用。
- 拥有 trace timer、measurement buffer 和 cleanup。

## Provider 形状

推荐形状是让 Provider 显式创建 runtime，并在 React effect 中连接 AppState 与 cleanup：

```tsx
function ChatRuntimeProvider({ children }: PropsWithChildren) {
  const runtime = useMemo(() => createChatRuntime({ transport }), [transport])

  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        runtime.resume()
      } else {
        runtime.background()
      }
    })

    return () => {
      sub.remove()
      runtime.dispose()
    }
  }, [runtime])

  return <ChatRuntimeContext.Provider value={runtime}>{children}</ChatRuntimeContext.Provider>
}
```

这段代码只表达结构，不要求所有 runtime 都实现完全相同的方法。核心要求是 owner 明确、资源明确、cleanup 明确。

## Startup gates

`Bootstrap`：

- 轻量 config、logger、static feature registry。
- 不能执行完整 provider refresh、完整历史预取或索引构建。

`InitialDataGate`：

- 唯一允许阻塞 first chat paint 的 gate。
- 只包含 DB ready、初始 preference、当前 assistant/topic、最小 message window、最小 chat runtime ownership。

`AfterFirstPaint`：

- provider/model refresh、完整 topic prefetch、search index、diagnostics、health checks。
- 失败不应该让当前聊天界面白屏。

## 验收

- 冷启动进入已有当前会话时，first chat paint 不等待非当前历史、provider/model refresh 或 diagnostics。
- App background 时 active stream 有 checkpoint 或明确 abort 策略。
- App foreground restore 后，Chat Runtime 能恢复可恢复状态，或给出明确失败状态。
- Provider unmount 后 listener、timer、stream reader、AbortController 和 queue 都被清理。
- 新增长期资源时，必须能回答“谁拥有它、何时暂停、何时恢复、何时释放”。
