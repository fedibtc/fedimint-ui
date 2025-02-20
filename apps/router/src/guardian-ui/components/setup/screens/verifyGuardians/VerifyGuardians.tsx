import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  FormControl,
  FormLabel,
  FormHelperText,
  Flex,
  Icon,
  Heading,
  Text,
  Spinner,
  Input,
  Tag,
  useTheme,
  CircularProgress,
  Hide,
  Show,
  Box,
  InputGroup,
  useBreakpointValue,
  Stack,
  StackDirection,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { GuardianServerStatus, Peer } from '@fedimint/types';
import { useTranslation } from '@fedimint/utils';
import { CopyInput, Table } from '@fedimint/ui';
import { GuardianRole } from '../../../../../types/guardian';
import { formatApiErrorMessage } from '../../../../utils/api';
import ArrowRightIcon from '../../../../assets/svgs/arrow-right.svg?react';
import CopyIcon from '../../../../assets/svgs/copy.svg?react';
import CheckCircleIcon from '../../../../assets/svgs/check-circle.svg?react';
import XCircleIcon from '../../../../assets/svgs/x-circle.svg?react';
import {
  useConsensusPolling,
  useGuardianSetupApi,
  useGuardianSetupContext,
  useTrimmedInputArray,
} from '../../../../../hooks';

interface PeerWithHash {
  id: string;
  peer: Peer;
  hash: string;
}

interface Props {
  next(): void;
}

