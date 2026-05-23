import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { Message } from '@/data/types/message';
import { messageWindowPolicy } from './utils/messageWindowPolicy';

type MessageWindowSignature = {
  firstId: string | undefined;
  lastId: string | undefined;
  length: number;
};

function getMessageWindowSignature(messages: readonly Message[]): MessageWindowSignature {
  return {
    firstId: messages[0]?.id,
    lastId: messages[messages.length - 1]?.id,
    length: messages.length,
  };
}

export function getVisibleCountForWindow(
  currentVisibleCount: number,
  previous: MessageWindowSignature | null,
  current: MessageWindowSignature,
) {
  if (current.length === 0) {
    return 0;
  }

  if (!previous || currentVisibleCount === 0 || current.length < previous.length) {
    return Math.min(messageWindowPolicy.initialRenderCount, current.length);
  }

  if (previous.lastId === current.lastId) {
    const prependedCount = current.length - previous.length;
    if (prependedCount > 0 && previous.firstId !== current.firstId) {
      return Math.min(current.length, currentVisibleCount + prependedCount);
    }

    return Math.min(currentVisibleCount, current.length);
  }

  if (previous.firstId === current.firstId) {
    const appendedCount = current.length - previous.length;
    return Math.min(current.length, currentVisibleCount + appendedCount);
  }

  return Math.min(messageWindowPolicy.initialRenderCount, current.length);
}

export function useMessageRenderWindow(messages: readonly Message[]) {
  const [visibleCount, setVisibleCount] = useState(() =>
    Math.min(messageWindowPolicy.initialRenderCount, messages.length),
  );
  const signatureRef = useRef<MessageWindowSignature | null>(null);
  const signature = useMemo(() => getMessageWindowSignature(messages), [messages]);
  const effectiveVisibleCount = getVisibleCountForWindow(
    visibleCount,
    signatureRef.current,
    signature,
  );

  useEffect(() => {
    const previous = signatureRef.current;

    signatureRef.current = signature;

    setVisibleCount((currentVisibleCount) => {
      return getVisibleCountForWindow(currentVisibleCount, previous, signature);
    });
  }, [signature]);

  const revealMore = useCallback(() => {
    startTransition(() => {
      setVisibleCount((currentVisibleCount) =>
        Math.min(messages.length, currentVisibleCount + messageWindowPolicy.revealCount),
      );
    });
  }, [messages.length]);

  const visibleMessages = useMemo(
    () => messages.slice(Math.max(0, messages.length - effectiveVisibleCount)),
    [messages, effectiveVisibleCount],
  );

  return {
    hasHiddenMessages: effectiveVisibleCount < messages.length,
    hiddenMessageCount: Math.max(0, messages.length - effectiveVisibleCount),
    revealMore,
    visibleMessages,
  };
}
