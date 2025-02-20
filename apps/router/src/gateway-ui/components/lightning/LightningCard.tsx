import React from 'react';
import {
  Text,
  Flex,
  Link,
  Box,
  useClipboard,
  SimpleGrid,
} from '@chakra-ui/react';
import { formatEllipsized, getNodeUrl, useTranslation } from '@fedimint/utils';
import CopyIcon from '../../assets/svgs/copy.svg?react';
import LinkIcon from '../../assets/svgs/linkIcon.svg?react';
import { useGatewayContext } from '../../../hooks';
import { Network } from '@fedimint/types';

const InfoItem = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <Flex>
    <Text fontWeight='bold' mr={2}>
      {label}:
    </Text>
    {value}
  </Flex>
);

export const LightningCard = React.memo(function LightningCard(): JSX.Element {
  const { t } = useTranslation();
  const {
    state: { gatewayInfo },
  } = useGatewayContext();
  const { onCopy, hasCopied } = useClipboard(gatewayInfo?.gateway_id ?? '');
  const url = getNodeUrl(
    gatewayInfo?.gateway_id ?? '',
    gatewayInfo?.network ?? Network.Bitcoin
  );

  const nodeIdValue = (
    <Flex alignItems='center' gap={2}>
      {formatEllipsized(gatewayInfo?.gateway_id ?? '', 8)}
      <Box
        as={CopyIcon}
        color='gray.500'
        height='20px'
        width='20px'
        onClick={onCopy}
        cursor='pointer'
        aria-label={t('common.copy')}
        role='button'
        _hover={{ color: 'gray.700' }}
      />
      {hasCopied && (
        <Text fontSize='xs' color='green.500'>
          {t('common.copied')}
        </Text>
      )}
      <Link
        fontSize='sm'
        color='blue.600'
        href={url.toString()}
        target='_blank'
        rel='noreferrer'
        display='flex'
        alignItems='center'
        _hover={{ textDecoration: 'underline', color: 'blue.700' }}
      >
        {t('federation-card.view-link-on', { host: url.host })}
        <Box as={LinkIcon} ml={1} boxSize={4} />
      </Link>
    </Flex>
  );

  const infoItems = [
    { label: t('info-card.node-id'), value: nodeIdValue },
    { label: t('info-card.alias'), value: gatewayInfo?.lightning_alias },
    {
      label: t('info-card.pubkey'),
      value: formatEllipsized(gatewayInfo?.lightning_pub_key ?? '', 8),
    },
    { label: t('info-card.network'), value: gatewayInfo?.network },
    { label: t('info-card.block-height'), value: gatewayInfo?.block_height },
    {
      label: t('info-card.synced-to-chain'),
      value: gatewayInfo?.synced_to_chain ? 'Yes' : 'No',
    },
    {
      label: t('info-card.mode'),
      value: Object.keys(gatewayInfo?.lightning_mode ?? {})[0],
    },
  ];

  return (
    <SimpleGrid columns={2} spacing={4}>
      {infoItems.map((item, index) => (
        <InfoItem key={index} label={item.label} value={item.value} />
      ))}
    </SimpleGrid>
  );
});
