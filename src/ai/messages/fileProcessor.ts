/**
 * Mobile file resolver for AI message parts.
 *
 * Cherry's v2 messages may store `FileUIPart.url` as `file://...`.
 * AI SDK's `convertToModelMessages` won't fetch `file://` URLs. Desktop
 * rewrites those with Node fs; mobile uses Expo FileSystem to produce data URLs.
 */

import * as FileSystem from 'expo-file-system';

import type { FileUIPart } from '@/data/types/message';

const FALLBACK_MEDIA_TYPE = 'application/octet-stream';

/**
 * Rewrite any `file://` URLs in a `FileUIPart` to base64 data URLs. Leaves
 * `data:` / `https:` / `http:` URLs untouched. If the file can't be read,
 * returns `null` to signal the caller should drop the part.
 */
export async function resolveFileUIPart(part: FileUIPart): Promise<FileUIPart | null> {
  const url = part.url;
  if (!url) return part;
  if (!url.startsWith('file://')) return part;

  try {
    const base64 = await FileSystem.readAsStringAsync(url, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const mediaType = part.mediaType || FALLBACK_MEDIA_TYPE;
    return {
      ...part,
      mediaType,
      url: `data:${mediaType};base64,${base64}`,
    };
  } catch {
    return null;
  }
}
