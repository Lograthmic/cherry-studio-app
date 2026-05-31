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
import {
  CHAT_INPUT_DEFAULT_REASONING_EFFORT,
  type ChatInputReasoningEffort,
  shouldShowChatInputReasoningEffortTag,
} from '@/screens/ChatScreen/input/utils/chatInputReasoning';

type ChatInputStateContextValue = {
  attachments: readonly ChatInputAttachmentDraft[];
  draft: string;
  isActionSheetOpen: boolean;
  isInputFocused: boolean;
  isReasoningEffortSelected: boolean;
  reasoningEffort: ChatInputReasoningEffort;
  selectedTool?: ChatInputAction;
  selectedToolId: ChatInputActionId | null;
  shouldShowReasoningEffortTag: boolean;
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

const chatInputFocusAfterActionDelay = 100;

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
  const [attachments, setAttachments] = useState<ChatInputAttachmentDraft[]>([]);
  const [selectedToolId, setSelectedToolId] = useState<ChatInputActionId | null>(null);
  const addAttachments = useCallback((nextAttachments: ChatInputAttachmentDraft[]) => {
    setAttachments((current) => appendChatInputAttachments(current, nextAttachments));
  }, []);
  const media = useChatInputPhotoPicker(isActionSheetOpen, addAttachments);
  const selectedTool = useMemo(() => getChatInputAction(selectedToolId), [selectedToolId]);
  const shouldShowReasoningEffortTag = shouldShowChatInputReasoningEffortTag(
    isReasoningEffortSelected,
    reasoningEffort,
  );

  useEffect(() => {
    return () => {
      if (focusAfterActionTimeoutRef.current) {
        clearTimeout(focusAfterActionTimeoutRef.current);
      }
    };
  }, []);

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

  const selectAction = useCallback((actionId: ChatInputActionId) => {
    setSelectedToolId((current) => toggleChatInputAction(current, actionId));
    shouldFocusAfterActionSheetCloseRef.current = true;
  }, []);

  const selectReasoningEffort = useCallback((nextReasoningEffort: ChatInputReasoningEffort) => {
    setReasoningEffort(nextReasoningEffort);
    setIsReasoningEffortSelected(true);
    shouldFocusAfterActionSheetCloseRef.current = true;
  }, []);

  const clearReasoningEffort = useCallback(() => {
    setIsReasoningEffortSelected(false);
    setReasoningEffort(CHAT_INPUT_DEFAULT_REASONING_EFFORT);
  }, []);

  const clearSelectedTool = useCallback(() => {
    setSelectedToolId(null);
  }, []);

  const removeAttachment = useCallback((attachmentId: string) => {
    setAttachments((current) => removeChatInputAttachment(current, attachmentId));
  }, []);

  const clearAttachments = useCallback(() => {
    setAttachments([]);
  }, []);

  const stateValue = useMemo(
    () => ({
      attachments,
      draft,
      isActionSheetOpen,
      isInputFocused,
      isReasoningEffortSelected,
      reasoningEffort,
      selectedTool,
      selectedToolId,
      shouldShowReasoningEffortTag,
    }),
    [
      attachments,
      draft,
      isActionSheetOpen,
      isInputFocused,
      isReasoningEffortSelected,
      reasoningEffort,
      selectedTool,
      selectedToolId,
      shouldShowReasoningEffortTag,
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
