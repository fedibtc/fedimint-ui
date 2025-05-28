import React from 'react';
import { Flex, Spinner, Heading, Text, Center } from '@chakra-ui/react';
import { Login } from '@fedimint/ui';
import { SetupContextProvider } from '../context/guardian/SetupContext';
import { AdminContextProvider } from '../context/guardian/AdminContext';
import { AwaitingLocalParams } from './components/AwaitingLocalParams';
import { SharingConnectionCodes } from './components/SharingConnectionCodes';
import { FederationAdmin } from './admin/FederationAdmin';
import {
  useGuardianState,
  useGuardianDispatch,
  useLoadGuardian,
  useGuardianApi,
  useGuardianId,
  useGuardianStatus,
} from '../hooks';
import { useTranslation } from '@fedimint/utils';
import { GUARDIAN_APP_ACTION_TYPE } from '../types/guardian';
import { formatApiErrorMessage } from './utils/api';

export const Guardian: React.FC = () => {
  const state = useGuardianState();
  const status = useGuardianStatus();
  const dispatch = useGuardianDispatch();
  const api = useGuardianApi();
  const id = useGuardianId();
  const { t } = useTranslation();
  useLoadGuardian();

  if (state.error) {
    return (
      <Flex
        direction='column'
        align='center'
        width='100%'
        paddingTop='10vh'
        paddingX='4'
        textAlign='center'
      >
        <Heading size='md' marginBottom='4'>
          {t('common.error')}
        </Heading>
        <Text fontSize='md'>Something has gone wrong</Text>
      </Flex>
    );
  }

  if (status === 'AwaitingLocalParams') {
    return (
      <SetupContextProvider>
        <AwaitingLocalParams />
      </SetupContextProvider>
    );
  }

  if (status === 'SharingConnectionCodes') {
    return (
      <SetupContextProvider>
        <SharingConnectionCodes />
      </SetupContextProvider>
    );
  }

  // Check user is authed
  if (status !== undefined && !state.authed) {
    return (
      <Login
        serviceId={id}
        checkAuth={(password) => api.testPassword(password || '')}
        setAuthenticated={() => {
          dispatch({
            type: GUARDIAN_APP_ACTION_TYPE.SET_AUTHED,
            payload: true,
          });
        }}
        parseError={formatApiErrorMessage}
      />
    );
  }

  // We can now render the admin panel
  if (status === 'ConsensusIsRunning') {
    return (
      <AdminContextProvider>
        <FederationAdmin />
      </AdminContextProvider>
    );
  }

  // Fallback to spinner
  return (
    <Center p={12}>
      <Spinner size='xl' />
    </Center>
  );
};
