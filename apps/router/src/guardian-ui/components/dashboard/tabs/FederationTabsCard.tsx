import React, { useCallback, useEffect, useState } from 'react';
import {
  Card,
  Flex,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  Divider,
} from '@chakra-ui/react';
import { githubLight } from '@uiw/codemirror-theme-github';
import { json } from '@codemirror/lang-json';
import CodeMirror from '@uiw/react-codemirror';
import {
  ClientConfig,
  ConsensusMeta,
  MetaFields,
  MetaSubmissions,
  ModuleKind,
  ParsedConsensusMeta,
  SignedApiAnnouncement,
  StatusResponse,
} from '@fedimint/types';
import { useTranslation, hexToMeta } from '@fedimint/utils';
import { MetaManager } from './meta/manager/MetaManager';
import { ApiAnnouncements } from './ApiAnnouncements';
import { ProposedMetas } from './meta/proposals/ProposedMetas';
import { ModuleRpc } from '../../../../types/guardian';
import { useGuardianAdminApi } from '../../../../hooks';
import { BalanceSheet } from './balanceSheet/BalanceSheet';
import { FederationInfo } from './info/FederationInfo';
import { FederationStatus } from './status/FederationStatus';

export const DEFAULT_META_KEY = 0;
export const POLL_TIMEOUT_MS = 2000;

type MetaSubmissionMap = {
  [key: string]: {
    peers: number[];
    meta: MetaFields;
  };
};

interface FederationTabsCardProps {
  config: ClientConfig | undefined;
  ourPeer: { id: number; name: string };
  signedApiAnnouncements: Record<string, SignedApiAnnouncement>;
  latestSession: number | undefined;
  status: StatusResponse | undefined;
}

