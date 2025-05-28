import React from 'react';
import { Button, Flex, Heading, Input, Text } from '@chakra-ui/react';
import { useTranslation } from '@fedimint/utils';
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
    // Set password to make it available until refresh
    api.setPassword(password);
    const code = await api.setLocalParams({
      name: guardianName,
      federation_name: federationName || undefined,
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
