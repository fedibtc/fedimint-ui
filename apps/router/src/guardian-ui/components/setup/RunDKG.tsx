import React, { useEffect, useMemo, useState } from 'react';
import {
  CircularProgress,
  CircularProgressLabel,
  Heading,
  Text,
  Flex,
} from '@chakra-ui/react';
import { GuardianServerStatus } from '@fedimint/types';
import { useTranslation } from '@fedimint/utils';
import { useEllipsis } from '../../hooks';
import { formatApiErrorMessage } from '../../utils/api';
import {
  useConsensusPolling,
  useGuardianSetupApi,
  useGuardianSetupContext,
} from '../../../hooks';
import { useTheme } from '@fedimint/ui';
interface Props {
  next(): void;
}

export const RunDKG: React.FC<Props> = ({ next }) => {
  const { t } = useTranslation();
  const api = useGuardianSetupApi();
  const {
    state: { peers },
  } = useGuardianSetupContext();
  const theme = useTheme();
  const [isWaitingForOthers, setIsWaitingForOthers] = useState(false);
  const [error, setError] = useState<string>();
  const ellipsis = useEllipsis();

  // Poll for peers and configGenParams while on this page.
  useConsensusPolling();

  // Keep trying to run DKG until it's finished, or we get an unexpected error.
  // 'Cancel' the effect on re-run to prevent calling `runDkg` multiple times.
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let canceled = false;
    const pollDkg = async () => {
      try {
        const status = await api.status();
        if (canceled) return;
        switch (status.server) {
          case GuardianServerStatus.SharingConfigGenParams:
            await api.runDkg().catch((err) => {
              // If we timed out, np just try again
              if (err.code === -32002) return;
              throw err;
            });
            break;
          case GuardianServerStatus.ReadyForConfigGen:
            setIsWaitingForOthers(true);
            break;
          case GuardianServerStatus.VerifyingConfigs:
            next();
            break;
          case GuardianServerStatus.ConfigGenFailed:
            setError(`${t('run-dkg.error-config')}`);
            break;
          default:
            setError(`${t('run-dkg.error-default')} '${status.server}'`);
        }
      } catch (err) {
        setError(formatApiErrorMessage(err));
      }
      timeout = setTimeout(pollDkg, 3000);
    };
    pollDkg();

    return () => {
      clearTimeout(timeout);
      canceled = true;
    };
  }, [next, api, t]);

  const progress = useMemo(() => {
    if (!peers.length) return 0;
    const peersWaiting = peers.filter(
      (p) => p.status === GuardianServerStatus.ReadyForConfigGen
    );
    return Math.round((peersWaiting.length / peers.length) * 100);
  }, [peers]);

  return (
    <Flex direction='column' gap={10} justify='center' align='center'>
      <CircularProgress
        isIndeterminate={!isWaitingForOthers}
        value={isWaitingForOthers ? progress : undefined}
        color={theme.colors.blue[400]}
        size='200px'
      >
        {isWaitingForOthers && (
          <CircularProgressLabel textStyle='sm'>
            {progress}%
          </CircularProgressLabel>
        )}
      </CircularProgress>
      {error ? (
        <>
          <Heading size='sm' color={theme.colors.red[500]}>
            {t('run-dkg.error-header')}
          </Heading>
          <Text>{error}</Text>
        </>
      ) : (
        <Heading size='sm'>
          {(isWaitingForOthers
            ? t('run-dkg.waiting-header')
            : t('run-dkg.generating-header')) + ellipsis}
        </Heading>
      )}
    </Flex>
  );
};
