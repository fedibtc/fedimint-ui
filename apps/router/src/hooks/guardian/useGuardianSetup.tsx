import { Dispatch, useCallback, useContext, useEffect, useState } from 'react';
import {
  SetupContext,
  SetupContextValue,
} from '../../context/guardian/SetupContext';
import {
  SETUP_ACTION_TYPE,
  SetupAction,
  SetupProgress,
  SetupState,
  NewSetupState,
} from '../../types/guardian';
import { SetupApiInterface } from '../../api/GuardianApi';
import { ConfigGenParams, GuardianServerStatus } from '@fedimint/types';
import { LOCAL_STORAGE_SETUP_KEY } from '../../context/guardian/SetupContext';
import { useGuardianApi } from './useGuardian';
import { GuardianContext } from '../../context/guardian/GuardianContext';

export const useGuardianSetupContext = (): SetupContextValue => {
  const setup = useContext(SetupContext);
  if (!setup)
    throw new Error(
      'useGuardianSetupContext must be used within a SetupContextProvider'
    );
  return setup;
};

export const useGuardianSetupApi = (): SetupApiInterface => {
  const guardian = useContext(GuardianContext);
  if (!guardian)
    throw new Error(
      'useGuardianSetupApi must be used within a GuardianContextProvider'
    );
  return guardian.api;
};

// export function useConsensusPolling(shouldPoll = true) {
//   const { toggleConsensusPolling } = useGuardianSetupContext();

//   useEffect(() => {
//     if (!shouldPoll) return;
//     toggleConsensusPolling(true);
//     return () => toggleConsensusPolling(false);
//   }, [shouldPoll, toggleConsensusPolling]);
// }

export const useHandleSetupServerStatus = (
  initServerStatus: GuardianServerStatus,
  dispatch: Dispatch<SetupAction>
): void => {
  useEffect(() => {
    switch (initServerStatus) {
      case GuardianServerStatus.AwaitingPassword:
        dispatch({
          type: SETUP_ACTION_TYPE.SET_INITIAL_STATE,
          payload: null,
        });
        break;
      case GuardianServerStatus.ReadyForConfigGen:
        dispatch({
          type: SETUP_ACTION_TYPE.SET_PROGRESS,
          payload: SetupProgress.ConnectGuardians,
        });
        break;
      case GuardianServerStatus.VerifyingConfigs:
      case GuardianServerStatus.VerifiedConfigs:
        dispatch({
          type: SETUP_ACTION_TYPE.SET_PROGRESS,
          payload: SetupProgress.VerifyGuardians,
        });
        break;
      case GuardianServerStatus.ConsensusRunning:
      default:
        dispatch({
          type: SETUP_ACTION_TYPE.SET_IS_SETUP_COMPLETE,
          payload: true,
        });
        break;
    }
  }, [initServerStatus, dispatch]);
};

export const useUpdateLocalStorageOnSetupStateChange = (
  state: NewSetupState
): void => {
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_SETUP_KEY, JSON.stringify(state));
  }, [state]);

  // useEffect(() => {
  //   if (state.progress === SetupProgress.SetupComplete) {
  //     localStorage.removeItem(LOCAL_STORAGE_SETUP_KEY);
  //   }
  // }, [state.progress]);
};

export type HostConfigs = ConfigGenParams & {
  numPeers: number;
};

export type FollowerConfigs = ConfigGenParams & {
  hostServerUrl: string;
};

const isHostConfigs = (
  configs: HostConfigs | FollowerConfigs
): configs is HostConfigs => {
  return 'numPeers' in configs && !('hostServerUrl' in configs);
};

const isFollowerConfigs = (
  configs: HostConfigs | FollowerConfigs
): configs is FollowerConfigs => {
  return 'hostServerUrl' in configs && !('numPeers' in configs);
};

export const useHandleBackgroundGuardianSetupActions = (
  state: SetupState,
  dispatch: Dispatch<SetupAction>
): {
  submitConfiguration: SetupContextValue['submitConfiguration'];
  connectToHost: SetupContextValue['connectToHost'];
  fetchConsensusState: SetupContextValue['fetchConsensusState'];
  toggleConsensusPolling: SetupContextValue['toggleConsensusPolling'];
} => {
  const api = useGuardianApi();
  const { password, myName } = state;
  const [isPollingConsensus, setIsPollingConsensus] = useState(false);

  const fetchConsensusState = useCallback(async () => {
    try {
      const consensusState = await api.getConsensusConfigGenParams();
      dispatch({
        type: SETUP_ACTION_TYPE.SET_OUR_CURRENT_ID,
        payload: consensusState.our_current_id,
      });
      dispatch({
        type: SETUP_ACTION_TYPE.SET_PEERS,
        payload: Object.values(consensusState.consensus.peers),
      });
      dispatch({
        type: SETUP_ACTION_TYPE.SET_CONFIG_GEN_PARAMS,
        payload: consensusState.consensus,
      });
    } catch (error) {
      throw new Error(
        `Failed to fetch consensus state: ${(error as Error).message}`
      );
    }
  }, [api, dispatch]);

  useEffect(() => {
    if (!isPollingConsensus) return;
    let timeout: ReturnType<typeof setTimeout>;
    const pollPeers = () => {
      fetchConsensusState()
        .catch((err) => {
          console.warn('Failed to poll for peers', err);
        })
        .finally(() => {
          timeout = setTimeout(pollPeers, 2000);
        });
    };
    pollPeers();
    return () => clearTimeout(timeout);
  }, [isPollingConsensus, fetchConsensusState]);

  const submitConfiguration: SetupContextValue['submitConfiguration'] =
    useCallback(
      async ({ password: newPassword, myName, configs }) => {
        if (!myName) {
          console.error('myName is required to submit configuration');
          return;
        }

        if (!password) {
          await api.setPassword(newPassword);

          dispatch({
            type: SETUP_ACTION_TYPE.SET_PASSWORD,
            payload: newPassword,
          });
        }

        dispatch({
          type: SETUP_ACTION_TYPE.SET_MY_NAME,
          payload: myName,
        });

        if (isHostConfigs(configs)) {
          dispatch({
            type: SETUP_ACTION_TYPE.SET_NUM_PEERS,
            payload: configs.numPeers,
          });

          await api.setConfigGenConnections(myName);

          await api.setConfigGenParams(configs);
          dispatch({
            type: SETUP_ACTION_TYPE.SET_CONFIG_GEN_PARAMS,
            payload: configs,
          });
        }

        if (isFollowerConfigs(configs)) {
          await api.setConfigGenConnections(myName, configs.hostServerUrl);

          await api.setConfigGenParams(configs);

          await fetchConsensusState();
        }
      },
      [password, api, dispatch, fetchConsensusState]
    );

  const connectToHost = useCallback(
    async (url: string) => {
      await api.setConfigGenConnections(myName, url);
      return await fetchConsensusState();
    },
    [myName, api, fetchConsensusState]
  );

  const toggleConsensusPolling = useCallback((poll: boolean) => {
    setIsPollingConsensus(poll);
  }, []);

  return {
    submitConfiguration,
    connectToHost,
    fetchConsensusState,
    toggleConsensusPolling,
  };
};
