import React, { createContext, Dispatch, ReactNode, useReducer } from 'react';
import { LOCAL_STORAGE_APP_STATE_KEY } from '../constants';
import { Service } from '../types';

export interface AppContextValue {
  service: Service | null;
  dispatch: Dispatch<AppAction>;
}

export const initialState: AppContextValue = {
  service: null,
  dispatch: () => null,
};

const makeInitialState = (): AppContextValue => {
  const storedState = localStorage.getItem(LOCAL_STORAGE_APP_STATE_KEY);
  if (storedState) {
    try {
      const parsedState = JSON.parse(storedState);
      return {
        ...parsedState,
        dispatch: () => null,
      };
    } catch (error) {
      console.error('Failed to parse stored state:', error);
    }
  }
  return initialState;
};

export enum APP_ACTION_TYPE {
  ADD_SERVICE = 'ADD_SERVICE',
  REMOVE_SERVICE = 'REMOVE_SERVICE',
}

export type AppAction =
  | {
      type: APP_ACTION_TYPE.ADD_SERVICE;
      payload: {
        service: Service;
      };
    }
  | {
      type: APP_ACTION_TYPE.REMOVE_SERVICE;
    };

const saveToLocalStorage = (state: AppContextValue) => {
  localStorage.setItem(LOCAL_STORAGE_APP_STATE_KEY, JSON.stringify(state));
};

const reducer = (
  state: AppContextValue,
  action: AppAction
): AppContextValue => {
  switch (action.type) {
    case APP_ACTION_TYPE.ADD_SERVICE:
      return {
        ...state,
        service: action.payload.service,
      };
    case APP_ACTION_TYPE.REMOVE_SERVICE:
      return {
        ...state,
        service: null,
      };
  }
};

const reducerWithMiddleware = (
  state: AppContextValue,
  action: AppAction
): AppContextValue => {
  const newState = reducer(state, action);
  saveToLocalStorage(newState);
  return newState;
};

export const AppContext = createContext<AppContextValue>(makeInitialState());

export interface AppContextProviderProps {
  children: ReactNode;
}

export const AppContextProvider: React.FC<AppContextProviderProps> = ({
  children,
}: AppContextProviderProps) => {
  const [state, dispatch] = useReducer(
    reducerWithMiddleware,
    makeInitialState()
  );

  return (
    <AppContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};
