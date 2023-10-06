import React, { useCallback, useState } from 'react';
import {
  Box,
  Button,
  Input,
  InputGroup,
  NumberInput,
  NumberInputField,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  VStack,
  useTheme,
} from '@chakra-ui/react';
import {
  useTranslation,
  formatEllipsized,
  formatMsatsToBtc,
  MSats,
} from '@fedimint/utils';
import { ApiContext } from '../ApiProvider';
import { GatewayCard } from '.';

export interface WithdrawCardProps {
  federationId: string;
  balanceMsat: number;
}

export const WithdrawCard = React.memo(function WithdrawCard({
  federationId,
  balanceMsat,
}: WithdrawCardProps): JSX.Element {
  const { t } = useTranslation();
  const theme = useTheme();
  const { gateway } = React.useContext(ApiContext);

  const [error, setError] = useState<string>('');
  const [modalState, setModalState] = useState<boolean>(false);
  const [address, setAddress] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);

  const createWithdrawal = useCallback(() => {
    if (amount <= 0) {
      return setError(`${t('withdraw-card.error-amount')}`);
    }
    if (!address) {
      return setError(`${t('withdraw-card.error-address')}`);
    }
    setError('');
    setModalState(true);
  }, [amount, address, t]);

  const startWithdrawal = useCallback(() => {
    gateway
      .requestWithdrawal(federationId, amount, address)
      .then((txId) => {
        alert(`${t('withdraw-card.your-transaction')} ${txId}`);
        setAddress('');
        setAmount(0);
        setModalState(false);
      })
      .catch(({ error }) => {
        console.error(error);
        setError(`${t('withdraw-card.error-request')}`);
      });
  }, [gateway, federationId, amount, address, t]);

  return (
    <>
      <GatewayCard
        title={t('withdraw-card.card-header')}
        description={`${t('withdraw-card.total_bitcoin')} ${formatMsatsToBtc(
          balanceMsat as MSats
        )} ${t('common.btc')}`}
      >
        <Stack spacing='20px'>
          <InputGroup flexDir='column'>
            <Text
              fontSize='sm'
              fontWeight='500'
              color={theme.colors.gray[700]}
              fontFamily={theme.fonts.body}
              pb='6px'
            >
              {`${t('common.amount')} ${t('common.sats')}`}
            </Text>
            <NumberInput
              min={0}
              max={balanceMsat / 1000}
              value={amount}
              onChange={(value) => {
                value && setAmount(parseInt(value));
              }}
            >
              <NumberInputField
                height='44px'
                p='14px'
                border={`1px solid ${theme.colors.gray[300]}`}
                bgColor={theme.colors.white}
                boxShadow={theme.shadows.xs}
                borderRadius='8px'
                w='100%'
              />
            </NumberInput>
            <Text
              mt='4px'
              cursor='pointer'
              fontSize='sm'
              color={theme.colors.blue[600]}
              fontFamily={theme.fonts.body}
              onClick={() => setAmount(balanceMsat / 1000)}
            >
              {t('withdraw-card.withdraw_all')}
            </Text>
          </InputGroup>
          <InputGroup flexDir='column'>
            <Text
              fontSize='sm'
              fontWeight='500'
              color={theme.colors.gray[700]}
              fontFamily={theme.fonts.body}
              pb='6px'
            >
              {t('common.address')}
            </Text>
            <Input
              height='44px'
              p='14px'
              border={`1px solid ${theme.colors.gray[300]}`}
              bgColor={theme.colors.white}
              boxShadow={theme.shadows.xs}
              borderRadius='8px'
              w='100%'
              placeholder={t('withdraw-card.address-placeholder')}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              name='address'
            />
          </InputGroup>

          {error && (
            <Box>
              <Text textAlign='center' color='red' fontSize='14'>
                {t('withdraw-card.error')}: {error}
              </Text>
            </Box>
          )}

          <Button
            borderRadius='8px'
            maxW='145px'
            isDisabled={!address}
            fontSize='sm'
            onClick={createWithdrawal}
          >
            {t('withdraw-card.card-header')}
          </Button>
        </Stack>
      </GatewayCard>

      {modalState && (
        <ConfirmWithdrawModal
          open={modalState}
          txRequest={{ amount, address }}
          onModalClickCallback={() => {
            setModalState(false);
          }}
          onCloseClickCallback={() => {
            setModalState(false);
          }}
          startWithdrawalCallback={startWithdrawal}
        />
      )}
    </>
  );
});

export interface ConfirmWithdrawModalProps {
  open: boolean;
  txRequest: {
    amount: number;
    address: string;
  };
  onModalClickCallback: () => void;
  onCloseClickCallback: () => void;
  startWithdrawalCallback: () => void;
}

const ConfirmWithdrawModal = (
  props: ConfirmWithdrawModalProps
): JSX.Element => {
  const { t } = useTranslation();
  const { open, txRequest, onModalClickCallback, startWithdrawalCallback } =
    props;

  return (
    <div>
      <>
        <Modal onClose={onModalClickCallback} isOpen={open} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{t('withdraw-card.confirm-withdraw')}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack alignItems='flex-start' justifyContent='space-between'>
                <Box>
                  <Text>{t('common.amount')}:</Text>
                  <Text>
                    {txRequest.amount} {t('common.sats')}
                  </Text>
                </Box>
                <Text>{t('withdraw-card.to')}</Text>
                <Box>
                  <Text>{t('common.address')}:</Text>
                  <Text>{formatEllipsized(txRequest.address)}</Text>
                </Box>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button
                onClick={() => {
                  if (startWithdrawalCallback) {
                    startWithdrawalCallback();
                  }
                }}
                fontSize={{ base: '12px', md: '13px', lg: '16px' }}
                p={{ base: '10px', md: '13px', lg: '16px' }}
              >
                {t('common.confirm')}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    </div>
  );
};

export interface TransactionViewProps {
  amount: number;
  address: string;
  txId: string;
  confirmationsRequired: number;
  federationId?: string;
}

export interface TransactionInfoProps {
  title: string;
  detail?: string | number;
  children?: React.ReactNode;
  onClick?: () => void;
  color?: string;
}
