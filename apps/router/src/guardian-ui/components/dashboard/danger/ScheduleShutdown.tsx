import React, { useState } from 'react';
import {
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Flex,
  Button,
} from '@chakra-ui/react';
import { useTranslation } from '@fedimint/utils';
import { NumberFormControl } from '../../NumberFormControl';
import { useTheme } from '@fedimint/ui';

interface ScheduleShutdownProps {
  latestSession: number;
}

export const ScheduleShutdown: React.FC<ScheduleShutdownProps> = ({
  latestSession,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [sessionToShutdown, setSessionToShutdown] = useState<number>(
    latestSession + 1000
  );

  const handleOpen = () => {
    setIsOpen(true);
    setIsConfirmed(false);
  };
  const handleClose = () => setIsOpen(false);

  const handleConfirm = () => {
    setIsConfirmed(true);
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        size={['sm', 'md']}
        bg={theme.colors.red[500]}
        _hover={{ bg: theme.colors.red[600] }}
      >
        {t('federation-dashboard.danger-zone.schedule-shutdown.label')}
      </Button>
      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent minH='0'>
          <ModalHeader alignSelf='center'>
            {t('federation-dashboard.danger-zone.schedule-shutdown.title')}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {!isConfirmed ? (
              <Flex
                justifyContent='center'
                alignItems='center'
                direction='column'
              >
                <Text mb={4}>
                  {t(
                    'federation-dashboard.danger-zone.schedule-shutdown.description'
                  )}
                </Text>
                <Text mb={4}>
                  {t(
                    'federation-dashboard.danger-zone.schedule-shutdown.current-session'
                  ) +
                    ' : ' +
                    latestSession}
                </Text>
                <NumberFormControl
                  value={sessionToShutdown}
                  min={latestSession + 10}
                  labelText={t(
                    'federation-dashboard.danger-zone.schedule-shutdown.session-to-shutdown'
                  )}
                  helperText={t(
                    'federation-dashboard.danger-zone.schedule-shutdown.session-to-shutdown-helper'
                  )}
                  recommendedMin={latestSession + 50}
                  onChange={(value) => setSessionToShutdown(Number(value))}
                />
                <Flex
                  justifyContent='center'
                  gap={4}
                  direction={['column', 'row']}
                >
                  <Button
                    colorScheme='blue'
                    mr={3}
                    size={['sm', 'md']}
                    onClick={handleClose}
                  >
                    {t('federation-dashboard.danger-zone.cancel')}
                  </Button>
                  <Button
                    variant='ghost'
                    size={['sm', 'md']}
                    onClick={handleConfirm}
                  >
                    {t(
                      'federation-dashboard.danger-zone.schedule-shutdown.confirm-shutdown'
                    )}
                  </Button>
                </Flex>
              </Flex>
            ) : (
              <Flex
                justifyContent='center'
                alignItems='center'
                direction='column'
              >
                <Text fontWeight={'bold'} color={'red'} mt={4}>
                  {t(
                    'federation-dashboard.danger-zone.schedule-shutdown.title'
                  )}
                </Text>
              </Flex>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
