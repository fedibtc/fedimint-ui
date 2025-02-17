import { Dispatch, useContext, useEffect } from 'react';
import { GuardianContext } from '../../context/guardian/GuardianContext';
import {
  GUARDIAN_APP_ACTION_TYPE,
  GuardianAppAction,
  GuardianAppState,
  GuardianConfig,
  GuardianStatus,
} from '../../types/guardian';
import { AdminApiInterface, GuardianApi } from '../../api/GuardianApi';
import { GuardianServerStatus } from '@fedimint/types';
import { formatApiErrorMessage } from '../../guardian-ui/utils/api';
import { useAppContext } from '..';

export const useGuardianConfig = (): GuardianConfig => {
  const { service } = useAppContext();

  if (!service) {
    throw new Error('useGuardianConfig must be used with a selected guardian');
  }

  return service.config;
};

export const useGuardianDispatch = (): Dispatch<GuardianAppAction> => {
  const guardian = useContext(GuardianContext);
  if (!guardian)
    throw new Error(
      'useGuardianDispatch must be used within a GuardianContextProvider'
    );
  return guardian.dispatch;
};

export const useLoadGuardian = (): void => {
  const guardian = useContext(GuardianContext);
  if (!guardian)
    throw new Error(
      'useLoadGuardian must be used within a GuardianContextProvider'
    );
  const { api, state, id, dispatch } = guardian;
  useEffect(() => {
    const load = async () => {
      try {
        await api.connect();
        const server = (await api.status()).server;

        if (server !== GuardianServerStatus.AwaitingPassword) {
          const password = api.getPassword();
          const hasValidPassword = password
            ? await api.testPassword(password)
            : false;
          if (!hasValidPassword) {
            dispatch({
              type: GUARDIAN_APP_ACTION_TYPE.SET_NEEDS_AUTH,
              payload: true,
            });
          }
        }

        if (server === GuardianServerStatus.ConsensusRunning) {
          dispatch({
            type: GUARDIAN_APP_ACTION_TYPE.SET_STATUS,
            payload: GuardianStatus.Admin,
          });
        } else {
          dispatch({
            type: GUARDIAN_APP_ACTION_TYPE.SET_STATUS,
            payload: GuardianStatus.Setup,
          });
        }

        dispatch({
          type: GUARDIAN_APP_ACTION_TYPE.SET_INIT_SERVER_STATUS,
          payload: server,
        });
      } catch (err) {
        dispatch({
          type: GUARDIAN_APP_ACTION_TYPE.SET_ERROR,
          payload: formatApiErrorMessage(err),
        });
      }
    };

    if (state.status === GuardianStatus.Loading) {
      load().catch((err) => console.error(err));
    }
  }, [state.status, api, dispatch, id]);
};

export const useGuardianApi = (): GuardianApi => {
  const guardian = useContext(GuardianContext);
  if (!guardian)
    throw new Error(
      'useGuardianApi must be used within a GuardianContextProvider'
    );
  return guardian.api;
};

export const useGuardianState = (): GuardianAppState => {
  const guardian = useContext(GuardianContext);
  if (!guardian)
    throw new Error(
      'useGuardianState must be used within a GuardianContextProvider'
    );
  return guardian.state;
};

export const useGuardianStatus = (): GuardianStatus => {
  const guardian = useContext(GuardianContext);
  if (!guardian)
    throw new Error(
      'useGuardianStatus must be used within a GuardianContextProvider'
    );
  return guardian.state.status;
};

export const useGuardianId = (): string => {
  const guardian = useContext(GuardianContext);
  if (!guardian)
    throw new Error(
      'useGuardianId must be used within a GuardianContextProvider'
    );
  return guardian.id;
};

export const useGuardianAdminApi = (): AdminApiInterface => {
  const guardian = useContext(GuardianContext);
  if (!guardian)
    throw new Error(
      'useGuardianAdminApi must be used within a GuardianContextProvider'
    );
  return guardian.api;
};
