import React from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  Select,
  FormHelperText,
  Alert,
  AlertIcon,
  Box,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { useTranslation } from '@fedimint/utils';
import { FormGroup, NetworkIndicator } from '@fedimint/ui';
import BitcoinLogo from '../../../../assets/svgs/bitcoin.svg?react';
import {
  Network,
  BitcoinRpc,
  BitcoinRpcKind,
  BitcoinRpcConnectionStatus,
} from '@fedimint/types';
import { NumberFormControl } from '../../../NumberFormControl';

interface BitcoinSettingsFormProps {
  network: Network;
  setNetwork: (network: Network) => void;
  networkSetFromParams: boolean;
  bitcoinRpc: BitcoinRpc;
  setBitcoinRpc: (rpc: BitcoinRpc) => void;
  bitcoinSetFromParams: boolean;
  blockConfirmations: string;
  setBlockConfirmations: (value: string) => void;
  isHostOrSolo: boolean;
  bitcoinStatus: BitcoinRpcConnectionStatus | undefined;
}

export const BitcoinSettingsForm: React.FC<BitcoinSettingsFormProps> = ({
  network,
  setNetwork,
  networkSetFromParams,
  bitcoinRpc,
  setBitcoinRpc,
  bitcoinSetFromParams,
  blockConfirmations,
  setBlockConfirmations,
  isHostOrSolo,
  bitcoinStatus,
}) => {
  const { t } = useTranslation();

  return (
    <FormGroup
      icon={BitcoinLogo}
      title={
        <>
          <span>{t('set-config.bitcoin-settings') + ': '}</span>
          <NetworkIndicator network={network} bitcoinRpcUrl={bitcoinRpc.url} />
        </>
      }
      isOpen={true}
    >
      {bitcoinStatus && bitcoinStatus !== 'Synced' && (
        <Alert status='warning'>
          <AlertIcon />
          <Box>
            <AlertTitle>
              {t('role-selector.bitcoin-node.not-synced')}
            </AlertTitle>
            <AlertDescription>
              {t('role-selector.bitcoin-node.not-synced-description', {
                progress: bitcoinStatus,
              })}
            </AlertDescription>
          </Box>
        </Alert>
      )}
      {isHostOrSolo && (
        <NumberFormControl
          isDisabled={bitcoinSetFromParams}
          labelText={t('set-config.block-confirmations')}
          helperText={
            network === Network.Bitcoin
              ? t('set-config.block-confirmations-help-mainnet')
              : t('set-config.block-confirmations-help')
          }
          warningText={t('set-config.block-confirmations-warning')}
          recommendedMin={5}
          min={network === Network.Bitcoin ? 5 : 0}
          max={200}
          value={blockConfirmations}
          onChange={(value) => {
            setBlockConfirmations(value);
          }}
        />
      )}
      <FormControl isDisabled={networkSetFromParams}>
        <FormLabel>
          {t('set-config.bitcoin-network')}{' '}
          {networkSetFromParams && t('set-config.read-from-env')}
        </FormLabel>
        <Select
          placeholder={`${t('set-config.select-network')}`}
          value={network !== null ? network : ''}
          onChange={(ev) => {
            const value = ev.currentTarget.value;
            setNetwork(value as unknown as Network);
          }}
        >
          {Object.entries(Network).map(([label, value]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </FormControl>
      <FormControl isDisabled={bitcoinSetFromParams}>
        <FormLabel>
          {t('set-config.bitcoin-rpc-kind')}{' '}
          {bitcoinSetFromParams && t('set-config.read-from-env')}
        </FormLabel>
        <Select
          value={bitcoinRpc.kind}
          onChange={(ev) => {
            setBitcoinRpc({
              ...bitcoinRpc,
              kind: ev.target.value as BitcoinRpcKind,
            });
          }}
        >
          {Object.entries(BitcoinRpcKind).map(([label, value]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </FormControl>
      <FormControl isDisabled={bitcoinSetFromParams}>
        <FormLabel>
          {t('set-config.bitcoin-rpc')}{' '}
          {bitcoinSetFromParams && t('set-config.read-from-env')}
        </FormLabel>
        <Input
          value={bitcoinRpc.url}
          onChange={(ev) => {
            setBitcoinRpc({ ...bitcoinRpc, url: ev.currentTarget.value });
          }}
        />
        {!bitcoinSetFromParams && (
          <FormHelperText>{t('set-config.set-rpc-help')}</FormHelperText>
        )}
      </FormControl>
    </FormGroup>
  );
};
