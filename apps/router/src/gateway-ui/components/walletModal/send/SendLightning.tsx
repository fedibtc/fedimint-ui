import React, { useCallback, useState } from 'react';
import { Flex, Input, Button, FormControl, FormLabel } from '@chakra-ui/react';
import { useTranslation } from '@fedimint/utils';
import { useToast } from '@fedimint/ui';
import FederationSelector from '../FederationSelector';

const SendLightning: React.FC = () => {
  const { t } = useTranslation();
  const [invoice, setInvoice] = useState('');
  const toast = useToast();

  const handleSendLightning = useCallback(() => {
    if (!invoice) {
      toast.error(t('wallet-modal.send.lightning-invoice-error'));
      return;
    }

    toast.info('Unimplemented');
  }, [invoice, t, toast]);

  return (
    <Flex direction='column' gap={4}>
      <FederationSelector />
      <FormControl>
        <FormLabel>{t('wallet-modal.send.lightning-invoice')}</FormLabel>
        <Input
          placeholder={t('wallet-modal.send.lightning-invoice-placeholder')}
          value={invoice}
          onChange={(e) => setInvoice(e.target.value)}
        />
      </FormControl>
      <Button onClick={handleSendLightning} colorScheme='blue'>
        {t('wallet-modal.send.pay-invoice')}
      </Button>
    </Flex>
  );
};

export default SendLightning;
