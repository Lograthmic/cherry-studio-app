import {
  appendVoiceInputVolumeSample,
  mergeVoiceInputDraft,
  normalizeVoiceInputVolume,
} from '../chatInputVoiceInput';

describe('mergeVoiceInputDraft', () => {
  test('uses recognized text when the draft is empty', () => {
    expect(mergeVoiceInputDraft('', ' hello world ')).toBe('hello world');
  });

  test('appends recognized text to an existing draft', () => {
    expect(mergeVoiceInputDraft('Ask Cherry', ' about speech input ')).toBe(
      'Ask Cherry about speech input',
    );
  });

  test('keeps the base draft when recognized text is blank', () => {
    expect(mergeVoiceInputDraft('existing', '   ')).toBe('existing');
  });
});

describe('normalizeVoiceInputVolume', () => {
  test('treats negative and zero values as silent', () => {
    expect(normalizeVoiceInputVolume(-2)).toBe(0);
    expect(normalizeVoiceInputVolume(0)).toBe(0);
  });

  test('normalizes the expo speech recognition range', () => {
    expect(normalizeVoiceInputVolume(5)).toBe(0.5);
    expect(normalizeVoiceInputVolume(10)).toBe(1);
  });

  test('clamps invalid and out-of-range values', () => {
    expect(normalizeVoiceInputVolume(Number.NaN)).toBe(0);
    expect(normalizeVoiceInputVolume(12)).toBe(1);
  });
});

describe('appendVoiceInputVolumeSample', () => {
  test('keeps the latest normalized samples within the limit', () => {
    expect(appendVoiceInputVolumeSample([0.1, 0.2], 5, 2)).toEqual([0.2, 0.5]);
  });

  test('returns an empty sample window for non-positive limits', () => {
    expect(appendVoiceInputVolumeSample([0.1], 5, 0)).toEqual([]);
  });
});
