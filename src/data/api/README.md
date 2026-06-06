# Data API

This directory keeps mobile's local Data API shape: domain modules declare query
keys and schemas for local service-backed reads/mutations, and `index.ts`
composes them into a single export.

On mobile, this is not an HTTP handler layer. It contains React Query key
factories, API-shaped DTO schemas where needed, and the React Query client
provider used to access local data services.
