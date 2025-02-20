import React, { useCallback, useState } from 'react';
import { Box, Button, Text, Heading, Icon, Flex } from '@chakra-ui/react';
import { useTranslation } from '@fedimint/utils';
import {
  GuardianRole,
  SetupProgress,
  SETUP_ACTION_TYPE,
  tosConfigState,
} from '../../types/guardian';
import { RoleSelector } from '../components/setup/screens/roleSelector/RoleSelector';
import { SetConfiguration } from '../components/setup/screens/setConfiguration/SetConfiguration';
import { ConnectGuardians } from '../components/setup/screens/connectGuardians/ConnectGuardians';
import { RunDKG } from '../components/setup/RunDKG';
import { VerifyGuardians } from '../components/setup/screens/verifyGuardians/VerifyGuardians';
import { SetupComplete } from '../components/setup/screens/setupComplete/SetupComplete';
import { SetupProgress as SetupStepper } from '../components/setup/SetupProgress';
import { TermsOfService } from '../components/TermsOfService';
import ArrowLeftIcon from '../assets/svgs/arrow-left.svg?react';
import CancelIcon from '../assets/svgs/x-circle.svg?react';
import { GuardianServerStatus } from '@fedimint/types';
import { RestartModals } from './RestartModals';
import { useGuardianSetupApi, useGuardianSetupContext } from '../../hooks';

const PROGRESS_ORDER: SetupProgress[] = [
  SetupProgress.Start,
  SetupProgress.SetConfiguration,
  SetupProgress.ConnectGuardians,
  SetupProgress.RunDKG,
  SetupProgress.VerifyGuardians,
  SetupProgress.SetupComplete,
];

export const FederationSetup: React.FC = () => {
  const { t } = useTranslation();
  const api = useGuardianSetupApi();
  const {
    state: { progress, role, peers, tosConfig },
    dispatch,
  } = useGuardianSetupContext();
  const [confirmRestart, setConfirmRestart] = useState(false);

  const setTosConfig = useCallback(
    (payload: tosConfigState) => {
      dispatch({ type: SETUP_ACTION_TYPE.SET_TOS_CONFIG, payload });
    },
    [dispatch]
  );

  const isHost = role === GuardianRole.Host;
  const isSolo = role === GuardianRole.Solo;
  const progressIdx = PROGRESS_ORDER.indexOf(progress);
  const prevProgress: SetupProgress | undefined =
    PROGRESS_ORDER[progressIdx - 1];
  const nextProgress: SetupProgress | undefined =
    PROGRESS_ORDER[progressIdx + 1];

  const handleBack = useCallback(() => {
    if (!prevProgress) return;
    dispatch({ type: SETUP_ACTION_TYPE.SET_PROGRESS, payload: prevProgress });
    window.scrollTo(0, 0);
  }, [dispatch, prevProgress]);

  const handleNext = useCallback(() => {
    if (!nextProgress) return;
    dispatch({ type: SETUP_ACTION_TYPE.SET_PROGRESS, payload: nextProgress });
    window.scrollTo(0, 0);
  }, [dispatch, nextProgress]);

  const handleRestart = useCallback(() => {
    api
      .restartSetup()
      .then(() => {
        dispatch({ type: SETUP_ACTION_TYPE.SET_INITIAL_STATE, payload: null });
        window.scrollTo(0, 0);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [api, dispatch]);

  let title: React.ReactNode;
  let subtitle: React.ReactNode;
  let canGoBack = false;
  let canRestart = false;
  let content: React.ReactNode;

  switch (progress) {
    case SetupProgress.Start:
      if (tosConfig?.showTos) {
        title = t('setup.progress.tos.title');
        content = (
          <TermsOfService
            next={() => setTosConfig({ showTos: false, tos: tosConfig.tos })}
            tos={tosConfig.tos}
          />
        );
      } else {
        title = t('setup.progress.start.title');
        subtitle = t('setup.progress.start.subtitle');
        content = <RoleSelector next={handleNext} />;
      }
      break;
    case SetupProgress.SetConfiguration:
      title = isSolo
        ? t('setup.progress.set-config.title-solo')
        : t('setup.progress.set-config.title');
      subtitle = isHost
        ? t('setup.progress.set-config.subtitle-leader')
        : isSolo
        ? t('setup.progress.set-config.subtitle-solo')
        : t('setup.progress.set-config.subtitle-follower');
      content = <SetConfiguration next={handleNext} />;
      canGoBack = true;
      break;
    case SetupProgress.ConnectGuardians:
      title = isHost
        ? t('setup.progress.connect-guardians.title-leader')
        : t('setup.progress.connect-guardians.title-follower');
      subtitle = isHost
        ? t('setup.progress.connect-guardians.subtitle-leader')
        : t('setup.progress.connect-guardians.subtitle-follower');
      content = <ConnectGuardians next={handleNext} />;
      canGoBack = false;
      canRestart = true;
      break;
    case SetupProgress.RunDKG:
      title = t('setup.progress.run-dkg.title');
      subtitle = t('setup.progress.run-dkg.subtitle');
      content = <RunDKG next={handleNext} />;
      canRestart = true;
      break;
    case SetupProgress.VerifyGuardians:
      title = t('setup.progress.verify-guardians.title');
      subtitle = t('setup.progress.verify-guardians.subtitle');
      content = <VerifyGuardians next={handleNext} />;
      canRestart = true;
      break;
    case SetupProgress.SetupComplete:
      content = <SetupComplete role={role ?? GuardianRole.Follower} />;
      break;
    default:
      title = t('setup.progress.error.title');
      subtitle = t('setup.progress.error.subtitle');
  }

  const isPeerRestarted =
    canRestart &&
    peers &&
    peers.some((peer) => peer.status === GuardianServerStatus.SetupRestarted);

  return (
    <Flex
      direction='column'
      gap={[2, 10]}
      align={progressIdx === 0 ? 'start' : 'center'}
    >
      {progressIdx === 0 || !progressIdx ? null : (
        <SetupStepper setupProgress={progressIdx} isHost={isHost} />
      )}
      <Flex
        width={
          progress === SetupProgress.SetConfiguration
            ? ['100%', '90%', '70%']
            : ['100%', '90%']
        }
        direction='column'
        gap={[2, 10]}
        align='start'
      >
        <Flex
          width='100%'
          direction='row'
          justify='space-between'
          align='center'
        >
          {prevProgress && canGoBack && (
            <Button
              variant='link'
              onClick={handleBack}
              leftIcon={<Icon as={ArrowLeftIcon} />}
            >
              {t('common.back')}
            </Button>
          )}
          {canRestart && isHost && (
            <Button
              variant='link'
              colorScheme='red'
              onClick={() => setConfirmRestart(true)}
              rightIcon={<Icon as={CancelIcon} />}
            >
              {t('setup.common.restart-setup')}
            </Button>
          )}
        </Flex>
        {title && (
          <Heading size={['sm', 'md']} fontWeight='medium'>
            {title}
          </Heading>
        )}
        {subtitle && (
          <Text size={['sm', 'md']} fontWeight='medium'>
            {subtitle}
          </Text>
        )}
      </Flex>
      <Box
        width={['100%', '90%']}
        justifyItems={
          (progress === SetupProgress.Start ||
            progress === SetupProgress.VerifyGuardians) &&
          !tosConfig?.showTos
            ? 'left'
            : 'center'
        }
      >
        {content}
      </Box>
      <RestartModals
        isPeerRestarted={isPeerRestarted}
        handleRestart={handleRestart}
        setConfirmRestart={setConfirmRestart}
        confirmRestart={confirmRestart}
      />
    </Flex>
  );
};
