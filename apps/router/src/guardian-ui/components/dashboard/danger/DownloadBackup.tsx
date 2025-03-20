import React, { useState } from 'react';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Text,
  Flex,
} from '@chakra-ui/react';
import { useTranslation } from '@fedimint/utils';
import { hexToBlob } from '../../../utils/api';
import { useGuardianAdminApi } from '../../../../hooks';
import { theme } from '../../../../../../../packages/ui/src/theme';

export const DownloadBackup: React.FC = () => {
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const api = useGuardianAdminApi();
  const { t } = useTranslation();

  const handleConfirmDownload = async () => {
    const response = await api.downloadGuardianBackup();
    const blob = hexToBlob(response.tar_archive_bytes, 'application/x-tar');
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'guardianBackup.tar');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsWarningModalOpen(false);
  };

  return (
    <>
      <Button
        size={['sm', 'md']}
        bg={theme.colors.red[500]}
        _hover={{ bg: theme.colors.red[600] }}
        onClick={() => setIsWarningModalOpen(true)}
      >
        {t('federation-dashboard.danger-zone.backup.title')}
      </Button>
      <Modal
        isOpen={isWarningModalOpen}
        onClose={() => setIsWarningModalOpen(false)}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader alignSelf='center'>
            {t('federation-dashboard.danger-zone.backup.title')}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Text mb={4}>
              {t('federation-dashboard.danger-zone.backup.warning-text')}
            </Text>
            <Flex justifyContent='center' gap={4} direction={['column', 'row']}>
              <Button
                colorScheme='blue'
                mr={3}
                size={['sm', 'md']}
                onClick={() => setIsWarningModalOpen(false)}
              >
                {t('federation-dashboard.danger-zone.cancel')}
              </Button>
              <Button
                variant='ghost'
                size={['sm', 'md']}
                onClick={() => {
                  handleConfirmDownload().finally(() =>
                    setIsWarningModalOpen(false)
                  );
                }}
              >
                {t('federation-dashboard.danger-zone.acknowledge-and-download')}
              </Button>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
