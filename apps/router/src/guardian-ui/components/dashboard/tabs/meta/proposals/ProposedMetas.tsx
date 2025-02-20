import React, { useState, useCallback } from 'react';
import {
  Flex,
  Text,
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Icon,
  useDisclosure,
  useBreakpointValue,
} from '@chakra-ui/react';
import CheckIcon from '../../../../../assets/svgs/check.svg?react';
import { useTranslation, metaToHex, fieldsToMeta } from '@fedimint/utils';
import { MetaFields, ParsedConsensusMeta } from '@fedimint/types';

import { Table, TableColumn } from '@fedimint/ui';
import {
  bftHonest,
  generateSimpleHash,
  isJsonString,
} from '../../../../../utils';
import { DEFAULT_META_KEY } from '../../FederationTabsCard';
import { ConfirmNewMetaModal } from './ConfirmNewMetaModal';
import { useGuardianAdminApi } from '../../../../../../hooks';
import { ModuleRpc } from '../../../../../../types/guardian';

export const formatJsonValue = (value: string): JSX.Element => {
  if (isJsonString(value)) {
    const parsedJson = JSON.parse(value);
    return (
      <pre>
        <code>{JSON.stringify(parsedJson, null, 2)}</code>
      </pre>
    );
  }
  return <Text>{value}</Text>;
};

type MetaSubmissionMap = {
  [key: string]: {
    peers: number[];
    meta: MetaFields;
  };
};

type TableKey = 'metaKey' | 'value' | 'effect';

interface ProposedMetasProps {
  ourPeer: { id: number; name: string };
  peers: { id: number; name: string }[];
  metaModuleId: string;
  consensusMeta?: ParsedConsensusMeta;
  metaSubmissions: MetaSubmissionMap;
  hasVoted: boolean;
  setActiveTab: (tab: number) => void;
}

