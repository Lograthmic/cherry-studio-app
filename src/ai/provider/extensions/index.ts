/** App-specific Provider Extensions registered alongside `coreExtensions`. */

import { createGateway, type GatewayProviderSettings } from '@ai-sdk/gateway';
import type { ProviderV3 } from '@ai-sdk/provider';
import { ProviderExtension, type ProviderExtensionConfig } from '@cherrystudio/ai-core/provider';

export const GatewayExtension = ProviderExtension.create({
  name: 'gateway',
  aliases: ['ai-gateway'] as const,
  supportsImageGeneration: true,
  create: createGateway,
} as const satisfies ProviderExtensionConfig<GatewayProviderSettings, ProviderV3, 'gateway'>);

export const extensions = [GatewayExtension] as const;
