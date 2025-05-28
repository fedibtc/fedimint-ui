import React, { createContext, Dispatch, ReactNode, useReducer } from 'react';
import { GuardianServerStatus } from '@fedimint/types';
import {
  SetupState,
  NewSetupState,
  SetupAction,
  SETUP_ACTION_TYPE,
  SetupProgress,
} from '../../types/guardian';
import { isConsensusparams } from '../../guardian-ui/utils/validators';
import { randomNames } from '../../guardian-ui/setup/randomNames';

import {
  FollowerConfigs,
  HostConfigs,
  // useGuardianApi,
  useHandleBackgroundGuardianSetupActions,
  // useHandleSetupServerStatus,
  // useUpdateLocalStorageOnSetupStateChange,
} from '../../hooks';

export const LOCAL_STORAGE_SETUP_KEY = 'setup-guardian-ui-state';

/**
 * Creates the initial state using loaded state from local storage.
 */
// function makeInitialState(loadFromStorage = true): SetupState {
//   const randomName =
//     randomNames[Math.floor(Math.random() * randomNames.length)] +
//     Math.floor(Math.random() * 10000)
//       .toString()
//       .padStart(4, '0');
//   let state: SetupState = {
//     role: null,
//     progress: SetupProgress.Start,
//     myName: randomName,
//     configGenParams: null,
//     password: null,
//     numPeers: 0,
//     peers: [],
//     tosConfig: { showTos: false, tos: undefined },
//     ourCurrentId: null,
//   };
//   if (loadFromStorage) {
//     try {
//       const storageJson = localStorage.getItem(LOCAL_STORAGE_SETUP_KEY);
//       if (storageJson) {
//         state = JSON.parse(storageJson) as SetupState;
//       }
//     } catch (err) {
//       console.warn('Encountered error while fetching storage state', err);
//     }
//   }

//   if (
//     state.progress !== SetupProgress.Start &&
//     state.configGenParams !== null &&
//     isConsensusparams(state.configGenParams)
//   ) {
//     const peers = Object.values(state.configGenParams.peers);
//     state.peers = peers;
//     state.numPeers = state.numPeers ? state.numPeers : peers.length;
//   }

//   return state;
// }

function makeInitialState(): NewSetupState {
  const state = {
    guardianName: '',
    federationName: '',
    password: '',
    code: null, // own code
    guardians: [], // other guardian names and codes
    error: null,
  };

  // try {
  //   const storageJson = localStorage.getItem(LOCAL_STORAGE_SETUP_KEY);
  //   if (storageJson) {
  //     state = JSON.parse(storageJson) as NewSetupState;
  //   }
  // } catch (err) {
  //   console.warn('Encountered error while fetching storage state', err);
  // }

  return state;
}

const initialState = makeInitialState();

const reducer = (state: NewSetupState, action: SetupAction): NewSetupState => {
  switch (action.type) {
    case SETUP_ACTION_TYPE.RESET:
      return initialState;
    case SETUP_ACTION_TYPE.SET_DATA:
      return { ...state, ...action.payload };
    case SETUP_ACTION_TYPE.ADD_CODE:
      return { ...state, guardians: [...state.guardians, action.payload] };
    case SETUP_ACTION_TYPE.SET_ERROR:
      return { ...state, error: action.payload };
    // case SETUP_ACTION_TYPE.SET_ROLE:
    //   return { ...state, role: action.payload };
    // case SETUP_ACTION_TYPE.SET_PROGRESS:
    //   return { ...state, progress: action.payload };
    // case SETUP_ACTION_TYPE.SET_MY_NAME:
    //   return { ...state, myName: action.payload };
    // case SETUP_ACTION_TYPE.SET_CONFIG_GEN_PARAMS:
    //   return { ...state, configGenParams: action.payload };
    // case SETUP_ACTION_TYPE.SET_NUM_PEERS:
    //   return { ...state, numPeers: action.payload };
    // case SETUP_ACTION_TYPE.SET_PEERS:
    //   return { ...state, peers: action.payload };
    // case SETUP_ACTION_TYPE.SET_OUR_CURRENT_ID:
    //   return { ...state, ourCurrentId: action.payload };
    // case SETUP_ACTION_TYPE.SET_TOS_CONFIG:
    //   return { ...state, tosConfig: action.payload };
    default:
      return state;
  }
};

export interface SetupContextValue {
  state: NewSetupState;
  dispatch: Dispatch<SetupAction>;
  submitConfiguration<T extends HostConfigs | FollowerConfigs>(config: {
    myName: string;
    password: string;
    configs: T;
  }): Promise<void>;
  connectToHost(url: string): Promise<void>;
  fetchConsensusState(): Promise<void>;
  toggleConsensusPolling(toggle: boolean): void;
}

export const SetupContext = createContext<SetupContextValue>({
  state: initialState,
  dispatch: () => null,
  submitConfiguration: () => Promise.reject(),
  connectToHost: () => Promise.reject(),
  fetchConsensusState: () => Promise.reject(),
  toggleConsensusPolling: () => null,
});

export interface SetupContextProviderProps {
  // initServerStatus: GuardianServerStatus;
  children: ReactNode;
}

export const SetupContextProvider: React.FC<SetupContextProviderProps> = ({
  // initServerStatus,
  children,
}: SetupContextProviderProps) => {
  // const api = useGuardianApi();
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    // password: api.getPassword() || initialState.data.password,
  });

  // useHandleSetupServerStatus(initServerStatus, dispatch);

  // Update local storage on state changes.
  // useUpdateLocalStorageOnSetupStateChange(state);

  const {
    submitConfiguration,
    connectToHost,
    fetchConsensusState,
    toggleConsensusPolling,
  } = useHandleBackgroundGuardianSetupActions(state, dispatch);

  return (
    <SetupContext.Provider
      value={{
        state,
        dispatch,
        submitConfiguration,
        connectToHost,
        fetchConsensusState,
        toggleConsensusPolling,
      }}
    >
      {children}
    </SetupContext.Provider>
  );
};
