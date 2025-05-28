import React, {
  createContext,
  Dispatch,
  ReactNode,
  useMemo,
  useReducer,
} from 'react';
import { GuardianApi } from '../../api/GuardianApi';
import {
  GUARDIAN_APP_ACTION_TYPE,
  GuardianAppAction,
  GuardianAppState,
} from '../../types/guardian';
import { useGuardianConfig } from '../../hooks';
import { useLocation } from 'react-router-dom';

export interface GuardianContextValue {
  id: string;
  api: GuardianApi;
  state: GuardianAppState;
  dispatch: Dispatch<GuardianAppAction>;
}

const initialState = {
  status: undefined,
  authed: false,
  error: '',
};

const reducer = (
  state: GuardianAppState,
  action: GuardianAppAction
): GuardianAppState => {
  switch (action.type) {
    case GUARDIAN_APP_ACTION_TYPE.SET_STATUS:
      return { ...state, status: action.payload };
    case GUARDIAN_APP_ACTION_TYPE.SET_AUTHED:
      return { ...state, authed: action.payload };
    case GUARDIAN_APP_ACTION_TYPE.SET_ERROR:
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

export const GuardianContext = createContext<GuardianContextValue | null>(null);

export interface GuardianContextProviderProps {
  children: ReactNode;
}

export const GuardianContextProvider: React.FC<
  GuardianContextProviderProps
> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const location = useLocation();
  const guardianId = location.pathname.split('/')[2];
  const config = useGuardianConfig();

  const guardianApi = useMemo(() => new GuardianApi(config), [config]);

  return (
    <GuardianContext.Provider
      value={{
        id: guardianId,
        api: guardianApi,
        state,
        dispatch,
      }}
    >
      {children}
    </GuardianContext.Provider>
  );
};
