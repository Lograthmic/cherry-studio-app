import { decodeCursor, encodeCursor, splitCursor } from '../cursor';

describe('cursor', () => {
  test('splits cursors on the first separator and allows empty values', () => {
    expect(splitCursor('topic:123:abc')).toEqual({ id: '123:abc', key: 'topic' });
    expect(splitCursor('topic:')).toEqual({ id: '', key: 'topic' });
    expect(splitCursor('topic')).toBeNull();
  });

  test('decodes strict cursors with non-empty key and id', () => {
    expect(decodeCursor('pin:a0')).toEqual({ id: 'a0', key: 'pin' });
    expect(decodeCursor('pin:')).toBeNull();
    expect(decodeCursor(':a0')).toBeNull();
  });

  test('encodes cursors with key and id', () => {
    expect(encodeCursor('pin', 'a0')).toBe('pin:a0');
  });
});
