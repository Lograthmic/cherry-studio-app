import { GlobeIcon, ImageIcon, LightbulbIcon, PaperclipIcon } from 'lucide-uniwind';
import type { ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import type { SvgProps } from 'react-native-svg';
import { withUniwind } from 'uniwind';

type ChatInputAction = {
  icon: ComponentType<SvgProps>;
  id: string;
  titleKey: string;
};

type ChatInputActionListProps = {
  onActionPress: (actionId: ChatInputActionId) => void;
};

const chatInputActions = [
  {
    icon: ImageIcon,
    id: 'create-image',
    titleKey: 'chat.actions.createImage',
  },
  {
    icon: LightbulbIcon,
    id: 'think',
    titleKey: 'chat.actions.think',
  },
  {
    icon: GlobeIcon,
    id: 'web-search',
    titleKey: 'chat.actions.webSearch',
  },
  {
    icon: PaperclipIcon,
    id: 'add-file',
    titleKey: 'chat.actions.addFile',
  },
] as const satisfies readonly ChatInputAction[];

export type ChatInputActionId = (typeof chatInputActions)[number]['id'];

const StyledPressable = withUniwind(Pressable);

export function ChatInputActionList({ onActionPress }: ChatInputActionListProps) {
  const { t } = useTranslation();

  return (
    <View className="gap-1">
      {chatInputActions.map((action) => {
        const Icon = action.icon;
        const title = t(action.titleKey);

        return (
          <StyledPressable
            accessibilityLabel={title}
            accessibilityRole="button"
            className="min-h-14 flex-row items-center gap-4 rounded-2xl px-3 py-2 active:bg-surface-secondary active:opacity-70"
            key={action.id}
            onPress={() => onActionPress(action.id)}
          >
            <Icon className="size-7 text-foreground" strokeWidth={2} />
            <Text className="flex-1 font-semibold text-base text-foreground">{title}</Text>
          </StyledPressable>
        );
      })}
    </View>
  );
}
