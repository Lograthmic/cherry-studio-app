import { SystemVoiceInputDriver } from './SystemVoiceInputDriver';
import { VoiceInputService } from './voiceInputService';

export const voiceInputService = new VoiceInputService(new SystemVoiceInputDriver());
