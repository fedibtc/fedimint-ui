import React, { useState } from 'react';
import {
  Box,
  Button,
  Heading,
  Stack,
  Text,
  Textarea,
  Modal,
  ModalBody,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
} from '@chakra-ui/react';
import { GatewayInfo } from '@fedimint/types';
import { useTranslation } from '@fedimint/utils';
import { useGatewayApi, useGatewayContext, useGatewayInfo } from '../../hooks';
import { GATEWAY_APP_ACTION_TYPE } from '../../types/gateway';
import { useTheme } from '@fedimint/ui';

export type ConnectFederationModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const ConnectFederationModal = React.memo(
  function ConnectFederationModal({
    isOpen,
    onClose,
  }: ConnectFederationModalProps) {
    const { t } = useTranslation();
    const api = useGatewayApi();
    const { dispatch } = useGatewayContext();
    const gatewayInfo = useGatewayInfo();
    const [connectInfo, setConnectInfo] = useState<string>('');
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const theme = useTheme();

    const handleInputString = (
      event: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
      event.preventDefault();
      setConnectInfo(event.target.value);
    };

    const handleConnectFederation = () => {
      setLoading(true);
      api
        .connectFederation(connectInfo.trim())
        .then((federation) => {
          dispatch({
            type: GATEWAY_APP_ACTION_TYPE.SET_GATEWAY_INFO,
            payload: {
              ...gatewayInfo,
              federations: [...gatewayInfo.federations, federation],
            } as GatewayInfo,
          });
          setConnectInfo('');
        })
        .catch(({ message, error }) => {
          console.error(error);
          setErrorMsg(message);
        })
        .finally(() => {
          setLoading(false);
        });
    };

    return (
      <Modal
        isOpen={isOpen}
        onClose={() => {
          // Don't allow closing the modal while loading.
          if (!loading) {
            onClose();
          }
        }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <br />
          <ModalBody>
            <Stack spacing='32px'>
              <Box>
                <Heading
                  fontSize='28px'
                  size='md'
                  fontWeight='medium'
                  color={theme.colors.gray[900]}
                >
                  {t('connect-federation.heading')}
                </Heading>
                <Text size='md' fontWeight='medium' pt='4px'>
                  {t('connect-federation.sub-heading')}
                </Text>
              </Box>
              <Textarea
                placeholder={t(
                  'connect-federation.connection-string-placeholder'
                )}
                _placeholder={{
                  fontSize: 'md',
                  color: `${theme.colors.gray[500]}`,
                  fontFamily: `${theme.fonts.body}`,
                }}
                h='60px'
                p='14px'
                boxShadow={theme.shadows.xs}
                border={`1px solid ${theme.colors.gray[300]}`}
                bgColor={theme.colors.white}
                value={connectInfo}
                onChange={(event) => handleInputString(event)}
              />
              <Button
                borderRadius='8px'
                isDisabled={!connectInfo}
                onClick={handleConnectFederation}
                isLoading={loading}
                loadingText={t('connect-federation.progress-modal-text')}
              >
                {t('connect-federation.connect-federation-button')}
              </Button>
              <Box color='red.500'>{errorMsg}</Box>
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }
);
