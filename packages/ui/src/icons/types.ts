import type { GENERAL_ICONS } from '../icons-png/general';
import type { MODEL_ICONS } from '../icons-png/models';
import type { PROVIDER_ICONS } from '../icons-png/providers';
import type { IconPngSource } from '../icons-png/types';

export type { IconPngSource };

export type GeneralIconKey = keyof typeof GENERAL_ICONS;
export type ModelIconKey = keyof typeof MODEL_ICONS;
export type ProviderIconKey = keyof typeof PROVIDER_ICONS;
