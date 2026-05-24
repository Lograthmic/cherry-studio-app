import {
  createContext,
  type PropsWithChildren,
  type RefObject,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Keyboard, type TextInput } from 'react-native';
import { useChatInputPhotoPicker } from '@/screens/ChatScreen/input/hooks/useChatInputPhotoPicker';
import {
  type ChatInputAction,
  type ChatInputActionId,
  getChatInputAction,
  toggleChatInputAction,
} from '@/screens/ChatScreen/input/utils/chatInputActions';
import {
  appendChatInputAttachments,
  type ChatInputAttachmentDraft,
  removeChatInputAttachment,
} from '@/screens/ChatScreen/input/utils/chatInputAttachments';
import { chatInputMotionConfig } from '@/screens/ChatScreen/input/utils/chatInputMotion';
import {
  CHAT_INPUT_DEFAULT_REASONING_EFFORT,
  type ChatInputReasoningEffort,
  shouldShowChatInputReasoningEffortTag,
} from '@/screens/ChatScreen/input/utils/chatInputReasoning';

type ChatInputStateContextValue = {
  attachments: readonly ChatInputAttachmentDraft[];
  draft: string;
  isAttachmentPreviewExiting: boolean;
  isActionSheetOpen: boolean;
  isInputFocused: boolean;
  isReasoningEffortSelected: boolean;
  isToolbarExiting: boolean;
  reasoningEffort: ChatInputReasoningEffort;
  selectedTool?: ChatInputAction;
  selectedToolId: ChatInputActionId | null;
  visibleAttachments: readonly ChatInputAttachmentDraft[];
  visibleSelectedTool?: ChatInputAction;
  visibleShouldShowReasoningEffortTag: boolean;
};

type ChatInputActionsContextValue = {
  addAttachments: (attachments: ChatInputAttachmentDraft[]) => void;
  clearAttachments: () => void;
  clearReasoningEffort: () => void;
  clearSelectedTool: () => void;
  closeActionSheet: () => void;
  openActionSheet: () => void;
  removeAttachment: (attachmentId: string) => void;
  selectAction: (actionId: ChatInputActionId) => void;
  selectReasoningEffort: (reasoningEffort: ChatInputReasoningEffort) => void;
  setDraft: (draft: string) => void;
  setInputFocused: (isFocused: boolean) => void;
};

type ChatInputMediaContextValue = ReturnType<typeof useChatInputPhotoPicker>;

type ChatInputMetaContextValue = {
  inputRef: RefObject<TextInput | null>;
};

type ChatInputAttachmentState = {
  attachments: ChatInputAttachmentDraft[];
  isPreviewExiting: boolean;
  visibleAttachments: ChatInputAttachmentDraft[];
};

type ChatInputToolState = {
  isPreviewExiting: boolean;
  selectedToolId: ChatInputActionId | null;
  visibleSelectedToolId: ChatInputActionId | null;
  visibleShouldShowReasoningEffortTag: boolean;
};

const chatInputFocusAfterActionDelay = 100;
const chatInputPreviewExitDelay = chatInputMotionConfig.duration;

const ChatInputStateContext = createContext<ChatInputStateContextValue | null>(null);
const ChatInputActionsContext = createContext<ChatInputActionsContextValue | null>(null);
const ChatInputMediaContext = createContext<ChatInputMediaContextValue | null>(null);
const ChatInputMetaContext = createContext<ChatInputMetaContextValue | null>(null);

