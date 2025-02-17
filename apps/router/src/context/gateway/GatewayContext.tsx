import React, {
  createContext,
  Dispatch,
  ReactNode,
  useMemo,
  useReducer,
} from 'react';
import { useGatewayConfig } from '../../hooks';
import { GatewayApi } from '../../api/GatewayApi';
import {
  GATEWAY_APP_ACTION_TYPE,
  GatewayAppAction,
  GatewayAppState,
  GatewayStatus,
  WalletModalAction,
  WalletModalType,
} from '../../types/gateway';
import { useLocation } from 'react-router-dom';

export interface GatewayContextValue {
  id: string;
  api: GatewayApi;
  state: GatewayAppState;
  dispatch: Dispatch<GatewayAppAction>;
}

const initialState: GatewayAppState = {
  status: GatewayStatus.Loading,
  needsAuth: true,
  gatewayError: undefined,
  balances: null,
  gatewayInfo: null,
  unit: 'msats',
  showConnectFed: false,
  walletModalState: {
    isOpen: false,
    action: WalletModalAction.Receive,
    type: WalletModalType.Onchain,
    selectedFederation: null,
    showSelector: true,
  },
  activeTab: 0,
};

const reducer = (
  state: GatewayAppState,
  action: GatewayAppAction
): GatewayAppState => {
  switch (action.type) {
    case GATEWAY_APP_ACTION_TYPE.SET_STATUS:
      return { ...state, status: action.payload };
    case GATEWAY_APP_ACTION_TYPE.SET_NEEDS_AUTH:
      return { ...state, needsAuth: action.payload };
    case GATEWAY_APP_ACTION_TYPE.SET_ERROR:
      return { ...state, gatewayError: action.payload };
    case GATEWAY_APP_ACTION_TYPE.SET_BALANCES:
      return { ...state, balances: action.payload };
    case GATEWAY_APP_ACTION_TYPE.SET_GATEWAY_INFO:
      return { ...state, gatewayInfo: action.payload };
    case GATEWAY_APP_ACTION_TYPE.SET_UNIT:
      return { ...state, unit: action.payload };
    case GATEWAY_APP_ACTION_TYPE.SET_SHOW_CONNECT_FED:
      return { ...state, showConnectFed: action.payload };
    case GATEWAY_APP_ACTION_TYPE.SET_WALLET_MODAL_STATE:
      return {
        ...state,
        walletModalState: { ...state.walletModalState, ...action.payload },
      };
    case GATEWAY_APP_ACTION_TYPE.SET_ACTIVE_TAB:
      return { ...state, activeTab: action.payload };
    default:
      return state;
  }
};

export const GatewayContext = createContext<GatewayContextValue | null>(null);

export interface GatewayContextProviderProps {
  children: ReactNode;
}

export const GatewayContextProvider: React.FC<GatewayContextProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const location = useLocation();
  const gatewayId = location.pathname.split('/')[2];
  const config = useGatewayConfig();
  const gatewayApi = useMemo(() => new GatewayApi(config), [config]);

  return (
    <GatewayContext.Provider
      value={{
        id: gatewayId,
        api: gatewayApi,
        state,
        dispatch,
      }}
    >
      {children}
    </GatewayContext.Provider>
  );
};
