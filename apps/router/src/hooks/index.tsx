import { Dispatch, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { sha256Hash } from '@fedimint/utils';
import {
  APP_ACTION_TYPE,
  AppAction,
  AppContext,
  AppContextValue,
} from '../context/AppContext';
import { getServiceType } from '../helpers/service';

export function useAppContext(): AppContextValue {
  return useContext(AppContext);
}

export const useActiveService = (): {
  type: 'guardian' | 'gateway';
  id: string;
} | null => {
  const location = useLocation();
  const [type, id] = location.pathname.split('/').filter(Boolean);

  if (!type || !id || (type !== 'guardian' && type !== 'gateway')) {
    return null;
  }

  return {
    type,
    id,
  };
};

export function useAppInit(
  dispatch: Dispatch<AppAction>,
  url?: string | undefined
) {
  useEffect(() => {
    (async () => {
      if (!url) return;

      const service = getServiceType(url);
      if (!service) return;
      const actionType = APP_ACTION_TYPE.ADD_SERVICE;

      const hash = await sha256Hash(url);

      dispatch({
        type: actionType,
        payload: {
          service: {
            config: {
              id: hash,
              baseUrl: url,
            },
          },
        },
      });
    })();
  }, [dispatch, url]);
}

export * from './guardian/useGuardian';
export * from './guardian/useGuardianSetup';
export * from './gateway/useGateway';
export * from './custom/useTrimmedInput';
export * from './custom/useQuery';