export function ChatInputProvider({ children }: PropsWithChildren) {
  const inputRef = useRef<TextInput>(null);
  const focusAfterActionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldFocusAfterActionSheetCloseRef = useRef(false);
  const [draft, setDraft] = useState('');
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isReasoningEffortSelected, setIsReasoningEffortSelected] = useState(false);
  const [reasoningEffort, setReasoningEffort] = useState<ChatInputReasoningEffort>(
    CHAT_INPUT_DEFAULT_REASONING_EFFORT,
  );
  const [toolState, setToolState] = useState<ChatInputToolState>({
    isPreviewExiting: false,
    selectedToolId: null,
    visibleSelectedToolId: null,
    visibleShouldShowReasoningEffortTag: false,
  });
  const [attachmentState, setAttachmentState] = useState<ChatInputAttachmentState>({
    attachments: [],
    isPreviewExiting: false,
    visibleAttachments: [],
  });
  const { attachments, isPreviewExiting, visibleAttachments } = attachmentState;
  const {
    isPreviewExiting: isToolPreviewExiting,
    selectedToolId,
    visibleSelectedToolId,
    visibleShouldShowReasoningEffortTag,
  } = toolState;
  const addAttachments = useCallback((nextAttachments: ChatInputAttachmentDraft[]) => {
    setAttachmentState((current) => {
      const attachments = appendChatInputAttachments(current.attachments, nextAttachments);

      return {
        attachments,
        isPreviewExiting: false,
        visibleAttachments: attachments,
      };
    });
  }, []);
  const media = useChatInputPhotoPicker(isActionSheetOpen, addAttachments);
  const selectedTool = useMemo(() => getChatInputAction(selectedToolId), [selectedToolId]);
  const visibleSelectedTool = useMemo(
    () => getChatInputAction(visibleSelectedToolId),
    [visibleSelectedToolId],
  );

  useEffect(() => {
    return () => {
      if (focusAfterActionTimeoutRef.current) {
        clearTimeout(focusAfterActionTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isPreviewExiting) {
      return undefined;
    }

    const attachmentPreviewExitTimeout = setTimeout(() => {
      setAttachmentState((current) => {
        if (!current.isPreviewExiting || current.attachments.length > 0) {
          return current;
        }

        return {
          ...current,
          isPreviewExiting: false,
          visibleAttachments: [],
        };
      });
    }, chatInputPreviewExitDelay);

    return () => {
      clearTimeout(attachmentPreviewExitTimeout);
    };
  }, [isPreviewExiting]);

  useEffect(() => {
    if (!isToolPreviewExiting) {
      return undefined;
    }

    const toolPreviewExitTimeout = setTimeout(() => {
      setToolState((current) => {
        if (!current.isPreviewExiting || current.selectedToolId) {
          return current;
        }

        return {
          ...current,
          isPreviewExiting: false,
          visibleSelectedToolId: null,
          visibleShouldShowReasoningEffortTag: false,
        };
      });
    }, chatInputPreviewExitDelay);

    return () => {
      clearTimeout(toolPreviewExitTimeout);
    };
  }, [isToolPreviewExiting]);

  const openActionSheet = useCallback(() => {
    inputRef.current?.blur();
    Keyboard.dismiss();
    setIsInputFocused(false);
    setIsActionSheetOpen(true);
  }, []);

  const closeActionSheet = useCallback(() => {
    setIsActionSheetOpen(false);

    if (!shouldFocusAfterActionSheetCloseRef.current) {
      return;
    }

    shouldFocusAfterActionSheetCloseRef.current = false;

    if (focusAfterActionTimeoutRef.current) {
      clearTimeout(focusAfterActionTimeoutRef.current);
    }

    // Native sheet close callbacks fire before the dismissal animation has released focus.
    focusAfterActionTimeoutRef.current = setTimeout(() => {
      inputRef.current?.focus();
      focusAfterActionTimeoutRef.current = null;
    }, chatInputFocusAfterActionDelay);
  }, []);

  const selectAction = useCallback(
    (actionId: ChatInputActionId) => {
      const shouldShowReasoningEffortTag = shouldShowChatInputReasoningEffortTag(
        isReasoningEffortSelected,
        reasoningEffort,
      );

      setToolState((current) =>
        getNextChatInputToolState(
          current,
          toggleChatInputAction(current.selectedToolId, actionId),
          shouldShowReasoningEffortTag,
        ),
      );
      shouldFocusAfterActionSheetCloseRef.current = true;
    },
    [isReasoningEffortSelected, reasoningEffort],
  );

  const selectReasoningEffort = useCallback((nextReasoningEffort: ChatInputReasoningEffort) => {
    setReasoningEffort(nextReasoningEffort);
    setIsReasoningEffortSelected(true);
    setToolState((current) =>
      getNextChatInputToolState(
        current,
        current.selectedToolId,
        shouldShowChatInputReasoningEffortTag(true, nextReasoningEffort),
      ),
    );
    shouldFocusAfterActionSheetCloseRef.current = true;
  }, []);

  const clearReasoningEffort = useCallback(() => {
    setIsReasoningEffortSelected(false);
    setReasoningEffort(CHAT_INPUT_DEFAULT_REASONING_EFFORT);
    setToolState((current) => getNextChatInputToolState(current, current.selectedToolId, false));
  }, []);

  const clearSelectedTool = useCallback(() => {
    const shouldShowReasoningEffortTag = shouldShowChatInputReasoningEffortTag(
      isReasoningEffortSelected,
      reasoningEffort,
    );

    setToolState((current) =>
      getNextChatInputToolState(current, null, shouldShowReasoningEffortTag),
    );
  }, [isReasoningEffortSelected, reasoningEffort]);

  const removeAttachment = useCallback((attachmentId: string) => {
    setAttachmentState((current) => {
      if (current.attachments.length === 0) {
        return current;
      }

      const attachments = removeChatInputAttachment(current.attachments, attachmentId);

      if (attachments.length > 0) {
        return {
          attachments,
          isPreviewExiting: false,
          visibleAttachments: attachments,
        };
      }

      return {
        attachments,
        isPreviewExiting: current.visibleAttachments.length > 0,
        visibleAttachments: current.visibleAttachments,
      };
    });
  }, []);

  const clearAttachments = useCallback(() => {
    setAttachmentState((current) => {
      if (current.attachments.length === 0 && current.visibleAttachments.length === 0) {
        return current;
      }

      return {
        attachments: [],
        isPreviewExiting: current.visibleAttachments.length > 0,
        visibleAttachments: current.visibleAttachments,
      };
    });
  }, []);

  const stateValue = useMemo(
    () => ({
      attachments,
      draft,
      isAttachmentPreviewExiting: isPreviewExiting,
      isActionSheetOpen,
      isInputFocused,
      isReasoningEffortSelected,
      isToolbarExiting: isToolPreviewExiting,
      reasoningEffort,
      selectedTool,
      selectedToolId,
      visibleAttachments,
      visibleSelectedTool,
      visibleShouldShowReasoningEffortTag,
    }),
    [
      attachments,
      draft,
      isPreviewExiting,
      isActionSheetOpen,
      isInputFocused,
      isReasoningEffortSelected,
      isToolPreviewExiting,
      reasoningEffort,
      selectedTool,
      selectedToolId,
      visibleAttachments,
      visibleSelectedTool,
      visibleShouldShowReasoningEffortTag,
    ],
  );

  const actionsValue = useMemo(
    () => ({
      addAttachments,
      clearAttachments,
      clearReasoningEffort,
      clearSelectedTool,
      closeActionSheet,
      openActionSheet,
      removeAttachment,
      selectAction,
      selectReasoningEffort,
      setDraft,
      setInputFocused: setIsInputFocused,
    }),
    [
      addAttachments,
      clearAttachments,
      clearReasoningEffort,
      clearSelectedTool,
      closeActionSheet,
      openActionSheet,
      removeAttachment,
      selectAction,
      selectReasoningEffort,
    ],
  );

  const metaValue = useMemo(
    () => ({
      inputRef,
    }),
    [],
  );

  return (
    <ChatInputStateContext value={stateValue}>
      <ChatInputActionsContext value={actionsValue}>
        <ChatInputMediaContext value={media}>
          <ChatInputMetaContext value={metaValue}>{children}</ChatInputMetaContext>
        </ChatInputMediaContext>
      </ChatInputActionsContext>
    </ChatInputStateContext>
  );
}

function getNextChatInputToolState(
  current: ChatInputToolState,
  selectedToolId: ChatInputActionId | null,
  shouldShowReasoningEffortTag: boolean,
): ChatInputToolState {
  if (selectedToolId || shouldShowReasoningEffortTag) {
    return {
      isPreviewExiting: false,
      selectedToolId,
      visibleSelectedToolId: selectedToolId,
      visibleShouldShowReasoningEffortTag: shouldShowReasoningEffortTag,
    };
  }

  return {
    isPreviewExiting:
      current.visibleSelectedToolId !== null || current.visibleShouldShowReasoningEffortTag,
    selectedToolId,
    visibleSelectedToolId: current.visibleSelectedToolId,
    visibleShouldShowReasoningEffortTag: current.visibleShouldShowReasoningEffortTag,
  };
}

export function useChatInputState() {
  const context = use(ChatInputStateContext);

  if (!context) {
    throw new Error('useChatInputState must be used within ChatInputProvider');
  }

  return context;
}

export function useChatInputActions() {
  const context = use(ChatInputActionsContext);

  if (!context) {
    throw new Error('useChatInputActions must be used within ChatInputProvider');
  }

  return context;
}

export function useChatInputMedia() {
  const context = use(ChatInputMediaContext);

  if (!context) {
    throw new Error('useChatInputMedia must be used within ChatInputProvider');
  }

  return context;
}

export function useChatInputMeta() {
  const context = use(ChatInputMetaContext);

  if (!context) {
    throw new Error('useChatInputMeta must be used within ChatInputProvider');
  }

  return context;
}
