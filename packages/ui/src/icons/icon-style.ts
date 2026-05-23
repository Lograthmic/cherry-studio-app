import type { SvgProps } from 'react-native-svg';
import { useResolveClassNames } from 'uniwind';

import type { IconComponentProps } from './types';

function toIconSize(value: unknown) {
  if (typeof value === 'number' || typeof value === 'string') {
    return value;
  }
}

export function useIconProps(className: string | undefined, props: SvgProps) {
  const styles = useResolveClassNames(className ?? '');
  const width = props.width ?? toIconSize(styles.width);
  const height = props.height ?? toIconSize(styles.height);
  const color = props.color ?? styles.color;

  return {
    ...props,
    ...(width !== undefined ? { width } : null),
    ...(height !== undefined ? { height } : null),
    ...(color !== undefined ? { color } : null),
  } satisfies IconComponentProps;
}
