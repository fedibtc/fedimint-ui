import React, { useState, FC } from 'react';
import {
  Box,
  Button,
  Heading,
  Stack,
  Text,
  Flex,
  Textarea,
  Modal,
  ModalBody,
  ModalOverlay,
  ModalContent,
  CircularProgressLabel,
  CircularProgress,
  ModalCloseButton,
} from '@chakra-ui/react';
import { FederationInfo } from '@fedimint/types';
import { useTranslation } from '@fedimint/utils';
import { useGatewayApi } from '../../../hooks';
import { useTheme } from '@fedimint/ui';

export interface ConnectFedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectFedModal: FC<ConnectFedModalProps> = ({
  isOpen,
  onClose,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <div>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalBody>
            <Flex
              bgColor={theme.colors.white}
              padding='48px'
              justifyContent='center'
              alignItems='center'
              height='340px'
              maxW='400px'
            >
              <CircularProgress
                isIndeterminate={true}
                color={theme.colors.blue[600]}
                size='240px'
                thickness='10px'
                capIsRound={true}
              >
                <CircularProgressLabel
                  fontSize='md'
                  fontWeight='500'
                  color={theme.colors.gray[600]}
                  fontFamily={theme.fonts.body}
                  textAlign='center'
                  width='130px'
                >
                  {t('connect-federation.progress-modal-text')}
                </CircularProgressLabel>
              </CircularProgress>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export type ConnectFederationProps = {
  isOpen: boolean;
  onClose: () => void;
  renderConnectedFedCallback: (federation: FederationInfo) => void;
};

export const ConnectFederation = React.memo(function ConnectFederation({
  renderConnectedFedCallback,
  isOpen,
  onClose,
}: ConnectFederationProps) {
  const { t } = useTranslation();
  const api = useGatewayApi();
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [connectInfo, setConnectInfo] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const handleInputString = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    event.preventDefault();
    setConnectInfo(event.target.value);
  };

  const handleConnectFederation = () => {
    setLoading(true);
    api
      .connectFederation(connectInfo.trim())
      .then((federation) => {
        renderConnectedFedCallback(federation);
        setConnectInfo('');
      })
      .catch(({ message, error }) => {
        console.error(error);
        setErrorMsg(t('connect-federation.error-message', { error: message }));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
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
              maxW='210px'
              isDisabled={!connectInfo}
              onClick={handleConnectFederation}
            >
              {t('connect-federation.connect-federation-button')}
            </Button>
            <Box color='red.500'>{errorMsg}</Box>
          </Stack>
          <ConnectFedModal isOpen={loading} onClose={() => !loading} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
});
