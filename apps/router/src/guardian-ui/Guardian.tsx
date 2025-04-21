import React, { useMemo } from 'react';
import { Box, Flex, Spinner, Heading, Text, Center } from '@chakra-ui/react';
import { Login } from '@fedimint/ui';
import { SetupContextProvider } from '../context/guardian/SetupContext';
import { AdminContextProvider } from '../context/guardian/AdminContext';
import { FederationSetup } from './setup/FederationSetup';
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
  useLoadGuardian();
  const { t } = useTranslation();

  const content = useMemo(() => {
    if (state.guardianError) {
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
          <Text fontSize='md'>{state.guardianError}</Text>
        </Flex>
      );
    }

    if (state.needsAuth) {
      return (
        <Login
          serviceId={id}
          checkAuth={(password) => api.testPassword(password || '')}
          setAuthenticated={() =>
            dispatch({
              type: GUARDIAN_APP_ACTION_TYPE.SET_NEEDS_AUTH,
              payload: false,
            })
          }
          parseError={formatApiErrorMessage}
        />
      );
    }

    if (state.status === GuardianStatus.Setup && state.initServerStatus) {
      return (
        <SetupContextProvider initServerStatus={state.initServerStatus}>
          <FederationSetup />
        </SetupContextProvider>
      );
    }

    if (state.status === GuardianStatus.Admin) {
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
  }, [
    state.status,
    state.needsAuth,
    state.guardianError,
    state.initServerStatus,
    api,
    dispatch,
    t,
    id,
  ]);

  return (
    <Box width='100%'>
      <Flex justifyContent='space-between' alignItems='center' p={4}>
        {state.version && (
          <Text fontSize='sm' color='gray.500'>
            Connected to Fedimint version: {state.version}
          </Text>
        )}
      </Flex>
      <Center>
        <Box width='100%'>{content}</Box>
      </Center>
    </Box>
  );
};
