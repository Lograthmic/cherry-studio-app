export function splitCursor(raw: string): { id: string; key: string } | null {
  const separatorIndex = raw.indexOf(':');
  if (separatorIndex < 0) {
    return null;
  }

  return {
    id: raw.slice(separatorIndex + 1),
    key: raw.slice(0, separatorIndex),
  };
}

export function decodeCursor(raw: string): { id: string; key: string } | null {
  const split = splitCursor(raw);
  if (!split?.id || !split.key) {
    return null;
  }

  return split;
}

export function encodeCursor(key: string, id: string): string {
  return `${key}:${id}`;
}
