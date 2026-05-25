# Data API

This directory mirrors the desktop data API organization: domain modules declare
their own data API surface, and `index.ts` composes them into a single export.

On mobile, this layer contains React Query key factories and the React Query
client provider used to access local data services.
