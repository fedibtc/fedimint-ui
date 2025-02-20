import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Icon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  Flex,
} from '@chakra-ui/react';
import { RadioButtonGroup, RadioButtonOption } from '@fedimint/ui';
import ArrowRightIcon from '../../../../assets/svgs/arrow-right.svg?react';
import CheckIcon from '../../../../assets/svgs/check.svg?react';
import StarsIcon from '../../../../assets/svgs/stars.svg?react';
import IntersectSquareIcon from '../../../../assets/svgs/intersect-square.svg?react';
import WarningIcon from '../../../../assets/svgs/warning.svg?react';
import SoloIcon from '../../../../assets/svgs/solo.svg?react';
import { useTranslation } from '@fedimint/utils';
import { WarningModal } from './WarningModal';
import { BitcoinRpcConnectionStatus } from '@fedimint/types';
import { useGuardianApi, useGuardianSetupContext } from '../../../../../hooks';
import { GuardianRole, SETUP_ACTION_TYPE } from '../../../../../types/guardian';

interface Props {
  next: () => void;
}

export const RoleSelector = React.memo<Props>(function RoleSelector({
  next,
}: Props) {
  const { t } = useTranslation();
  const api = useGuardianApi();
  const { dispatch } = useGuardianSetupContext();
  const [role, setRole] = useState<GuardianRole>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bitcoinStatus, setBitcoinStatus] =
    useState<BitcoinRpcConnectionStatus>();

  useEffect(() => {
    const fetchBitcoinStatus = async () => {
      try {
        const status = await api.checkBitcoinStatus();
        setBitcoinStatus(status);
      } catch (error) {
        console.error('Failed to fetch Bitcoin status:', error);
      }
    };

    fetchBitcoinStatus();
  }, [api]);

  // If role in query params, set it
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const role = urlParams.get('role')?.toLowerCase();
    if (role) {
      switch (role) {
        case 'host':
          setRole(GuardianRole.Host);
          break;
        case 'follower':
          setRole(GuardianRole.Follower);
          break;
        case 'solo':
          setRole(GuardianRole.Solo);
          break;
      }
    }
  }, []);

  const options: RadioButtonOption<GuardianRole>[] = useMemo(
    () => [
      {
        value: GuardianRole.Host,
        label: t('role-selector.leader.label'),
        description: t('role-selector.leader.description'),
        icon: StarsIcon,
      },
      {
        value: GuardianRole.Follower,
        label: t('role-selector.follower.label'),
        description: t('role-selector.follower.description'),
        icon: IntersectSquareIcon,
      },
      {
        value: GuardianRole.Solo,
        label: t('role-selector.solo.label'),
        description: t('role-selector.solo.description'),
        icon: SoloIcon,
      },
    ],
    [t]
  );

  const handleConfirm = useCallback(() => {
    if (!role) return;
    dispatch({ type: SETUP_ACTION_TYPE.SET_ROLE, payload: role });
    next();
  }, [role, dispatch, next]);

  return (
    <Flex direction='column' gap={8} align='left' justify='left' maxWidth={660}>
      <RadioButtonGroup
        options={options}
        value={role}
        onChange={(value) => setRole(value)}
        activeIcon={CheckIcon}
      />
      <Alert status='warning'>
        {bitcoinStatus === undefined ? (
          // Error state
          <>
            <AlertIcon />
            <Box>
              <AlertTitle>{t('role-selector.bitcoin-node.error')}</AlertTitle>
            </Box>
          </>
        ) : bitcoinStatus !== 'Synced' ? (
          // Not synced state
          <>
            <AlertIcon />
            <Box>
              <AlertTitle>
                {t('role-selector.bitcoin-node.not-synced')}
              </AlertTitle>
              <AlertDescription>
                {t('role-selector.bitcoin-node.not-synced-description', {
                  progress: bitcoinStatus,
                })}
              </AlertDescription>
            </Box>
          </>
        ) : (
          // Default warning
          <>
            <AlertIcon>
              <WarningIcon />
            </AlertIcon>
            <Box>
              <AlertTitle>{t('role-selector.disclaimer-title')}</AlertTitle>
              <AlertDescription>
                {t('role-selector.disclaimer-text')}
              </AlertDescription>
            </Box>
          </>
        )}
      </Alert>
      <div>
        <Button
          width={['100%', 'auto']}
          leftIcon={<Icon as={ArrowRightIcon} />}
          isDisabled={
            !role || (bitcoinStatus !== undefined && bitcoinStatus !== 'Synced')
          }
          onClick={() => {
            role === GuardianRole.Solo ? handleConfirm() : setIsModalOpen(true);
          }}
        >
          {t('common.next')}
        </Button>
      </div>
      <WarningModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
      />
    </Flex>
  );
});
