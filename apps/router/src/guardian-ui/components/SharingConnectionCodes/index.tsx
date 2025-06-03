import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Code,
  Divider,
  Input,
  Link,
  Heading,
  Text,
  useClipboard,
} from '@chakra-ui/react';
import { useTranslation } from '@fedimint/utils';
import {
  useGuardianSetupApi,
  useGuardianSetupContext,
  useGuardianConfig,
  useTrimmedInput,
} from '../../../hooks';
import { SETUP_ACTION_TYPE } from '../../../types/guardian';
import { LOCAL_STORAGE_SETUP_KEY } from '../../../context/guardian/SetupContext';
import { GuardianApi } from '../../../api/GuardianApi';
import { CenterBox } from '../CenterBox';
import { Spinner } from '@chakra-ui/react';

const truncateCode = (code: string, length = 20) =>
  `${code?.substring(0, length)}...${code?.substring(code.length - length)}`;

export const SharingConnectionCodes: React.FC = () => {
  const { t } = useTranslation();
  const api = useGuardianSetupApi();
  const { state, dispatch } = useGuardianSetupContext();
  const config = useGuardianConfig();

  const { code, peers, password, guardianName, isLeader, error } = state;

  const [consensusRunning, setConsensusRunning] = useState<boolean>(false);
  const [guardianCode, setGuardianCode] = useTrimmedInput('');
  const { onCopy, hasCopied } = useClipboard(code || '');

  const POLL_RATE = 3000; // check every 3 seconds

  useEffect(() => {
    (async () => {
      api.setPassword(password);
      await api.resetPeerSetupCodes();
    })();
  }, [api, password]);

  // During consensus on 0.7 the api switches off and doesn't come online again until dkg has finished!
  // Nice to have - own hook to handle this
  useEffect(() => {
    if (!consensusRunning) return;

    const intervalId = setInterval(async () => {
      const api = new GuardianApi(config); // seems to require a new instance
      await api.connect();
      const connected = await api.testPassword(password);

      if (connected) {
        localStorage.removeItem(LOCAL_STORAGE_SETUP_KEY);
        window.location.reload();
      }
    }, POLL_RATE);

    return () => clearInterval(intervalId);
  }, [config, consensusRunning, password]);

  const handleOnSubmit = async () => {
    try {
      await api.startDkg();

      setConsensusRunning(true);
    } catch (err) {
      console.log(err);
    }
  };

  const handleAddPeer = async () => {
    try {
      if (guardianCode.trim().length === 0) return;

      // Check code doesn't already exist in peers
      const match = peers.find((peer) => peer.code === guardianCode);
      if (match) {
        throw Error();
      }

      const guardianName = await api.addPeerSetupCode(guardianCode);

      const peer = {
        name: guardianName,
        code: guardianCode,
      };

      dispatch({
        type: SETUP_ACTION_TYPE.ADD_PEER,
        payload: peer,
      });

      setGuardianCode('');
    } catch (err: unknown) {
      dispatch({
        type: SETUP_ACTION_TYPE.SET_ERROR,
        payload: t('setup.step2.error-invalid-code'),
      });
    }
  };

  const handleOnResetCodes = async () => {
    try {
      await api.resetPeerSetupCodes();

      dispatch({
        type: SETUP_ACTION_TYPE.RESET_PEERS,
      });
    } catch {
      // empty catch
    }
  };

  // code no longer in localstorage - may have been deleted
  if (!code) {
    return (
      <CenterBox heading={t('setup.step2.error-title')}>
        <>
          <Text>{t('setup.step2.error-desc')}</Text>
          <Link href='/' color='blue.600'>
            Back to homepage
          </Link>
        </>
      </CenterBox>
    );
  }

  if (consensusRunning) {
    return (
      <CenterBox heading={t('setup.step2.consensus-title')}>
        <>
          <Text>{t('setup.step2.consensus-desc')}</Text>
          <Spinner size='md' />
        </>
      </CenterBox>
    );
  }

  return (
    <CenterBox heading={guardianName}>
      <>
        <Text>{t('setup.step2.desc')}</Text>

        <Box textAlign='center' overflow='auto' wordBreak={'break-word'}>
          <Code
            padding={2}
            borderRadius={5}
            textAlign='left'
            cursor='pointer'
            onClick={onCopy}
            marginBottom={2}
            userSelect='none'
          >
            {truncateCode(code, 150)}
          </Code>
          <Text size='xs' color='gray.400'>
            {hasCopied ? t('common.copied') : t('setup.step2.copy-text')}
          </Text>
        </Box>

        <Divider></Divider>
        <Box>
          <Heading size='xs'>{t('setup.step2.add-title')}</Heading>
          <Text>{t('setup.step2.add-desc')}</Text>
        </Box>

        {peers.map((guardian: Record<string, string>, idx: number) => (
          <Box key={`${code}-${idx}`}>
            <Text fontWeight={'bold'}>{guardian.name}</Text>
            <Code padding={2} borderRadius={5} width='100%'>
              {truncateCode(guardian.code)}
            </Code>
          </Box>
        ))}

        {error && (
          <Text size='sm' color='red'>
            {error}
          </Text>
        )}
        <Input
          value={guardianCode}
          name='code'
          type='text'
          placeholder={t('setup.step2.add-placeholder')}
          onChange={(ev) => setGuardianCode(ev.currentTarget.value)}
        />
        <Button
          variant={'outline'}
          borderRadius='8px'
          isDisabled={false}
          onClick={handleAddPeer}
        >
          {t('setup.step2.add-button-label')}
        </Button>

        <Divider />

        <Button
          borderRadius='8px'
          // 1 or 2 peers is invalid.
          isDisabled={
            consensusRunning ||
            peers.length === 1 ||
            peers.length === 2 ||
            (peers.length === 0 && !isLeader)
          }
          onClick={handleOnSubmit}
        >
          {isLeader
            ? t('setup.step2.launch-button-label')
            : t('setup.step2.run-button-label')}
        </Button>

        <Divider />

        <Box>
          <Heading size='xs'>{t('setup.step2.reset-title')}</Heading>
          <Text>{t('setup.step2.reset-desc')}</Text>
        </Box>

        <Button
          bg='red'
          colorScheme='red'
          _hover={{ bg: 'red.500' }}
          onClick={handleOnResetCodes}
          isDisabled={peers.length === 0}
        >
          {t('setup.step2.reset-button-label')}
        </Button>
      </>
    </CenterBox>
  );
};
