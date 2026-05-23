import { GlassFallbackView, type GlassViewProps } from '@/components/glass/GlassFallbackView';

export type { GlassViewProps };

export function isAppGlassAvailable() {
  return false;
}

export function GlassView(props: GlassViewProps) {
  return <GlassFallbackView {...props} />;
}
