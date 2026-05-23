# Cherry Mobile Runtime Ownership

Status: draft

Related decisions:

- [ADR 0001: Use Provider-Owned Runtime Owners](../adr/0001-use-provider-owned-runtime-owners.md)
- [ADR 0002: Use Startup Gates Instead Of Lifecycle Phases](../adr/0002-use-startup-gates-not-lifecycle-phases.md)

This document defines which Cherry Mobile objects own runtime resources and which startup work may block first chat paint. Terms follow [CONTEXT.md](../../CONTEXT.md).

## Principles

- Mobile does not port Cherry desktop's lifecycle framework, global service registry, `defineService` DSL, or phase dependency graph.
- A runtime owner is only needed for work or resources that can outlive the current function call.
- Runtime owners are held by React Providers where possible, with lifetime tied to Provider mount/unmount, AppState, and screen focus.
- Startup gates express startup performance boundaries only. They are not OS lifecycle phases or desktop service phases.
- Plain helpers, repositories, query wrappers, parsers, validators, transforms, and UI state are not runtime owners by default.

## Resources That Need Owners

These resources must have an explicit owner, background/resume behavior, and cleanup:

- SQLite/Drizzle connections, migration locks, or long transaction boundaries.
- AI chat streams, stream readers, AbortControllers, stream buffers, and checkpoint schedulers.
- AppState listeners, navigation/screen focus listeners, and native event listeners.
- Timers, debounce schedulers, retry queues, background queues, and workers.
- Sockets, subscriptions, download/upload tasks, and native module sessions.
- Long-lived caches with invalidation or refresh logic.

One-shot network requests, pure transforms, schema validation, message block parsers, and render components do not become owners just because they are important. They become runtime owners only when they hold one of the resources above.

## v1 Owner Boundaries

`DatabaseProvider`:

- Owns SQLite/Drizzle initialization and closeable resources.
- Exposes repository/query capabilities upward.
- Does not own chat streams or block provider/model refresh.

`CurrentSessionProvider`:

- Owns the current assistant, topic, and minimum message window.
- May depend on database readiness.
- Does not own full-history prefetch, search indexing, or remote provider catalog refresh.

`ChatRuntimeProvider`:

- Owns active LLM streams, AbortControllers, stream buffers, checkpoint schedulers, and foreground/background restore behavior.
- Consumes AI SDK `fullStream` and converts it into Cherry chunk/message block updates.
- Does not make render components persistence owners.

`PreferenceProvider` / `ProviderCache`:

- Acts as a runtime owner only when it holds a long-lived cache, listener, or refresh task.
- Stays a plain hook/helper when it only reads configuration once.

`PerfProvider`:

- Enabled only for development or profiling.
- Owns trace timers, measurement buffers, and cleanup.

## Provider Shape

The recommended shape is to create the runtime explicitly in a Provider and connect AppState plus cleanup through React effects:

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

This shape is illustrative. Not every runtime must expose exactly the same methods. The requirement is clear ownership, clear resources, and clear cleanup.

## Startup Gates

`Bootstrap`:

- Lightweight config, logger, and static feature registry.
- Must not run full provider refresh, full history prefetch, or index building.

`InitialDataGate`:

- The only gate allowed to block first chat paint.
- Includes only DB readiness, initial preferences, current assistant/topic, minimum message window, and minimum chat runtime ownership.

`AfterFirstPaint`:

- Provider/model refresh, full topic prefetch, search index, diagnostics, and health checks.
- Failure should not blank the current chat screen.

## Acceptance

- Cold start into the current conversation does not wait for non-current history, provider/model refresh, or diagnostics.
- Active streams have checkpoint or explicit abort behavior when the app backgrounds.
- Foreground restore either recovers stream state or produces a clear failure state.
- Provider unmount cleans listeners, timers, stream readers, AbortControllers, and queues.
- Every new long-lived resource can answer: who owns it, when it pauses, when it resumes, and when it is released.
