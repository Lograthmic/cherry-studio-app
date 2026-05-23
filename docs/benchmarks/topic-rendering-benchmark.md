# Topic Rendering Benchmark

## Baseline: `a8fb953`

Date: 2026-05-17

Scenario:
- Device/session: iOS simulator, iPhone 17 Pro, `agent-device` session `topic-switch`.
- App target: `com.cherry-ai.cherry-studio-app`.
- Flow: open app, open Navigation Drawer, tap `Generated Markdown Stress 091`.
- Fixture: seeded mock topic with complex Markdown, table, code, and LaTeX blocks.
- React profile window: start immediately before topic row press, stop after 700ms.

Notes:
- React DevTools reported `0 commits` in the profile summary line, but `profile timeline` returned commit timelines. The timeline is the usable JS/render signal.
- `agent-device perf` cannot report iOS simulator FPS. It reports Apple frame-health sampling as available only on connected iOS devices.
- `agent-device perf` CPU/memory sampling failed on this simulator with `xcrun simctl spawn ps` returning `No such file or directory`.

### React Profile Runs

| Run | Target topic | Commit count | Max commit | Heavy commits | Slowest reported module |
| --- | --- | ---: | ---: | --- | --- |
| 1 | Generated Markdown Stress 091 | 13 | 12.5ms | 12.3ms, 12.5ms | Navigation/provider path, `Content` 12.1ms |
| 2 | Generated List Performance 097 | 13 | 10.0ms | 9.3ms, 10.0ms | Navigation/provider path, `Context.Provider` 9.9ms |
| 3 | Generated Markdown Stress 091 | 14 | 10.5ms | 9.7ms, 10.5ms | Navigation/provider path, `Context.Provider` 10.1ms |

Aggregate:
- Max commit range: 10.0-12.5ms.
- Median max commit: 10.5ms.
- Mean max commit: 11.0ms.
- Message renderer modules were not the slowest reported React modules in these runs; the slowest path was navigation/provider commit work.

### Device Metrics

| Metric | Result |
| --- | --- |
| Startup open-command roundtrip | Latest sample 296ms |
| UI/FPS | Unavailable on iOS simulator via `agent-device perf` |
| CPU | Unavailable on this simulator via `agent-device perf` |
| Memory | Unavailable on this simulator via `agent-device perf` |

### Current Pass Criteria For Refactor

The architecture refactor should preserve user-visible smoothness and stay within the current JS/render baseline:
- React profile max commit should stay under 13ms for the same topic-switch flow.
- Mean max commit across three runs should not regress above 12ms.
- Message renderer modules should not become the slowest reported path during topic switch.
- Topic switch should still show message content within the first post-click snapshot window used by `agent-device` verification.

## Architecture Refactor: Working Tree After `a8fb953`

Date: 2026-05-17

Changes under test:
- Centralized Message window policy.
- Moved Message prefetch Interface into chat query options.
- Extracted Message list initial render gate.
- Extracted Topic detail cache hydration.
- Memoized Stable Renderer Markdown style and link handling.

Scenario:
- Same device/session/app target as baseline.
- Same flow and fixture topics.

### React Profile Runs

| Run | Target topic | Commit count | Max commit | Heavy commits | Slowest reported module |
| --- | --- | ---: | ---: | --- | --- |
| 1 | Generated Markdown Stress 091 | 14 | 12.5ms | 12.4ms, 12.5ms | Navigation/provider path, `Content` 12.2ms |
| 2 | Generated List Performance 097 | 14 | 10.2ms | 9.8ms, 10.2ms | Navigation/provider path, `Context.Provider` 10.1ms |
| 3 | Generated Markdown Stress 091 | 14 | 9.6ms | 9.6ms, 9.3ms | Navigation/provider path, `Content` 9.3ms |

Aggregate:
- Max commit range: 9.6-12.5ms.
- Median max commit: 10.2ms.
- Mean max commit: 10.8ms.
- Message renderer modules were not the slowest reported React modules in these runs.

Result:
- Passes the current threshold: all max commits stayed under 13ms and the three-run mean stayed under 12ms.
- Device FPS/CPU/memory caveats remain the same as the baseline because this run used the same iOS simulator path.

## Benchmark Fixture Matrix

The development mock chat seeder now generates nine focused Topic fixtures:

| Kind | Message counts | Purpose |
| --- | --- | --- |
| Plain text | 5, 10, 100 | Control group for ordinary wrapped text rendering |
| LaTeX | 5, 10, 100 | Math-heavy rendering group |
| Complex | 5, 10, 100 | Combined prose, list, table, code, inline math, and display math stress group |

Seeder notes:
- The mock chat seeder removes the earlier curated/generated mock topics and messages before inserting this matrix.
- The benchmark topic ids use the `mock-benchmark-topic-` prefix.
- The benchmark message ids use the `mock-benchmark-message-` prefix.

Device verification note:
- Static fixture generation was verified locally with `tsx`; it produced the expected nine topics and message counts.
- The active simulator still showed old generated topics after app relaunch because `agent-device metro reload` failed against the dev-client session. Re-open the dev client with a fresh bundle or clear/reseed local app data before using the new fixture matrix for device-side benchmark runs.
