import React, { createContext, Dispatch, ReactNode, useReducer } from 'react';
import {
  SetupState,
  SetupAction,
  SETUP_ACTION_TYPE,
} from '../../types/guardian';

export const LOCAL_STORAGE_SETUP_KEY = 'setup-guardian-ui-state';

function makeInitialState(): SetupState {
  let state = {
    guardianName: '',
    federationName: '',
    isLeader: false,
    password: '',
    code: null,
    peers: [],
    error: null,
  };

  try {
    const stateStr = localStorage.getItem(LOCAL_STORAGE_SETUP_KEY);
    if (stateStr) {
      state = { ...state, ...JSON.parse(stateStr) };
    }
  } catch (err) {
    console.warn('Error fetching setup storage state', err);
  }

  return state;
}

const initialState = makeInitialState();

const reducer = (state: SetupState, action: SetupAction): SetupState => {
  switch (action.type) {
    case SETUP_ACTION_TYPE.RESET:
      return initialState;
    case SETUP_ACTION_TYPE.SET_DATA:
      return { ...state, ...action.payload };
    case SETUP_ACTION_TYPE.ADD_PEER:
      return { ...state, peers: [...state.peers, action.payload] };
    case SETUP_ACTION_TYPE.RESET_PEERS:
      return { ...state, peers: [] };
    case SETUP_ACTION_TYPE.SET_ERROR:
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

export interface SetupContextValue {
  state: SetupState;
  dispatch: Dispatch<SetupAction>;
}

export const SetupContext = createContext<SetupContextValue>({
  state: initialState,
  dispatch: () => null,
});

export interface SetupContextProviderProps {
  children: ReactNode;
}

export const SetupContextProvider: React.FC<SetupContextProviderProps> = ({
  children,
}: SetupContextProviderProps) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <SetupContext.Provider
      value={{
        state,
        dispatch,
      }}
    >
      {children}
    </SetupContext.Provider>
  );
};
