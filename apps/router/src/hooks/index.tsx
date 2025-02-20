import { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AppContext, AppContextValue } from '../context/AppContext';

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

export * from './guardian/useGuardian';
export * from './guardian/useGuardianSetup';
export * from './gateway/useGateway';
export * from './custom/useTrimmedInput';
export * from './custom/useQuery';
