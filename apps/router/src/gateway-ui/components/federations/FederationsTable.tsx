import React from 'react';
import { Text, Flex, Link, Button } from '@chakra-ui/react';
import { MSats } from '@fedimint/types';
import { useTranslation, formatEllipsized, formatValue } from '@fedimint/utils';
import { Table, TableColumn, TableRow } from '@fedimint/ui';
import { ViewConfigModal } from './ViewConfig';

import {
  GATEWAY_APP_ACTION_TYPE,
  WalletModalAction,
  WalletModalType,
} from '../../../types/gateway';
import { useGatewayContext } from '../../../hooks';
import { useTheme } from '@fedimint/ui';

export const FederationsTable: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { state, dispatch } = useGatewayContext();
  const columns: TableColumn<'name' | 'id' | 'balance' | 'actions'>[] = [
    { key: 'name', heading: t('federation-card.name') },
    { key: 'id', heading: t('federation-card.id') },
    { key: 'balance', heading: t('federation-card.balance') },
    { key: 'actions', heading: t('federation-card.actions') },
  ];

  const rows: TableRow<'name' | 'id' | 'balance' | 'actions'>[] =
    state.gatewayInfo?.federations?.map((federation) => ({
      key: federation.federation_id,
      name: federation.config.global.meta.federation_name,
      id: (
        <Flex direction='column' alignItems='flex-start'>
          <Text fontSize='sm' fontWeight='medium'>
            {formatEllipsized(federation.federation_id)}
          </Text>
          <Button
            as={ViewConfigModal}
            federationId={federation.federation_id}
            config={federation.config}
            variant='link'
            size='sm'
            colorScheme='blue'
            fontWeight='normal'
            padding='0'
            height='auto'
          >
            {t('federation-card.view-config')}
          </Button>
        </Flex>
      ),
      balance: formatValue(federation.balance_msat as MSats, state.unit, true),
      actions: (
        <Flex gap='8px'>
          <Link
            color={theme.colors.blue[600]}
            onClick={() =>
              dispatch({
                type: GATEWAY_APP_ACTION_TYPE.SET_WALLET_MODAL_STATE,
                payload: {
                  action: WalletModalAction.Receive,
                  type: WalletModalType.Onchain,
                  selectedFederation: federation,
                  isOpen: true,
                  showSelector: true,
                },
              })
            }
          >
            {t('federation-card.receive')}
          </Link>
          <Link
            color={theme.colors.blue[600]}
            onClick={() =>
              dispatch({
                type: GATEWAY_APP_ACTION_TYPE.SET_WALLET_MODAL_STATE,
                payload: {
                  action: WalletModalAction.Send,
                  type: WalletModalType.Onchain,
                  selectedFederation: federation,
                  isOpen: true,
                  showSelector: true,
                },
              })
            }
          >
            {t('federation-card.send')}
          </Link>
        </Flex>
      ),
    })) ?? [];

  return (
    <Flex direction='column' gap={4}>
      <Flex alignItems='center' justifyContent='flex-end'>
        <Button
          onClick={() =>
            dispatch({
              type: GATEWAY_APP_ACTION_TYPE.SET_SHOW_CONNECT_FED,
              payload: true,
            })
          }
        >
          {t('connect-federation.connect-federation-button')}
        </Button>
      </Flex>
      <Table columns={columns} rows={rows} />
    </Flex>
  );
};
