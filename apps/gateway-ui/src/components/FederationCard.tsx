import React from 'react';
import { Flex, Stack, useTheme, Heading } from '@chakra-ui/react';
import { Federation } from '../types';
import { InfoCard, DepositCard, BalanceCard, WithdrawCard } from '.';
import { useTranslation } from '@fedimint/utils';

interface FederationCardProps {
  federation: Federation;
}

export const FederationCard: React.FC<FederationCardProps> = (props) => {
  const { federation_id, balance_msat, config } = props.federation;
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <>
      <Stack spacing='24px'>
        <Heading
          fontWeight='500'
          fontSize='24px'
          size='xs'
          color={theme.colors.gray[900]}
          fontFamily={theme.fonts.heading}
        >
          {config.meta.federation_name ||
            t('federation-card.default-federation-name')}
        </Heading>
        <Flex gap='24px' flexDir={{ base: 'column', sm: 'column', md: 'row' }}>
          <BalanceCard balance_msat={balance_msat} />
          <InfoCard nodeId={federation_id} nodeLink={federation_id} />
        </Flex>
        <Flex gap='24px' flexDir={{ base: 'column', sm: 'column', md: 'row' }}>
          <DepositCard federationId={federation_id} />
          <WithdrawCard
            federationId={federation_id}
            balanceMsat={balance_msat}
          />
        </Flex>
      </Stack>
    </>
  );
};
