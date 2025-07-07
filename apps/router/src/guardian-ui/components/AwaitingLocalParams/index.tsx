import React from 'react';
import { Button, Flex, Input, Text } from '@chakra-ui/react';
import { useTranslation } from '@fedimint/utils';
import { useToast } from '@fedimint/ui';
import { LOCAL_STORAGE_SETUP_KEY } from '../../../context/guardian/SetupContext';
import {
  useGuardianSetupApi,
  useGuardianSetupContext,
  useGuardianDispatch,
} from '../../../hooks';
import {
  GUARDIAN_APP_ACTION_TYPE,
  SETUP_ACTION_TYPE,
} from '../../../types/guardian';
import { CenterBox } from '../CenterBox';

const MIN_PASSWORD_LENGTH = 6;

export const AwaitingLocalParams: React.FC = () => {
  const { t } = useTranslation();
  const api = useGuardianSetupApi();
  const guardianDispatch = useGuardianDispatch();
  const toast = useToast();

  const { state, dispatch } = useGuardianSetupContext();
  const { federationName, guardianName, password } = state;

  const handleOnChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = ev.currentTarget;

    dispatch({
      type: SETUP_ACTION_TYPE.SET_DATA,
      payload: { [name]: value },
    });
  };

  const handleOnSubmit = async () => {
    try {
      // Initialize password
      api.setPassword(password);

      const isLeader = federationName.trim().length > 0;

      const code = await api.setLocalParams({
        name: guardianName,
        federation_name: isLeader ? federationName.trim() : undefined,
      });

      localStorage.setItem(
        LOCAL_STORAGE_SETUP_KEY,
        JSON.stringify({
          code,
          isLeader,
          federationName: federationName.trim(),
          guardianName,
          password,
        })
      );

      dispatch({
        type: SETUP_ACTION_TYPE.SET_DATA,
        payload: { code, isLeader },
      });

      toast.success(t('setup-complete.congratulations'), t('setup.step1.desc'));

      // This will render SharingConnectionCodes
      guardianDispatch({
        type: GUARDIAN_APP_ACTION_TYPE.SET_STATUS,
        payload: 'SharingConnectionCodes',
      });
    } catch (error) {
      toast.error(
        t('setup.step1.error-title'),
        t('setup.step1.error-description')
      );
    }
  };

  return (
    <CenterBox heading={t('setup.step1.title')}>
      <Flex gap='5' flexDirection='column'>
        <Text>{t('setup.step1.desc')}</Text>
        <Input
          value={guardianName}
          name='guardianName'
          placeholder={t('common.guardian-name')}
          onChange={handleOnChange}
        />
        <Input
          value={password}
          name='password'
          type='password'
          placeholder={t('common.password')}
          onChange={handleOnChange}
          autoComplete='off'
        />

        <Input
          value={federationName}
          name='federationName'
          placeholder={`${t('common.federation-name')} (${t(
            'setup.step1.placeholder-label'
          )})`}
          onChange={handleOnChange}
        />

        <Button
          borderRadius='8px'
          isDisabled={
            guardianName.trim().length === 0 ||
            password.trim().length < MIN_PASSWORD_LENGTH
          }
          onClick={handleOnSubmit}
          isLoading={false}
        >
          {t('common.continue')}
        </Button>
      </Flex>
    </CenterBox>
  );
};
