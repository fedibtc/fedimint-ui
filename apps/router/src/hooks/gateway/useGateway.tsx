import { Dispatch, useContext, useEffect } from 'react';
import {
  GATEWAY_APP_ACTION_TYPE,
  GatewayAppAction,
  GatewayAppState,
  GatewayConfig,
} from '../../types/gateway';
import { GatewayContext } from '../../context/gateway/GatewayContext';
import { GatewayApi } from '../../api/GatewayApi';
import { GatewayInfo } from '@fedimint/types';
import { useAppContext } from '..';

export const useGatewayConfig = (): GatewayConfig => {
  const { service } = useAppContext();

  if (!service) {
    throw new Error('useGatewayConfig must be used with a selected gateway');
  }

  return service.config;
};

export const useGatewayContext = () => {
  const gateway = useContext(GatewayContext);
  if (!gateway)
    throw new Error(
      'useGatewayContext must be used within a GatewayContextProvider'
    );
  return gateway;
};

export const useGatewayApi = (): GatewayApi => {
  const gateway = useGatewayContext();
  return gateway.api;
};

export const useGatewayState = (): GatewayAppState => {
  const gateway = useGatewayContext();
  return gateway.state;
};

export const useGatewayDispatch = (): Dispatch<GatewayAppAction> => {
  const gateway = useGatewayContext();
  return gateway.dispatch;
};

export const useGatewayInfo = (): GatewayInfo => {
  const gateway = useGatewayContext();
  if (!gateway.state.gatewayInfo)
    throw new Error('useGatewayInfo called with no gateway info available');
  return gateway.state.gatewayInfo;
};

export const useLoadGateway = () => {
  const { state, dispatch, api, id } = useGatewayContext();

  useEffect(() => {
    if (sessionStorage.getItem(id)) {
      dispatch({
        type: GATEWAY_APP_ACTION_TYPE.SET_NEEDS_AUTH,
        payload: false,
      });
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (!state.needsAuth) {
      const fetchInfoAndConfigs = async () => {
        try {
          const gatewayInfo = await api.fetchInfo();
          const configs = await api.fetchConfigs();

          const updatedFederations = gatewayInfo.federations.map(
            (federation) => ({
              ...federation,
              config: configs.federations[federation.federation_id],
            })
          );

          const updatedGatewayInfo = {
            ...gatewayInfo,
            federations: updatedFederations,
          };

          dispatch({
            type: GATEWAY_APP_ACTION_TYPE.SET_GATEWAY_INFO,
            payload: updatedGatewayInfo,
          });
        } catch (error: unknown) {
          console.error(error);
          dispatch({
            type: GATEWAY_APP_ACTION_TYPE.SET_ERROR,
            payload: (error as Error).message,
          });
        }
      };

      const fetchBalances = () => {
        api
          .fetchBalances()
          .then((balances) => {
            dispatch({
              type: GATEWAY_APP_ACTION_TYPE.SET_BALANCES,
              payload: balances,
            });
          })
          .catch((error) => {
            console.error(error);
            dispatch({
              type: GATEWAY_APP_ACTION_TYPE.SET_ERROR,
              payload: (error as Error).message,
            });
          });
      };

      fetchInfoAndConfigs();
      fetchBalances();

      const interval = setInterval(() => {
        fetchInfoAndConfigs();
        fetchBalances();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [state.needsAuth, api, dispatch]);
};
