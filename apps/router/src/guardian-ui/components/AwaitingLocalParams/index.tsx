import React, { useState } from 'react';
import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Input,
  Text,
} from '@chakra-ui/react';
import { useTranslation } from '@fedimint/utils';
import {
  useTrimmedInput,
  useGuardianSetupApi,
  useGuardianSetupContext,
  useGuardianState,
  useGuardianDispatch,
} from '../../../hooks';
import {
  GUARDIAN_APP_ACTION_TYPE,
  SETUP_ACTION_TYPE,
} from '../../../types/guardian';

export const AwaitingLocalParams: React.FC = () => {
  const { t } = useTranslation();
  const api = useGuardianSetupApi();
  // const state = useGuardianState();
  const guardianDispatch = useGuardianDispatch();

  const { state, dispatch } = useGuardianSetupContext();

  const handleOnChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = ev.currentTarget;

    dispatch({
      type: SETUP_ACTION_TYPE.SET_DATA,
      payload: { [name]: value },
    });
  };

  const handleOnSubmit = async () => {
    // Set password to make it available until refresh
    api.setPassword(state.password);
    const code = await api.setLocalParams({
      name: state.guardianName,
      federation_name: state.federationName || undefined,
    });

    dispatch({
      type: SETUP_ACTION_TYPE.SET_DATA,
      payload: { code },
    });

    // This will render SharingConnectionCodes
    guardianDispatch({
      type: GUARDIAN_APP_ACTION_TYPE.SET_STATUS,
      payload: 'SharingConnectionCodes',
    });
  };

  return (
    <Center>
      <Box bg='white' padding='5' borderRadius='10' width={500}>
        <Flex gap='5' flexDirection='column'>
          <Heading size='sm'>Get Started</Heading>
          <Text>
            Setting up your federation only takes few minutes. Enter your
            details below:
          </Text>
          <Input
            value={state.guardianName}
            name='guardianName'
            placeholder={t('common.guardian-name')}
            onChange={handleOnChange}
          />
          <Input
            value={state.password}
            name='password'
            type='password'
            placeholder={t('common.password')}
            onChange={handleOnChange}
          />
          <Box>
            <Input
              value={state.federationName}
              name='federationName'
              placeholder={`${t('common.federation-name')} (optional)`}
              onChange={handleOnChange}
            />
            <Text size={'xs'} color={'gray.400'} marginLeft={1} marginTop={1}>
              Only provide a federation name if you are the leader for this
              federation.
            </Text>
          </Box>
          <Button
            borderRadius='8px'
            isDisabled={false}
            onClick={handleOnSubmit}
            isLoading={false}
          >
            {t('common.continue')}
          </Button>
        </Flex>
      </Box>
    </Center>
  );
};
