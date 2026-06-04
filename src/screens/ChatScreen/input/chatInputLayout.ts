export const chatInputMinTextAreaHeight = 52;
export const chatInputMaxTextAreaHeight = 132;
export const chatInputBottomToolbarHeight = 44;
export const chatInputMinComposerHeight = chatInputMinTextAreaHeight + chatInputBottomToolbarHeight;
export const chatInputMinBottomPadding = 8;
export const chatInputHorizontalScreenInset = 16;
export const chatInputMessageListGap = 8;

export function getChatInputMinimumHeight(bottomInset: number) {
  return chatInputMinComposerHeight + Math.max(bottomInset, chatInputMinBottomPadding);
}
