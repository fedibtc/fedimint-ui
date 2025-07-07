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

    // Warning for very long invoices (might be spam or malicious)
    if (invoice.length > 1000) {
      toast.warning(
        'Long Invoice Warning',
        'This invoice is unusually long. Please verify it is correct.'
      );
    }

    // Info toast for unimplemented feature
    toast.info(
      'Feature Not Implemented',
      'Lightning payments are not yet implemented'
    );
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
