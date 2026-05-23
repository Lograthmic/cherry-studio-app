import type { LucideProps } from 'lucide-react-native';
import { createElement, type ReactNode } from 'react';
import { useResolveClassNames, withUniwind } from 'uniwind';

export type LucidePropsWithClassName = LucideProps & {
  className?: string;
};

type LucideComponent = (props: LucideProps) => ReactNode;

function toIconSize(value: unknown) {
  if (typeof value === 'number' || typeof value === 'string') {
    return value;
  }
}

export default function iconWithClassName(icon: LucideComponent) {
  const Wrapped = withUniwind(icon);

  return function WrappedIcon(props: LucidePropsWithClassName) {
    const styles = useResolveClassNames(props.className ?? '');
    const extraProps: Pick<LucideProps, 'height' | 'width'> = {};
    const width = toIconSize(styles.width);
    const height = toIconSize(styles.height);

    if (width !== undefined) {
      extraProps.width = width;
    }

    if (height !== undefined) {
      extraProps.height = height;
    }

    return createElement(Wrapped, { ...extraProps, ...props });
  };
}
