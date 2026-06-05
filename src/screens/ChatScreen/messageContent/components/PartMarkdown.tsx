import { StreamdownText } from 'react-native-streamdown';

import { useMarkdownLinkPress } from '../hooks/useMarkdownLinkPress';

type PartMarkdownProps = {
  markdown: string;
};

export function PartMarkdown({ markdown }: PartMarkdownProps) {
  const { handleLinkPress } = useMarkdownLinkPress();

  return (
    <StreamdownText
      allowTrailingMargin={false}
      flavor="github"
      markdown={markdown}
      md4cFlags={{ latexMath: true, underline: false }}
      onLinkPress={handleLinkPress}
      selectable
    />
  );
}
