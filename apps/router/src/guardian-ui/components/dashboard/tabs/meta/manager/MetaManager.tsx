import React, { useCallback, useEffect, useState } from 'react';
import { Box, Button, Divider, Flex, Link, Text } from '@chakra-ui/react';
import { fieldsToMeta, metaToHex, useTranslation } from '@fedimint/utils';
import { ParsedConsensusMeta } from '@fedimint/types';

interface Site {
  id: string;
  url: string;
  title: string;
  imageUrl: string;
}
import { DEFAULT_META_KEY } from '../../FederationTabsCard';
import { useGuardianAdminApi } from '../../../../../../hooks';
import { ModuleRpc } from '../../../../../../types/guardian';
import { SitesInput } from './SitesInput';
import { CustomMetaFields } from './CustomMetaFields';
import { useToast } from '@fedimint/ui';

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
  const toast = useToast();
  const [sites, setSites] = useState<Site[]>([]);
  const [customMeta, setCustomMeta] = useState<Record<string, string>>({});

  useEffect(() => {
    if (consensusMeta?.value) {
      const metaObj = metaArrayToObject(consensusMeta.value);
      const { sites = '[]', ...rest } = metaObj;

      setSites(JSON.parse(sites));
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

    if (sites.length > 0) {
      return sites.some(
        (site) => !site.id || !site.url || !site.title || !site.imageUrl
      );
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
      ) && JSON.stringify(sites) === JSON.stringify(consensusMetaObj.sites)
    );
  }, [customMeta, sites, consensusMeta]);

  const canSubmit = useCallback(() => {
    return !isAnyFieldEmpty() && !isMetaUnchanged();
  }, [isAnyFieldEmpty, isMetaUnchanged]);

  const resetToConsensus = useCallback(() => {
    if (consensusMeta?.value) {
      const metaObj = metaArrayToObject(consensusMeta.value);
      const { sites, ...rest } = metaObj;
      setSites(JSON.parse(sites));
      setCustomMeta(rest);
      toast.success(
        t('admin.config.manage-meta.submit-meta-proposal'),
        t('admin.config.manage-meta.proposal-approved')
      );
    }
  }, [consensusMeta, toast, t]);

  const proposeMetaEdits = useCallback(async () => {
    if (metaModuleId === undefined || isAnyFieldEmpty()) return;

    try {
      const updatedMetaArray = Object.entries({
        ...customMeta,
        sites: JSON.stringify(sites),
      });
      await api.moduleApiCall<{ metaValue: string }[]>(
        Number(metaModuleId),
        ModuleRpc.submitMeta,
        {
          key: DEFAULT_META_KEY,
          value: metaToHex(fieldsToMeta(updatedMetaArray)),
        }
      );
      toast.success(
        t('admin.config.manage-meta.update-meta-button'),
        t('admin.config.manage-meta.consensus-meta-label')
      );
      setActiveTab(0);
    } catch (error) {
      console.error(error);
      toast.error(
        t('federation-dashboard.config.manage-meta.propose-error-title'),
        t('federation-dashboard.config.manage-meta.propose-error-description')
      );
    }
  }, [
    api,
    metaModuleId,
    customMeta,
    sites,
    isAnyFieldEmpty,
    setActiveTab,
    toast,
    t,
  ]);

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
      <SitesInput
        value={JSON.stringify(sites)}
        onChange={(value) => setSites(JSON.parse(value))}
      />
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
          <Button onClick={resetToConsensus}>
            {t(
              'federation-dashboard.config.manage-meta.reset-to-consensus-button'
            )}
          </Button>
        )}
      </Flex>
    </Flex>
  );
});
