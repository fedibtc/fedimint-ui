import React, { useMemo } from 'react';
import { Box, Flex, Spinner, Heading, Text, Center } from '@chakra-ui/react';
import { Login } from '@fedimint/ui';
import { SetupContextProvider } from '../context/guardian/SetupContext';
import { AdminContextProvider } from '../context/guardian/AdminContext';
import { FederationSetup } from './setup/FederationSetup';
import { AwaitingLocalParams } from './components/AwaitingLocalParams';
import { SharingConnectionCodes } from './components/SharingConnectionCodes';
import { FederationAdmin } from './admin/FederationAdmin';
import {
  useGuardianState,
  useGuardianDispatch,
  useLoadGuardian,
  useGuardianApi,
  useGuardianId,
} from '../hooks';
import { useTranslation } from '@fedimint/utils';
import { GUARDIAN_APP_ACTION_TYPE, GuardianStatus } from '../types/guardian';
import { formatApiErrorMessage } from './utils/api';

export const Guardian: React.FC = () => {
  const state = useGuardianState();
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
        <Heading size='lg' marginBottom='4'>
          {t('common.error')}
        </Heading>
        <Text fontSize='md'>Something has gone wrong</Text>
      </Flex>
    );
  }

  if (state.status === 'AwaitingLocalParams') {
    return (
      <SetupContextProvider>
        <AwaitingLocalParams />
      </SetupContextProvider>
    );
  }

  if (state.status === 'SharingConnectionCodes') {
    return (
      <SetupContextProvider>
        <SharingConnectionCodes />
      </SetupContextProvider>
    );
  }

  // Check user is authed
  if (state.status !== undefined && !state.authed) {
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
  if (state.status === 'ConsensusIsRunning') {
    return (
      <AdminContextProvider>
        <FederationAdmin />
      </AdminContextProvider>
    );
  }

  return (
    <Center p={12}>
      <Spinner size='xl' />
    </Center>
  );
};
