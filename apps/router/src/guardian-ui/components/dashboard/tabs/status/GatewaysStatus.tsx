import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Flex,
  Link,
  Text,
  useTheme,
} from '@chakra-ui/react';
import { ClientConfig, Gateway, ModuleKind } from '@fedimint/types';
import { Table, TableColumn, TableRow } from '@fedimint/ui';
import { useTranslation, formatEllipsized } from '@fedimint/utils';
import InfoIcon from '../../../../assets/svgs/info.svg?react';
import { useGuardianAdminApi } from '../../../../../hooks';
import { ModuleRpc } from '../../../../../types/guardian';

type TableKey = 'nodeId' | 'gatewayId' | 'fee';

interface GatewaysStatusProps {
  config: ClientConfig | undefined;
}

export const GatewaysStatus: React.FC<GatewaysStatusProps> = ({ config }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const api = useGuardianAdminApi();
  const [gateways, setGateways] = useState<Gateway[]>([]);

  // TODO: This is a hack to get the ln module id, extract this logic into the api interface like block count
  const lnModuleId = config
    ? Object.entries(config.modules).find(
        (m) => m[1].kind === ModuleKind.Ln
      )?.[0]
    : undefined;

  useEffect(() => {
    if (!lnModuleId) return;
    api
      .moduleApiCall<{ info: Gateway }[]>(
        Number(lnModuleId),
        ModuleRpc.listGateways
      )
      .then((gateways) => setGateways(gateways.map((g) => g.info)))
      .catch(console.error);
  }, [config, api, lnModuleId]);

  const columns: TableColumn<TableKey>[] = useMemo(
    () => [
      {
        key: 'nodeId',
        heading: t('federation-dashboard.gateways.node-id-label'),
      },
      {
        key: 'gatewayId',
        heading: t('federation-dashboard.gateways.gateway-id-label'),
      },
      {
        key: 'fee',
        heading: t('federation-dashboard.gateways.fee-label'),
      },
    ],
    [t]
  );

  const rows: TableRow<TableKey>[] = useMemo(
    () =>
      gateways.map(({ gateway_id, node_pub_key, fees }) => {
        const feePct = fees.proportional_millionths / 10000;
        const fee = [
          fees.base_msat ? `${fees.base_msat / 1000} sats +` : '',
          `${fees.proportional_millionths} ppm`,
          feePct ? `(${feePct}%)` : '',
        ]
          .filter(Boolean)
          .join(' ');
        return {
          key: gateway_id,
          nodeId: (
            <Flex direction='column' gap='4px'>
              <Text>{formatEllipsized(node_pub_key)}</Text>
              <Text size='xs'>
                <Link
                  color={theme.colors.blue[600]}
                  href={`https://amboss.space/node/${node_pub_key}`}
                  target='_blank'
                  rel='noreferrer'
                >
                  {t('federation-dashboard.gateways.view-on-site', {
                    site: 'amboss.space',
                  })}
                </Link>
              </Text>
            </Flex>
          ),
          gatewayId: formatEllipsized(gateway_id),
          fee: fee,
          outgoingFee: fee,
        };
      }),
    [gateways, t, theme]
  );

  return (
    <Flex direction='column' gap={6}>
      <Text size='lg' fontWeight='600'>
        {t('federation-dashboard.gateways.label')}
      </Text>
      {gateways.length === 0 ? (
        <Flex justifyContent='center'>
          <Alert status='info'>
            <AlertIcon as={InfoIcon} />
            <Box>
              <AlertTitle>
                {t('federation-dashboard.gateways.no-gateways-info-title')}
              </AlertTitle>
              <AlertDescription>
                {t(
                  'federation-dashboard.gateways.no-gateways-info-description'
                )}
              </AlertDescription>
            </Box>
          </Alert>
        </Flex>
      ) : (
        <Table columns={columns} rows={rows} />
      )}
    </Flex>
  );
};
