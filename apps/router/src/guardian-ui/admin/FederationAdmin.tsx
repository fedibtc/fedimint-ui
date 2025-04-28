import React, { useCallback, useEffect, useState } from 'react';
import { Box, Flex, Skeleton, Text } from '@chakra-ui/react';
import {
  ClientConfig,
  SignedApiAnnouncement,
  StatusResponse,
} from '@fedimint/types';
import { FederationTabsCard } from '../components/dashboard/tabs/FederationTabsCard';
import { DangerZone } from '../components/dashboard/danger/DangerZone';
import { useGuardianAdminApi } from '../../hooks';
import { InviteCode } from '../components/dashboard/admin/InviteCode';
import { useTranslation } from '@fedimint/utils';
import { useToast } from '@fedimint/ui';
import { formatApiErrorMessage } from '../utils/api';

const findOurPeerId = (
  configPeerIds: number[],
  statusPeerIds: number[]
): number | undefined => {
  return configPeerIds.find((id) => !statusPeerIds.includes(id));
};

export const FederationAdmin: React.FC = () => {
  const { t } = useTranslation();
  const api = useGuardianAdminApi();
  const toast = useToast();
  const [status, setStatus] = useState<StatusResponse>();
  const [inviteCode, setInviteCode] = useState<string>('');
  const [config, setConfig] = useState<ClientConfig>();
  const [signedApiAnnouncements, setSignedApiAnnouncements] = useState<
    Record<string, SignedApiAnnouncement>
  >({});
  const [ourPeer, setOurPeer] = useState<{ id: number; name: string }>();
  const [latestSession, setLatestSession] = useState<number>();

  const fetchData = useCallback(() => {
    api
      .inviteCode()
      .then(setInviteCode)
      .catch((err) => {
        console.error('Failed to fetch invite code:', err);
        // Don't show toast for every fetch error to avoid flooding
      });

    api
      .config()
      .then(setConfig)
      .catch((err) => {
        console.error('Failed to fetch config:', err);
        // Don't show toast for periodic fetch errors
      });

    api
      .apiAnnouncements()
      .then(setSignedApiAnnouncements)
      .catch((err) => {
        console.error('Failed to fetch API announcements:', err);
        // Don't show toast for periodic fetch errors
      });

    api
      .status()
      .then((statusData) => {
        setStatus(statusData);
        setLatestSession(statusData?.federation?.session_count);
      })
      .catch((err) => {
        console.error('Failed to fetch status:', err);
        const errorMessage = formatApiErrorMessage(err);
        // Only show error toast when status fails, as this is critical
        toast.error('Federation Status Error', errorMessage);
      });
  }, [api, toast]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    if (config && status?.federation) {
      const statusPeerIds = Object.keys(status.federation.status_by_peer).map(
        (id) => parseInt(id, 10)
      );
      const configPeerIds = Object.keys(config.global.api_endpoints).map((id) =>
        parseInt(id, 10)
      );

      const ourPeerId = findOurPeerId(configPeerIds, statusPeerIds);
      if (ourPeerId !== undefined) {
        setOurPeer({
          id: ourPeerId,
          name: config.global.api_endpoints[ourPeerId].name,
        });
      }
    }
  }, [config, status, signedApiAnnouncements]);

  return (
    <Flex flexDirection='column' gap='3' width='100%' p='10'>
      {config ? (
        <Flex
          alignItems={{ md: 'center' }}
          flexDirection={{ base: 'column', md: 'row' }}
          justifyContent='space-between'
          gap='1'
          mb='2'
        >
          <Flex flexDirection='column' gap='1' mb={{ base: 1, md: 0 }} flex='3'>
            <Flex alignItems='center'>
              <Text
                fontSize='sm'
                color='gray.500'
                textTransform='uppercase'
                letterSpacing='wide'
                width='150px'
              >
                {t('common.federation-name')}
              </Text>
              <Text fontSize='md' color='gray.700' fontWeight='semibold'>
                {config?.global.meta.federation_name}
              </Text>
            </Flex>
            <Flex alignItems='center'>
              <Text
                fontSize='sm'
                color='gray.500'
                textTransform='uppercase'
                letterSpacing='wide'
                width='150px'
              >
                {t('common.guardian-name')}
              </Text>
              <Text fontSize='md' color='gray.700' fontWeight='semibold'>
                {ourPeer?.name}
              </Text>
            </Flex>
          </Flex>

          <Box flex='2'>
            <InviteCode inviteCode={inviteCode} />
          </Box>
        </Flex>
      ) : (
        <Skeleton height='120px' width='100%' />
      )}
      {ourPeer && (
        <FederationTabsCard
          config={config}
          ourPeer={ourPeer}
          signedApiAnnouncements={signedApiAnnouncements}
          latestSession={latestSession}
          status={status}
        />
      )}
      <DangerZone
        inviteCode={inviteCode}
        ourPeer={ourPeer}
        latestSession={latestSession}
        signedApiAnnouncements={signedApiAnnouncements}
      />
    </Flex>
  );
};