export const FederationTabsCard: React.FC<FederationTabsCardProps> = ({
  config,
  ourPeer,
  signedApiAnnouncements,
  latestSession,
  status,
}) => {
  const { t } = useTranslation();
  const [metaModuleId, setMetaModuleId] = useState<string | undefined>(
    undefined
  );
  const [consensusMeta, setConsensusMeta] = useState<ParsedConsensusMeta>();
  const [peers, setPeers] = useState<{ id: number; name: string }[]>([]);
  const [metaSubmissions, setMetaSubmissions] = useState<MetaSubmissionMap>({});
  const pendingProposalsCount = Object.keys(metaSubmissions).length;
  const [hasVoted, setHasVoted] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const api = useGuardianAdminApi();

  const pollMetaSubmissions = useCallback(async () => {
    if (!metaModuleId) return;

    try {
      const submissions = await api.moduleApiCall<MetaSubmissions>(
        Number(metaModuleId),
        ModuleRpc.getSubmissions,
        DEFAULT_META_KEY
      );

      const metas: MetaSubmissionMap = {};
      let voted = false;

      Object.entries(submissions).forEach(([peer, hexString]) => {
        if (hexString === '7b7d') return; // Filter out empty submissions
        const metaObject = hexToMeta(hexString);
        const meta = Object.entries(metaObject).filter(
          ([, value]) => value !== undefined && value !== ''
        ) as [string, string][];

        const metaKey = JSON.stringify(meta); // Use JSON string as a key to group identical metas

        if (metas[metaKey]) {
          metas[metaKey].peers.push(Number(peer));
        } else {
          metas[metaKey] = {
            peers: [Number(peer)],
            meta: meta as MetaFields,
          };
        }

        if (Number(peer) === ourPeer.id) {
          voted = true;
        }
      });

      setMetaSubmissions(metas);
      setHasVoted(voted);
    } catch (err) {
      console.warn('Failed to poll for meta submissions', err);
    }
  }, [api, metaModuleId, ourPeer.id]);

  useEffect(() => {
    const pollSubmissionInterval = setInterval(
      pollMetaSubmissions,
      POLL_TIMEOUT_MS
    );
    return () => {
      clearInterval(pollSubmissionInterval);
    };
  }, [pollMetaSubmissions]);

  useEffect(() => {
    const pollConsensusMeta = setInterval(async () => {
      try {
        const meta = await api.moduleApiCall<ConsensusMeta>(
          Number(metaModuleId),
          ModuleRpc.getConsensus,
          DEFAULT_META_KEY
        );
        if (!meta) return;
        const parsedConsensusMeta: ParsedConsensusMeta = {
          revision: meta.revision,
          value: Object.entries(hexToMeta(meta.value)).filter(
            ([, value]) => value !== undefined && value !== ''
          ) as [string, string][],
        };
        // Compare the new meta with the current state
        setConsensusMeta((currentMeta) => {
          if (
            JSON.stringify(currentMeta) !== JSON.stringify(parsedConsensusMeta)
          ) {
            return parsedConsensusMeta;
          }
          return currentMeta;
        });
      } catch (err) {
        console.warn('Failed to poll for consensus meta', err);
      }
    }, POLL_TIMEOUT_MS);
    return () => {
      clearInterval(pollConsensusMeta);
    };
  }, [api, metaModuleId]);

  useEffect(() => {
    if (config) {
      const peers = Object.entries(config.global.api_endpoints).map(
        ([id, endpoint]) => ({
          id: Number.parseInt(id, 10),
          name: endpoint.name,
        })
      );
      setPeers(peers);
    }
  }, [config]);

  useEffect(() => {
    const metaModuleId = config
      ? Object.entries(config.modules).find(
          (m) => m[1].kind === ModuleKind.Meta
        )?.[0]
      : undefined;
    setMetaModuleId(metaModuleId);
  }, [config]);

  return config ? (
    <Card flex='1' width='100%' overflowX='hidden'>
      <Tabs
        variant='soft-rounded'
        colorScheme='blue'
        index={activeTab}
        onChange={setActiveTab}
        orientation='vertical'
        display='flex'
        height='100%'
      >
        <Flex width='100%'>
          <TabList flexDirection='column' minWidth='220px' p={4}>
            <Tab justifyContent='flex-start' mb={2}>
              {t('federation-dashboard.info.label')}
            </Tab>
            <Tab justifyContent='flex-start' mb={2}>
              {t('federation-dashboard.status.label')}
            </Tab>
            <Tab justifyContent='flex-start' mb={2}>
              {t('federation-dashboard.balance.label')}
            </Tab>
            <Tab justifyContent='flex-start' mb={2}>
              {t('federation-dashboard.config.view-config')}
            </Tab>
            <Tab justifyContent='flex-start' mb={2}>
              {t('federation-dashboard.api-announcements.label')}
            </Tab>
            <Tab justifyContent='flex-start' mb={2}>
              {t('federation-dashboard.config.manage-meta.label')}
            </Tab>

            {pendingProposalsCount > 0 && (
              <Tab justifyContent='flex-start'>
                <Flex align='center' justify='space-between' width='100%'>
                  {t(
                    'federation-dashboard.config.manage-meta.proposed-meta-label'
                  )}
                  <Badge
                    fontSize='0.8em'
                    colorScheme='red'
                    borderRadius='full'
                    boxSize='1.5em'
                    display='flex'
                    alignItems='center'
                    justifyContent='center'
                  >
                    {pendingProposalsCount}
                  </Badge>
                </Flex>
              </Tab>
            )}
          </TabList>
          <Divider orientation='vertical' />
          <TabPanels flex={1} width='100%' overflow={'hidden'}>
            <TabPanel>
              <FederationInfo
                status={status}
                config={config}
                latestSession={latestSession}
                modulesConfigs={config?.modules}
              />
            </TabPanel>
            <TabPanel>
              <FederationStatus
                status={status}
                config={config}
                signedApiAnnouncements={signedApiAnnouncements}
              />
            </TabPanel>
            <TabPanel>
              <BalanceSheet />
            </TabPanel>
            <TabPanel>
              <CodeMirror
                value={JSON.stringify(config, null, 2)}
                theme={githubLight}
                extensions={[json()]}
                basicSetup={{ autocompletion: true }}
                height={'500px'}
                readOnly
              />
            </TabPanel>
            <TabPanel>
              <ApiAnnouncements
                signedApiAnnouncements={signedApiAnnouncements}
                config={config}
              />
            </TabPanel>
            <TabPanel>
              <MetaManager
                metaModuleId={metaModuleId}
                consensusMeta={consensusMeta}
                setActiveTab={setActiveTab}
                isSoloMode={
                  Object.keys(config.global.api_endpoints).length === 1
                }
              />
            </TabPanel>
            {pendingProposalsCount > 0 && (
              <TabPanel>
                <ProposedMetas
                  ourPeer={ourPeer}
                  peers={peers}
                  metaModuleId={metaModuleId ?? ''}
                  consensusMeta={consensusMeta}
                  metaSubmissions={metaSubmissions}
                  hasVoted={hasVoted}
                  setActiveTab={setActiveTab}
                />
              </TabPanel>
            )}
          </TabPanels>
        </Flex>
      </Tabs>
    </Card>
  ) : null;
};
