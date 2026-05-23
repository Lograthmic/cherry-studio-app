import { CheckIcon, GlobeIcon, ImageIcon, LightbulbIcon, PaperclipIcon } from 'lucide-uniwind';
import type { ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import type { SvgProps } from 'react-native-svg';
import { withUniwind } from 'uniwind';

type ChatInputActionConfig = {
  icon: ComponentType<SvgProps>;
  id: string;
  tagTitleKey: string;
  titleKey: string;
};

type ChatInputActionListProps = {
  onActionPress: (actionId: ChatInputActionId) => void;
  selectedActionId: ChatInputActionId | null;
};

export const chatInputActions = [
  {
    icon: ImageIcon,
    id: 'create-image',
    tagTitleKey: 'chat.tools.createImage',
    titleKey: 'chat.actions.createImage',
  },
  {
    icon: LightbulbIcon,
    id: 'think',
    tagTitleKey: 'chat.tools.think',
    titleKey: 'chat.actions.think',
  },
  {
    icon: GlobeIcon,
    id: 'web-search',
    tagTitleKey: 'chat.tools.webSearch',
    titleKey: 'chat.actions.webSearch',
  },
  {
    icon: PaperclipIcon,
    id: 'add-file',
    tagTitleKey: 'chat.tools.addFile',
    titleKey: 'chat.actions.addFile',
  },
] as const satisfies readonly ChatInputActionConfig[];

export type ChatInputAction = (typeof chatInputActions)[number];
export type ChatInputActionId = ChatInputAction['id'];

const StyledPressable = withUniwind(Pressable);

export function ChatInputActionList({ onActionPress, selectedActionId }: ChatInputActionListProps) {
  const { t } = useTranslation();

  return (
    <View className="gap-1">
      {chatInputActions.map((action) => {
        const Icon = action.icon;
        const isSelected = action.id === selectedActionId;
        const title = t(action.titleKey);

        return (
          <StyledPressable
            accessibilityLabel={title}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            className="min-h-14 flex-row items-center gap-4 rounded-2xl px-3 py-2 active:bg-surface-secondary active:opacity-70"
            key={action.id}
            onPress={() => onActionPress(action.id)}
          >
            <Icon
              className={['size-7', isSelected ? 'text-accent' : 'text-foreground'].join(' ')}
              strokeWidth={2}
            />
            <Text
              className={[
                'flex-1 font-semibold text-base',
                isSelected ? 'text-accent' : 'text-foreground',
              ].join(' ')}
            >
              {title}
            </Text>
            {isSelected ? <CheckIcon className="size-5 text-accent" strokeWidth={2.25} /> : null}
          </StyledPressable>
        );
      })}
    </View>
  );
}
