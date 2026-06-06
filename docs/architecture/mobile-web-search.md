# Cherry Mobile Web Search

Status: current

This document defines the current external web search architecture and separates it from provider-native web search. Terms follow [CONTEXT.md](../../CONTEXT.md).

## Two Web Search Paths

Cherry Mobile has two different concepts that are easy to confuse:

**Provider-Native Web Search**:
Model-native web search configured through AI provider options during an AI request. This path is built in `src/ai/utils/websearch.ts` and participates in `AiService` provider options.

**Web Search Provider**:
An external search/fetch provider executed by `WebSearchService`. This path is preference-backed and uses its own provider registry.

Do not use "web search" without specifying which path is being discussed when architecture or persistence matters.

## External Web Search Runtime

The external search path is:

`WebSearchService -> createWebSearchProvider() -> provider driver -> post-processing`

`WebSearchService` lives in the Data Service Graph and reads web search preferences through `PreferenceService`.

Runtime behavior:

- Selects a provider by requested capability.
- Builds runtime config from preferences.
- Creates a provider driver from the web search registry.
- Runs one provider request per normalized keyword/url input.
- Merges successful results.
- Logs partial input failures.
- Filters blacklisted domains.
- Applies post-processing and compression settings.

Abort errors are propagated when the caller's signal is aborted.

## Provider Registry

Current mobile web search provider ids:

- `zhipu`
- `tavily`
- `searxng`
- `exa`
- `bocha`
- `querit`
- `jina`

Current unsupported mobile entries:

- `exa-mcp`
- `fetch`

Unsupported entries are hidden from mobile settings and default-provider selectors until implemented. They remain in the provider id set and runtime registry as `UnsupportedProvider` entries so old preferences or direct calls fail with an explicit unsupported-provider error.

## Preferences

Web search configuration is stored in preferences, not in the AI ProviderService schema.

Important preferences include:

- default keyword-search provider.
- default URL-fetch provider.
- max result count.
- compression settings.
- provider overrides.
- excluded domains.

Provider overrides hold provider-specific API configuration for the external web search path.

## Zhipu Exception

Zhipu is a deliberate exception: the web search API management UI routes users to the normal AI provider settings page for `zhipu`. Other external web search provider keys are managed through web search provider overrides.

Document this as an exception, not evidence that WebSearchService has merged into ProviderService. Do not generalize the Zhipu bridge into a shared rule unless desktop web-search semantics change.

## Post-Processing

Search results pass through blacklist filtering and response post-processing before they are returned. Compression settings are part of runtime config.

## Reopen When

- Mobile implements `exa-mcp`, `fetch`, or another desktop web-search provider.
