export function getDefaultFetchedModelGroupName(modelId: string, providerId: string): string {
  const parts = modelId.split('/');
  return parts.length > 1 ? parts[0] : providerId;
}

export function normalizeFetchedModelGroupName(
  group: string | null | undefined,
  modelId: string,
  providerId: string,
): string {
  if (group) {
    return group;
  }

  return getDefaultFetchedModelGroupName(modelId, providerId);
}
