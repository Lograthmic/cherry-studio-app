import { getBranchMessagePageIds } from '../branchMessagePagination';

describe('getBranchMessagePageIds', () => {
  const pathIds = ['m1', 'm2', 'm3', 'm4', 'm5'];

  test('returns the latest page without a cursor', () => {
    expect(getBranchMessagePageIds(pathIds, { limit: 2 })).toEqual({
      ids: ['m4', 'm5'],
      nextCursor: 'm4',
    });
  });

  test('returns the page before a cursor', () => {
    expect(getBranchMessagePageIds(pathIds, { cursor: 'm4', limit: 2 })).toEqual({
      ids: ['m2', 'm3'],
      nextCursor: 'm2',
    });
  });

  test('returns no next cursor when the page reaches the start', () => {
    expect(getBranchMessagePageIds(pathIds, { cursor: 'm2', limit: 2 })).toEqual({
      ids: ['m1'],
      nextCursor: undefined,
    });
  });

  test('returns null for an unknown cursor', () => {
    expect(getBranchMessagePageIds(pathIds, { cursor: 'missing', limit: 2 })).toBeNull();
  });

  test('returns an empty page for a non-positive limit', () => {
    expect(getBranchMessagePageIds(pathIds, { limit: 0 })).toEqual({ ids: [] });
  });
});
