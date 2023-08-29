import React, { useEffect, useState, useMemo } from 'react';
import {
  Flex,
  Card,
  CardBody,
  CardHeader,
  Table,
  Tbody,
  Tr,
  Td,
  Thead,
  Th,
  Box,
  Icon,
  Text,
} from '@chakra-ui/react';
import { CopyInput } from '@fedimint/ui';
import { useTranslation } from '@fedimint/utils';
import { useAdminContext } from '../hooks';
import {
  ClientConfig,
  ConfigResponse,
  FederationStatus,
  Gateway,
  PeerStatus,
  StatusResponse,
  Versions,
} from '../types';
import { AdminMain } from '../components/AdminMain';
import { ConnectedNodes } from '../components/ConnectedNodes';
import { LightningModuleRpc } from '../GuardianApi';
import { ReactComponent as CopyIcon } from '../assets/svgs/copy.svg';
import { Pill } from '../components/Pill';

interface PeerData {
  id: number;
  name: string;
  status: PeerStatus;
}

function generatePeerData(
  config: ClientConfig,
  federationStatus: FederationStatus
): PeerData[] {
  const peerDataArray: PeerData[] = [];
  for (const [id, status] of Object.entries(federationStatus.status_by_peer)) {
    const numericId = parseInt(id, 10);
    if (Object.prototype.hasOwnProperty.call(config.api_endpoints, numericId)) {
      const endpoint = config.api_endpoints[numericId];
      if (endpoint) {
        peerDataArray.push({
          id: numericId,
          name: endpoint.name,
          status,
        });
      }
    }
  }
  return peerDataArray;
}

export const FederationAdmin: React.FC = () => {
  const { api } = useAdminContext();
  const [versions, setVersions] = useState<Versions>();
  const [epochCount, setEpochCount] = useState<number>();
  const [status, setStatus] = useState<StatusResponse>();
  const [inviteCode, setInviteCode] = useState<string>('');
  const [config, setConfig] = useState<ConfigResponse>();
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [peerData, setPeerData] = useState<PeerData[] | undefined>();
  const { t } = useTranslation();

  useEffect(() => {
    api.version().then(setVersions).catch(console.error);
    api.fetchEpochCount().then(setEpochCount).catch(console.error);
    // TODO: poll server status
    api.status().then(setStatus).catch(console.error);
    api.inviteCode().then(setInviteCode).catch(console.error);
  }, [api]);

  useEffect(() => {
    inviteCode && api.config(inviteCode).then(setConfig).catch(console.error);
  }, [inviteCode, api]);

  useEffect(() => {
    if (config) {
      for (const [key, val] of Object.entries(config.client_config.modules)) {
        if (val.kind === 'ln') {
          api
            .moduleApiCall<Gateway[]>(
              Number(key),
              LightningModuleRpc.listGateways
            )
            .then(setGateways)
            .catch(console.error);
          return;
        }
      }
    }
  }, [config, api]);

  const [guardiansStatusText, statusColor] = useMemo(() => {
    const online = status?.federation ? status.federation.peers_online + 1 : 1;
    const offline = status?.federation ? status.federation.peers_offline : 0;
    const totalPeers = online + offline;
    const onlinePercentage = online / totalPeers;
    const statusColor: 'green' | 'yellow' | 'red' =
      onlinePercentage === 1
        ? 'green'
        : onlinePercentage >= 2 / 3
        ? 'yellow'
        : 'red';
    const guardiansStatusText = `${online} / ${totalPeers}`;
    return [guardiansStatusText, statusColor];
  }, [status]);

  useEffect(() => {
    if (status && status.federation && config) {
      const data = generatePeerData(config.client_config, status.federation);
      setPeerData(data);
    }
  }, [status, config]);

  const apiVersion = versions?.core.api.length
    ? `${versions.core.api[0].major}.${versions.core.api[0].minor}`
    : '';
  const consensusVersion =
    versions?.core.core_consensus !== undefined
      ? `${versions.core.core_consensus}`
      : '';

  return (
    <Flex gap='32px' flexDirection='row'>
      <Flex gap={4} flexDirection='column' w='100%'>
        <Flex>
          <Box>
            <Text
              color='#111827'
              fontSize='24px'
              fontWeight='600'
              lineHeight='32px'
              textTransform='capitalize'
            >
              {config?.client_config.meta.federation_name}
            </Text>
            <Text color='#111827' fontSize='14px' lineHeight='32px'>
              {t('federation-dashboard.placeholder-fed-description')}
            </Text>
            <Flex gap='12px' mt='13px'>
              <Pill
                text='Guardians'
                status={`${guardiansStatusText}`}
                color={statusColor}
              />
              <Pill text='Server' status='Healthy' color='green' />
              <Pill text='Uptime' status='100%' color='green' />
            </Flex>
            <Box mt='38px'>
              <Text mb='6px' fontSize='14px' fontWeight='500' color='#344054'>
                {t('federation-dashboard.invite-members')}
              </Text>
              <CopyInput
                value={inviteCode}
                buttonLeftIcon={<Icon as={CopyIcon} />}
              />
              <Text mt='6px' mb='25px' fontSize='14px' color='#6B7280'>
                {t('federation-dashboard.invite-members-prompt')}
              </Text>
            </Box>
          </Box>
        </Flex>
        <AdminMain />
        <Flex gap={4}>
          <Card flex='1'>
            <CardHeader>{t('federation-dashboard.fed-info.label')}</CardHeader>
            <CardBody>
              <Table>
                <Tbody>
                  <Tr>
                    <Td>
                      {t('federation-dashboard.fed-info.your-status-label')}
                    </Td>
                    <Td>{status?.server}</Td>
                  </Tr>
                  <Tr>
                    <Td>
                      {t('federation-dashboard.fed-info.epoch-count-label')}
                    </Td>
                    <Td>{epochCount}</Td>
                  </Tr>
                  <Tr>
                    <Td>
                      {t('federation-dashboard.fed-info.api-version-label')}
                    </Td>
                    <Td>{apiVersion}</Td>
                  </Tr>
                  <Tr>
                    <Td>
                      {t(
                        'federation-dashboard.fed-info.consensus-version-label'
                      )}
                    </Td>
                    <Td>{consensusVersion}</Td>
                  </Tr>
                </Tbody>
              </Table>
            </CardBody>
          </Card>
          <Card flex='1'>
            <CardHeader>{t('federation-dashboard.peer-info.label')}</CardHeader>
            <CardBody>
              <Table>
                <Thead>
                  <Tr>
                    <Th>{t('federation-dashboard.peer-info.id-label')}</Th>
                    <Th>{t('federation-dashboard.peer-info.name-label')}</Th>
                    <Th>{t('federation-dashboard.peer-info.status-label')}</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {peerData &&
                    peerData?.map((x) => (
                      <Tr key={x.id}>
                        <Td>{x.id}</Td>
                        <Td>{x.name}</Td>
                        <Td>{x.status.connection_status}</Td>
                      </Tr>
                    ))}
                </Tbody>
              </Table>
            </CardBody>
          </Card>
        </Flex>
        <ConnectedNodes gateways={gateways} />
      </Flex>
    </Flex>
  );
};
