const voiceInputVolumeMin = 0;
const voiceInputVolumeMax = 10;

export function mergeVoiceInputDraft(baseDraft: string, recognizedText: string) {
  const trimmedRecognizedText = recognizedText.trim();

  if (!trimmedRecognizedText) {
    return baseDraft;
  }

  return baseDraft.trim().length > 0
    ? `${baseDraft} ${trimmedRecognizedText}`
    : trimmedRecognizedText;
}

export function normalizeVoiceInputVolume(value: number) {
  if (!Number.isFinite(value) || value <= voiceInputVolumeMin) {
    return 0;
  }

  if (value >= voiceInputVolumeMax) {
    return 1;
  }

  return value / voiceInputVolumeMax;
}

export function appendVoiceInputVolumeSample(
  samples: readonly number[],
  value: number,
  limit: number,
) {
  if (limit <= 0) {
    return [];
  }

  return [...samples, normalizeVoiceInputVolume(value)].slice(-limit);
}
