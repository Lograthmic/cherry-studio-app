import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { createDatabaseRuntime, type DatabaseRuntime } from '@/data/db/client';

type DatabaseProviderProps = PropsWithChildren<{
  bootstrap: (runtime: DatabaseRuntime) => Promise<void> | void;
}>;

type DatabaseState =
  | {
      status: 'loading';
      runtime?: never;
      error?: never;
    }
  | {
      status: 'ready';
      runtime: DatabaseRuntime;
      error?: never;
    }
  | {
      status: 'error';
      runtime?: never;
      error: Error;
    };

const DatabaseContext = createContext<DatabaseState | null>(null);

export function DatabaseProvider({ bootstrap, children }: DatabaseProviderProps) {
  const runtime = useMemo(() => createDatabaseRuntime(), []);
  const [state, setState] = useState<DatabaseState>({ status: 'loading' });

  useEffect(() => {
    let disposed = false;

    async function initRuntime() {
      try {
        await runtime.init();

        if (disposed) {
          return;
        }

        await bootstrap(runtime);

        if (!disposed) {
          setState({ status: 'ready', runtime });
        }
      } catch (error) {
        if (!disposed) {
          setState({ status: 'error', error: toError(error) });
        }
      }
    }

    void initRuntime();

    return () => {
      disposed = true;
      runtime.dispose();
    };
  }, [bootstrap, runtime]);

  return <DatabaseContext.Provider value={state}>{children}</DatabaseContext.Provider>;
}

export function useDatabaseState() {
  const state = useContext(DatabaseContext);

  if (!state) {
    throw new Error('useDatabaseState must be used within DatabaseProvider');
  }

  return state;
}

export function useDatabaseRuntime() {
  const state = useDatabaseState();

  if (state.status !== 'ready') {
    throw new Error('Database runtime is not ready');
  }

  return state.runtime;
}

function toError(error: unknown) {
  if (error instanceof Error) {
    return error;
  }

  return new Error(String(error));
}