export const VerifyGuardians: React.FC<Props> = ({ next }) => {
  const { t } = useTranslation();
  const api = useGuardianSetupApi();
  const {
    state: { role, numPeers, peers, ourCurrentId },
    toggleConsensusPolling,
  } = useGuardianSetupContext();
  const theme = useTheme();
  const isHost = role === GuardianRole.Host;
  const [myHash, setMyHash] = useState('');
  const [peersWithHash, setPeersWithHash] = useState<PeerWithHash[]>();
  const { values: enteredHashes, handleChange: handleHashChange } =
    useTrimmedInputArray(peersWithHash ? peersWithHash.map(() => '') : []);
  const [verifiedConfigs, setVerifiedConfigs] = useState<boolean>(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string>();
  const [isOpen, setIsOpen] = useState(false);
  const [ourPeerName, setOurPeerName] = useState('');

  // Poll for peers and configGenParams while on this page.
  useConsensusPolling();

  useEffect(() => {
    async function assembleHashInfo() {
      if (peers.length === 0) {
        return setError(t('verify-guardians.error'));
      }

      if (ourCurrentId === null) {
        return setError(t('verify-guardians.error-peer-id'));
      }

      if (peers[ourCurrentId]) {
        setOurPeerName(peers[ourCurrentId].name);
      }

      try {
        const hashes = await api.getVerifyConfigHash();
        setMyHash(hashes[ourCurrentId]);
        setPeersWithHash(
          Object.entries(peers)
            .map(([id, peer]) => ({
              id,
              peer,
              hash: hashes[id as unknown as number],
            }))
            .filter((peer) => peer.id !== ourCurrentId.toString())
        );

        // Prefill hashes if already verified
        if (
          peers[ourCurrentId].status === GuardianServerStatus.VerifiedConfigs
        ) {
          const otherPeers = Object.entries(peers).filter(
            ([id]) => id !== ourCurrentId.toString()
          );
          otherPeers.forEach(([id], idx) => {
            handleHashChange(idx, hashes[id as unknown as number]);
          });
        }
      } catch (err) {
        setError(formatApiErrorMessage(err));
      }
    }
    assembleHashInfo();
  }, [api, peers, ourCurrentId, t, handleHashChange]);

  useEffect(() => {
    // If we're the only guardian, skip this verify other guardians step.
    if (numPeers === 1) {
      api
        .startConsensus()
        .then(next)
        .catch((err) => {
          setError(formatApiErrorMessage(err));
        });
      return;
    }

    const isAllValid =
      peersWithHash &&
      peersWithHash.every(({ hash }, idx) => hash === enteredHashes[idx]);

    if (isAllValid && !verifiedConfigs) {
      api
        .verifiedConfigs()
        .then(() => {
          setVerifiedConfigs(true);
          toggleConsensusPolling(false);
        })
        .catch((err) => {
          setError(formatApiErrorMessage(err));
        });
    }
  }, [
    api,
    peersWithHash,
    enteredHashes,
    verifiedConfigs,
    numPeers,
    next,
    toggleConsensusPolling,
  ]);

  const handleNext = useCallback(async () => {
    setIsStarting(true);
    try {
      await api.startConsensus();
      next();
    } catch (err) {
      setError(formatApiErrorMessage(err));
    }
    setIsStarting(false);
  }, [api, next]);

  // Host of one immediately skips this step.
  useEffect(() => {
    if (isHost && !numPeers) {
      handleNext();
    }
  }, [handleNext, numPeers, isHost]);

  const tableColumns = useMemo(
    () => [
      {
        key: 'name',
        heading: t('verify-guardians.table-column-name'),
        width: '200px',
      },
      {
        key: 'status',
        heading: t('verify-guardians.table-column-status'),
        width: '160px',
      },
      {
        key: 'hashInput',
        heading: t('verify-guardians.table-column-hash-input'),
      },
    ],
    [t]
  );

  const direction = useBreakpointValue({
    base: 'column-reverse',
    sm: 'row',
  }) as StackDirection | undefined;

  const tableRows = useMemo(() => {
    if (!peersWithHash) return [];
    return peersWithHash.map(({ peer, hash }, idx) => {
      const value = enteredHashes[idx] || '';
      const isValid = Boolean(value && value === hash);
      const isError = Boolean(value && !isValid);
      return {
        key: peer.cert,
        name: (
          <Text maxWidth={200} isTruncated>
            {peer.name}
          </Text>
        ),
        status: isValid ? (
          <Tag colorScheme='green'>{t('verify-guardians.verified')}</Tag>
        ) : (
          ''
        ),
        hashInput: (
          <FormControl isInvalid={isError}>
            <Input
              variant='filled'
              value={value}
              placeholder={`${t('verify-guardians.verified-placeholder')}`}
              onChange={(ev) => handleHashChange(idx, ev.currentTarget.value)}
              readOnly={isValid}
            />
          </FormControl>
        ),
      };
    });
  }, [peersWithHash, enteredHashes, handleHashChange, t]);

  if (error) {
    return (
      <Flex direction='column' gap={6}>
        <Heading size='sm'>{t('verify-guardians.error')}</Heading>
        <Text color={theme.colors.red[500]}>{error}</Text>
      </Flex>
    );
  } else if (!peersWithHash) {
    return <Spinner />;
  } else if (numPeers === 1) {
    return (
      <Flex direction='column' gap={6} justify='center' align='center'>
        <CircularProgress
          isIndeterminate
          color={theme.colors.blue[400]}
          size='200px'
        />
        <Heading size='sm'>{t('verify-guardians.starting-consensus')}</Heading>
      </Flex>
    );
  } else {
    return (
      <Flex direction='column' gap={6} justify='start' align='start'>
        <FormControl
          bg={theme.colors.blue[50]}
          p={4}
          borderRadius='md'
          maxW='md'
        >
          <FormLabel>
            {t('verify-guardians.verification-code', {
              peerName: ourPeerName,
            })}
          </FormLabel>
          <CopyInput
            value={myHash}
            buttonLeftIcon={<Icon as={CopyIcon} />}
            size='sm'
          />
          <FormHelperText>
            {t('verify-guardians.verification-code-help')}
          </FormHelperText>
        </FormControl>
        <Hide below='sm'>
          <Table
            title={t('verify-guardians.table-title')}
            description={t('verify-guardians.table-description')}
            columns={tableColumns}
            rows={tableRows}
          />
        </Hide>
        <Show below='sm'>
          <Flex direction='column' width='full' gap={4}>
            {peersWithHash.map(({ peer, hash }, idx) => {
              const value = enteredHashes[idx] || '';
              const isValid = value === hash;
              const isError = value && !isValid;

              return (
                <Box key={peer.cert}>
                  <Flex align='center' mb={2}>
                    <Text fontWeight='bold' isTruncated>
                      {peer.name}
                    </Text>
                    {isValid ? (
                      <CheckCircleIcon
                        color='green'
                        style={{
                          marginLeft: '8px',
                          height: '1em',
                          width: '1em',
                        }}
                      />
                    ) : isError ? (
                      <XCircleIcon
                        color='red'
                        style={{
                          marginLeft: '8px',
                          height: '1em',
                          width: '1em',
                        }}
                      />
                    ) : null}
                  </Flex>

                  <Flex direction='row' align='center' justify='start'>
                    <FormControl>
                      <InputGroup>
                        <Input
                          variant='filled'
                          borderColor={'gray.100'}
                          value={value}
                          placeholder={`${t(
                            'verify-guardians.verified-placeholder'
                          )}`}
                          onChange={(ev) =>
                            handleHashChange(idx, ev.currentTarget.value)
                          }
                          readOnly={isValid}
                        />
                      </InputGroup>
                    </FormControl>
                  </Flex>
                </Box>
              );
            })}
          </Flex>
        </Show>
        <Stack direction={direction} gap={4} width='full' align='center'>
          <Button
            isDisabled={!verifiedConfigs}
            isLoading={isStarting}
            onClick={
              role === GuardianRole.Host ? () => setIsOpen(true) : handleNext
            }
            leftIcon={<Icon as={ArrowRightIcon} />}
            width={{ base: 'full', sm: 'auto' }}
          >
            {t('common.next')}
          </Button>
          {!verifiedConfigs && <Spinner />}
        </Stack>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <ModalOverlay />
          <ModalContent>
            <ModalCloseButton />
            <ModalBody p={6}>
              <Heading size='md' mb={4}>
                {t('common.confirm')}
              </Heading>
              <Text mb={4}>
                {t('setup.progress.verify-guardians.leader-confirm-done')}
              </Text>
              <Text fontWeight='bold' textDecoration='underline'>
                {t(
                  'setup.progress.verify-guardians.leader-confirm-done-emphasis'
                )}
              </Text>
            </ModalBody>
            <ModalFooter>
              <Button
                colorScheme='blue'
                mr={3}
                onClick={() => {
                  setIsOpen(false);
                  handleNext();
                }}
              >
                {t('common.confirm')}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Flex>
    );
  }
};
