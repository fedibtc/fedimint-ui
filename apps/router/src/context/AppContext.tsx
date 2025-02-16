import React, { createContext, Dispatch, ReactNode, useReducer } from 'react';
import { LOCAL_STORAGE_APP_STATE_KEY } from '../constants/Version';
import { Service } from '../types';

export interface AppContextValue {
  services: Record<string, Service>;
  dispatch: Dispatch<AppAction>;
}

export const initialState: AppContextValue = {
  services: {},
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
  SET_SELECTED_SERVICE = 'SET_SELECTED_SERVICE',
  ADD_SERVICE = 'ADD_SERVICE',
  UPDATE_SERVICE = 'UPDATE_SERVICE',
  REMOVE_SERVICE = 'REMOVE_SERVICE',
}

export type AppAction =
  | {
      type: APP_ACTION_TYPE.ADD_SERVICE;
      payload: {
        id: string;
        service: Service;
      };
    }
  | {
      type: APP_ACTION_TYPE.UPDATE_SERVICE;
      payload: {
        id: string;
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
        services: {
          ...state.services,
          [action.payload.id]: action.payload.service,
        },
      };
    case APP_ACTION_TYPE.UPDATE_SERVICE:
      return {
        ...state,
        services: {
          ...state.services,
          [action.payload.id]: action.payload.service,
        },
      };
    case APP_ACTION_TYPE.REMOVE_SERVICE:
      return {
        ...state,
        services: {},
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
