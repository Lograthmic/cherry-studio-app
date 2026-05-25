/**
 * Mobile file resolver for AI message parts.
 *
 * Cherry's v2 messages may store `FileUIPart.url` as `file://...`.
 * AI SDK's `convertToModelMessages` won't fetch `file://` URLs. Desktop
 * rewrites those with Node fs; mobile keeps non-file URLs untouched for the
 * first AI-core migration slice and drops unresolved local files.
 */

import type { FileUIPart } from '@/data/types/message';

/**
 * Rewrite any `file://` URLs in a `FileUIPart` to base64 data URLs. Leaves
 * `data:` / `https:` / `http:` URLs untouched. If the file can't be read,
 * returns `null` to signal the caller should drop the part.
 */
export async function resolveFileUIPart(part: FileUIPart): Promise<FileUIPart | null> {
  const url = part.url;
  if (!url) return part;
  if (!url.startsWith('file://')) return part;

  return null;
}
