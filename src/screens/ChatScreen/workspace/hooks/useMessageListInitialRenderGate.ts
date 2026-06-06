import { useCallback, useState } from 'react';

type MessageListInitialRenderGateOptions = {
  hasMessages: boolean;
  isLoadingInitial: boolean;
  renderGateKey: string;
};

export function useMessageListInitialRenderGate({
  hasMessages,
  isLoadingInitial,
  renderGateKey,
}: MessageListInitialRenderGateOptions) {
  const [readyListRenderKey, setReadyListRenderKey] = useState<string | null>(null);
  const isCoverVisible = isLoadingInitial || (hasMessages && readyListRenderKey !== renderGateKey);

  const markListLoaded = useCallback(() => {
    const loadedListRenderKey = renderGateKey;

    requestAnimationFrame(() => {
      setReadyListRenderKey(loadedListRenderKey);
    });
  }, [renderGateKey]);

  return {
    isCoverVisible,
    listRenderKey: renderGateKey,
    markListLoaded,
  };
}
