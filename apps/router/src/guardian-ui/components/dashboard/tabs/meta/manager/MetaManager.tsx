import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Divider,
  Flex,
  Link,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@chakra-ui/react';
import { fieldsToMeta, metaToHex, useTranslation } from '@fedimint/utils';
import { ParsedConsensusMeta } from '@fedimint/types';
import { DEFAULT_META_KEY } from '../../FederationTabsCard';
import { useGuardianAdminApi } from '../../../../../../hooks';
import { ModuleRpc } from '../../../../../../types/guardian';
import { SitesInput } from './SitesInput';
import { CustomMetaFields } from './CustomMetaFields';

const metaArrayToObject = (
  metaArray: [string, string][]
): Record<string, string> => {
  return metaArray.reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
};

interface MetaManagerProps {
  metaModuleId?: string;
  consensusMeta?: ParsedConsensusMeta;
  setActiveTab: (tab: number) => void;
  isSoloMode: boolean;
}

export const MetaManager = React.memo(function MetaManager({
  metaModuleId,
  consensusMeta,
  setActiveTab,
  isSoloMode,
}: MetaManagerProps): JSX.Element {
  const { t } = useTranslation();
  const api = useGuardianAdminApi();
  const [sites, setSites] = useState<string>('[]');
  const [customMeta, setCustomMeta] = useState<Record<string, string>>({});
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (consensusMeta?.value) {
      const metaObj = metaArrayToObject(consensusMeta.value);
      const { sites = '[]', ...rest } = metaObj;

      setSites(sites);
      setCustomMeta(rest);
    }
  }, [consensusMeta]);

  const isAnyFieldEmpty = useCallback(() => {
    if (
      Object.entries(customMeta).some(
        ([key, value]) => key.trim() === '' || value.trim() === ''
      )
    )
      return true;

    if (sites.trim() !== '') {
      try {
        const localSites = JSON.parse(sites);
        if (Array.isArray(localSites) && localSites.length > 0) {
          return localSites.some(
            (site) => !site.id || !site.url || !site.title || !site.imageUrl
          );
        }
      } catch (error) {
        console.error('Error parsing sites JSON:', error);
        return true;
      }
    }

    return false;
  }, [customMeta, sites]);

  const isMetaUnchanged = useCallback(() => {
    if (!consensusMeta?.value) return false;
    const consensusMetaObj = metaArrayToObject(consensusMeta.value);

    // Check if the number of fields has changed
    if (
      Object.keys(customMeta).length + 1 !== // +1 for sites
      Object.keys(consensusMetaObj).length
    ) {
      return false;
    }

    // Check if any field values have changed
    return (
      Object.entries(customMeta).every(
        ([key, value]) => consensusMetaObj[key] === value
      ) && consensusMetaObj.sites === sites
    );
  }, [customMeta, sites, consensusMeta]);

  const canSubmit = useCallback(() => {
    return !isAnyFieldEmpty() && !isMetaUnchanged();
  }, [isAnyFieldEmpty, isMetaUnchanged]);

  const resetToConsensus = useCallback(() => {
    if (consensusMeta?.value) {
      const metaObj = metaArrayToObject(consensusMeta.value);
      const { sites, ...rest } = metaObj;
      setSites(sites || '[]');
      setCustomMeta(rest);
    }
    onClose();
  }, [consensusMeta, onClose]);

  const proposeMetaEdits = useCallback(() => {
    if (metaModuleId === undefined || isAnyFieldEmpty()) return;
    const updatedMetaArray = Object.entries({
      ...customMeta,
      sites,
    });
    api
      .moduleApiCall<{ metaValue: string }[]>(
        Number(metaModuleId),
        ModuleRpc.submitMeta,
        {
          key: DEFAULT_META_KEY,
          value: metaToHex(fieldsToMeta(updatedMetaArray)),
        }
      )
      .then(() => {
        setActiveTab(0);
      })
      .catch((error) => {
        console.error(error);
        alert('Failed to propose meta edits. Please try again.');
      });
  }, [api, metaModuleId, customMeta, sites, isAnyFieldEmpty, setActiveTab]);

  const handleSitesChange = (sitesJson: string) => {
    setSites(sitesJson);
  };

  return (
    <Flex flexDirection='column' gap={6}>
      <Text fontSize='xl' fontWeight='bold'>
        {t('federation-dashboard.config.manage-meta.header')}
      </Text>
      <Box display='inline-block'>
        <Text fontSize='md'>
          {t('federation-dashboard.config.manage-meta.description')}
        </Text>
        <Link
          href='https://github.com/fedimint/fedimint/tree/master/docs/meta_fields'
          color='blue.500'
          isExternal
          _hover={{ textDecoration: 'underline' }}
        >
          {t('federation-dashboard.config.manage-meta.learn-more')}
        </Link>
      </Box>
      <Divider />
      <CustomMetaFields customMeta={customMeta} setCustomMeta={setCustomMeta} />
      <Divider />
      <SitesInput value={sites} onChange={handleSitesChange} />
      <Flex gap={4}>
        <Button
          colorScheme='blue'
          onClick={proposeMetaEdits}
          isDisabled={!canSubmit()}
        >
          {isSoloMode
            ? t('federation-dashboard.config.manage-meta.update-meta-button')
            : t(
                'federation-dashboard.config.manage-meta.propose-new-meta-button'
              )}
        </Button>
        {consensusMeta?.value && !isMetaUnchanged() && (
          <Button
            colorScheme='red'
            bg='red.500'
            _hover={{ bg: 'red.600' }}
            onClick={onOpen}
          >
            {t(
              'federation-dashboard.config.manage-meta.reset-to-consensus-button'
            )}
          </Button>
        )}
      </Flex>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {t(
              'federation-dashboard.config.manage-meta.cancel-proposal-modal.title'
            )}
          </ModalHeader>
          <ModalBody>
            <Text>
              {t(
                'federation-dashboard.config.manage-meta.cancel-proposal-modal.description'
              )}
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button colorScheme='red' onClick={resetToConsensus}>
              {t('common.confirm')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
});
