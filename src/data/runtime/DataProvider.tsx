import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { DbService } from '@/data/db/DbService';
import { createDataServices, type DataServices } from '@/data/services/createDataServices';

type DataProviderProps = PropsWithChildren<{
  bootstrap: (services: DataServices) => Promise<void> | void;
}>;

type DataState =
  | {
      error?: never;
      services?: never;
      status: 'loading';
    }
  | {
      error?: never;
      services: DataServices;
      status: 'ready';
    }
  | {
      error: Error;
      services?: never;
      status: 'error';
    };

const DataContext = createContext<DataState | null>(null);

export function DataProvider({ bootstrap, children }: DataProviderProps) {
  const { dbService, services } = useMemo(() => {
    const dbService = new DbService();
    return {
      dbService,
      services: createDataServices(dbService),
    };
  }, []);
  const [state, setState] = useState<DataState>({ status: 'loading' });

  useEffect(() => {
    let disposed = false;

    async function initData() {
      try {
        await dbService.init();
        await services.preference.init();

        if (disposed) {
          return;
        }

        await bootstrap(services);

        if (!disposed) {
          setState({ services, status: 'ready' });
        }
      } catch (error) {
        if (!disposed) {
          setState({ error: toError(error), status: 'error' });
        }
      }
    }

    void initData();

    return () => {
      disposed = true;
      dbService.dispose();
    };
  }, [bootstrap, dbService, services]);

  return <DataContext.Provider value={state}>{children}</DataContext.Provider>;
}

export function useDataState() {
  const state = useContext(DataContext);

  if (!state) {
    throw new Error('useDataState must be used within DataProvider');
  }

  return state;
}

export function useDataServices() {
  const state = useDataState();

  if (state.status !== 'ready') {
    throw new Error('Data services are not ready');
  }

  return state.services;
}

function toError(error: unknown) {
  if (error instanceof Error) {
    return error;
  }

  return new Error(String(error));
}