export const ProposedMetas = React.memo(function ProposedMetas({
  ourPeer,
  peers,
  metaModuleId,
  consensusMeta,
  metaSubmissions,
  setActiveTab,
}: ProposedMetasProps): JSX.Element {
  const { t } = useTranslation();
  const api = useGuardianAdminApi();
  const { isOpen, onOpen: openModal, onClose } = useDisclosure();
  const [selectedMeta, setSelectedMeta] = useState<MetaFields | null>(null);
  const isMobile = useBreakpointValue({ base: true, md: false });

  const totalGuardians = peers.length;
  const threshold = bftHonest(totalGuardians);

  const handleClear = useCallback(async () => {
    try {
      await api.moduleApiCall<{ metaValue: string }[]>(
        Number(metaModuleId),
        ModuleRpc.submitMeta,
        {
          key: DEFAULT_META_KEY,
          value: metaToHex(fieldsToMeta([])), // Empty submission
        }
      );
    } catch (err) {
      console.error('Failed to clear meta edits', err);
    }
  }, [api, metaModuleId]);

  const handleApprove = useCallback(
    async (meta: MetaFields) => {
      try {
        // Submit the meta fields for the guardian
        await api.moduleApiCall<{ metaValue: string }[]>(
          Number(metaModuleId),
          ModuleRpc.submitMeta,
          {
            key: DEFAULT_META_KEY,
            value: metaToHex(fieldsToMeta(meta)),
          }
        );
      } catch (err) {
        console.error('Failed to submit meta edits', err);
      }
    },
    [api, metaModuleId]
  );

  const columnsWithEffect: TableColumn<TableKey>[] = [
    {
      key: 'metaKey',
      heading: t('set-config.meta-fields-key'),
    },
    {
      key: 'value',
      heading: t('set-config.meta-fields-value'),
    },
    {
      key: 'effect',
      heading: t('set-config.meta-fields-effect'),
    },
  ];

  const isEqual = (a: string, b: string): boolean => {
    try {
      return JSON.stringify(JSON.parse(a)) === JSON.stringify(JSON.parse(b));
    } catch {
      return a === b;
    }
  };

  const getEffect = (
    key: string,
    value: string,
    consensusMeta: ParsedConsensusMeta | undefined
  ): JSX.Element => {
    if (!consensusMeta?.value) {
      return (
        <Text color='green.500'>
          {t('federation-dashboard.config.manage-meta.meta-effect-add')}
        </Text>
      );
    }

    const consensusValue = consensusMeta.value.find(([k]) => k === key)?.[1];

    if (consensusValue === undefined) {
      return (
        <Text color='green.500'>
          {t('federation-dashboard.config.manage-meta.meta-effect-add')}
        </Text>
      );
    } else if (!isEqual(consensusValue, value)) {
      return (
        <Text color='yellow.500'>
          {t('federation-dashboard.config.manage-meta.meta-effect-modify')}
        </Text>
      );
    } else {
      return (
        <Text color='gray.500'>
          {t('federation-dashboard.config.manage-meta.meta-effect-unchanged')}
        </Text>
      );
    }
  };

  const handleApproveWithWarning = (
    meta: MetaFields,
    currentApprovals: number
  ) => {
    if (currentApprovals + 1 >= threshold) {
      setSelectedMeta(meta);
      openModal();
    } else {
      handleApprove(meta);
    }
  };

  const confirmApproval = async () => {
    if (selectedMeta) {
      await handleApprove(selectedMeta);
      setActiveTab(0);
      onClose();
    }
  };

  return (
    <Flex flexDir='column' width='100%'>
      {metaSubmissions && Object.keys(metaSubmissions).length > 0 ? (
        <Flex
          flexDir='row'
          justifyContent='space-between'
          alignItems='center'
          mb={4}
        >
          <Text fontSize='lg' fontWeight='semibold'>
            {t('federation-dashboard.config.manage-meta.proposals')}
          </Text>
          <Text fontSize='md'>
            {t('common.threshold')}: {threshold} / {totalGuardians}
          </Text>
        </Flex>
      ) : null}
      {metaSubmissions &&
        Object.entries(metaSubmissions).map(([key, submission]) => {
          const submissionMap = new Map(submission.meta);
          const rows = [
            ...submission.meta
              .filter(([key, value]) => {
                const consensusValue = consensusMeta?.value.find(
                  ([k]) => k === key
                )?.[1];
                return !consensusValue || !isEqual(consensusValue, value);
              })
              .map(([key, value]) => ({
                key: `${key}-${value}`,
                metaKey: <Text>{key}</Text>,
                value: (
                  <pre>
                    <code>{formatJsonValue(value)}</code>
                  </pre>
                ),
                effect: getEffect(key, value, consensusMeta),
              })),
            ...(consensusMeta
              ? consensusMeta.value
                  .filter(([key]) => !submissionMap.has(key))
                  .map(([key, value]) => ({
                    key: `${key}-${value}`,
                    metaKey: <Text as='del'>{key}</Text>,
                    value: <Text as='del'>{value}</Text>,
                    effect: <Text color='red.500'>{t('common.remove')}</Text>,
                  }))
              : []),
          ];

          const totalGuardians = peers.length;
          const currentApprovals = submission.peers.length;

          return (
            <Card key={key} mb={4} variant={isMobile ? 'unstyled' : 'elevated'}>
              <CardHeader>
                <Flex
                  justifyContent='space-between'
                  alignItems='center'
                  flexDir={isMobile ? 'column' : 'row'}
                >
                  <Text
                    fontSize='md'
                    fontWeight={'semibold'}
                    mb={isMobile ? 2 : 0}
                  >
                    {`Proposal ID: ${generateSimpleHash(key)}`}
                  </Text>
                  {submission.peers.includes(ourPeer.id) ? (
                    <Button
                      onClick={handleClear}
                      variant='outline'
                      colorScheme='red'
                      size={isMobile ? 'sm' : 'md'}
                    >
                      {t(
                        'federation-dashboard.config.manage-meta.revoke-button'
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={() =>
                        handleApproveWithWarning(
                          submission.meta,
                          currentApprovals
                        )
                      }
                      colorScheme='green'
                      variant={'outline'}
                      ml={isMobile ? 0 : 4}
                      mt={isMobile ? 2 : 0}
                      size={isMobile ? 'sm' : 'md'}
                    >
                      {t('common.approve')}
                    </Button>
                  )}
                </Flex>
              </CardHeader>
              <CardBody mb={0} px={isMobile ? 0 : 4}>
                {isMobile ? (
                  <Flex flexDir='column'>
                    {rows.map((row) => (
                      <Flex key={row.key} flexDir='column' mb={4}>
                        <Text fontWeight='bold'>{row.metaKey}</Text>
                        {row.value}
                        {row.effect}
                      </Flex>
                    ))}
                  </Flex>
                ) : (
                  <Table columns={columnsWithEffect} rows={rows} />
                )}
              </CardBody>
              <CardFooter flexDir='column' alignItems='flex-start'>
                <Text fontWeight='semibold' mb={2}>
                  {t('common.approvals')}: ( {currentApprovals} /{' '}
                  {totalGuardians} )
                </Text>
                <Flex flexWrap='wrap' gap={2}>
                  {submission.peers.map((peerId) => (
                    <Flex key={peerId} alignItems='center'>
                      <Icon
                        as={CheckIcon}
                        color={
                          ourPeer.id === Number(peerId)
                            ? 'blue.500'
                            : 'green.500'
                        }
                        w={4}
                        h={4}
                      />
                      <Text ml={1} fontSize={isMobile ? 'sm' : 'md'}>
                        {ourPeer.id === Number(peerId)
                          ? t('common.you')
                          : peers.find((p) => p.id === Number(peerId))?.name}
                      </Text>
                    </Flex>
                  ))}
                </Flex>
              </CardFooter>
            </Card>
          );
        })}

      <ConfirmNewMetaModal
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={confirmApproval}
        selectedMeta={selectedMeta}
      />
    </Flex>
  );
});
