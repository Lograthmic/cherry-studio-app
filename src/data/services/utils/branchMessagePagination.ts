export type BranchMessagePageOptions = {
  cursor?: string;
  limit: number;
};

export type BranchMessagePageIds = {
  ids: string[];
  nextCursor?: string;
};

export function getBranchMessagePageIds(
  pathIds: readonly string[],
  options: BranchMessagePageOptions,
): BranchMessagePageIds | null {
  const { cursor, limit } = options;

  if (limit <= 0 || pathIds.length === 0) {
    return { ids: [] };
  }

  let startIndex = 0;
  let endIndex = pathIds.length;

  if (cursor) {
    const cursorIndex = pathIds.indexOf(cursor);
    if (cursorIndex === -1) {
      return null;
    }
    startIndex = Math.max(0, cursorIndex - limit);
    endIndex = cursorIndex;
  } else {
    startIndex = Math.max(0, pathIds.length - limit);
  }

  const ids = pathIds.slice(startIndex, endIndex);

  return {
    ids,
    nextCursor: startIndex > 0 ? pathIds[startIndex] : undefined,
  };
}
