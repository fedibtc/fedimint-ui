import React, { useState } from 'react';
import { Flex, Input, Button, FormControl, FormLabel } from '@chakra-ui/react';
import { useTranslation } from '@fedimint/utils';
import { WalletModalState } from '../WalletModal';
import { FederationInfo, Sats } from '@fedimint/types';
import FederationSelector from '../FederationSelector';
import { AmountInput } from '..';
import SendOnchainSuccess from './SendOnchainSuccess';
import { useGatewayApi } from '../../../../context/hooks';
import { useNotification } from '../../../../home/NotificationProvider';

interface SendOnchainProps {
  federations: FederationInfo[];
  walletModalState: WalletModalState;
  setWalletModalState: (state: WalletModalState) => void;
  setShowSelector: (show: boolean) => void;
}

const SendOnchain: React.FC<SendOnchainProps> = ({
  federations,
  walletModalState,
  setWalletModalState,
  setShowSelector,
}) => {
  const { t } = useTranslation();
  const api = useGatewayApi();
  const [bitcoinAddress, setBitcoinAddress] = useState('');
  const [amountSats, setAmountSats] = useState<Sats>(0 as Sats);
  const [successTxid, setSuccessTxid] = useState<string | null>(null);
  const { showError } = useNotification();

  const handlePegOut = async () => {
    if (!walletModalState.selectedFederation) {
      showError(t('wallet-modal.send.select-federation'));
      return;
    }

    if (!bitcoinAddress) {
      showError(t('wallet-modal.send.enter-bitcoin-address'));
      return;
    }

    if (amountSats <= 0) {
      showError(t('wallet-modal.send.enter-valid-amount'));
      return;
    }

    try {
      const txid = await api.submitPegOut({
        federationId: walletModalState.selectedFederation.federation_id,
        satAmountOrAll: amountSats,
        address: bitcoinAddress,
      });
      setShowSelector(false);
      setSuccessTxid(txid);
    } catch (error) {
      console.error('Peg-out error:', error);
      showError(
        t('wallet-modal.send.peg-out-error', {
          description: error instanceof Error ? error.message : String(error),
        })
      );
    }
  };

  if (successTxid) {
    return (
      <SendOnchainSuccess
        txid={successTxid}
        amount={amountSats}
        address={bitcoinAddress}
      />
    );
  }

  return (
    <Flex direction='column' gap={4}>
      <FederationSelector
        federations={federations}
        walletModalState={walletModalState}
        setWalletModalState={setWalletModalState}
      />
      <FormControl>
        <FormLabel>{t('wallet-modal.send.to-onchain-address')}</FormLabel>
        <Input
          placeholder={t('wallet-modal.send.address-placeholder')}
          value={bitcoinAddress}
          onChange={(e) => setBitcoinAddress(e.target.value)}
        />
      </FormControl>
      <AmountInput amount={amountSats} setAmount={setAmountSats} unit='sats' />
      <Button onClick={handlePegOut} colorScheme='blue'>
        {t('wallet-modal.send.peg-out-to-onchain')}
      </Button>
    </Flex>
  );
};

export default SendOnchain;
