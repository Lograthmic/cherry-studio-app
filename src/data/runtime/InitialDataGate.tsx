import type { PropsWithChildren } from 'react';

import { useDatabaseState } from './DatabaseProvider';

export function InitialDataGate({ children }: PropsWithChildren) {
  const state = useDatabaseState();

  if (state.status === 'loading') {
    return null;
  }

  if (state.status === 'error') {
    throw state.error;
  }

  return children;
}
