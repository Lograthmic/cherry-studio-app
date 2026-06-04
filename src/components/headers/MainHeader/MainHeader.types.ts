import type { MenuAction, NativeActionEvent } from '@expo/ui/community/menu';

export type MainHeaderMenuAction = MenuAction;

export type MainHeaderProps = {
  menuActions?: MenuAction[];
  onPressMenuAction?: (event: NativeActionEvent) => void;
  topicName?: string;
};
