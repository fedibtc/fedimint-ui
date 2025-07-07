import React, { useState, useMemo } from 'react';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Text,
  Flex,
  Box,
  Icon,
  Tooltip,
  Divider,
  Input,
  useDisclosure,
} from '@chakra-ui/react';
import { useTranslation } from '@fedimint/utils';
import { useToast } from '@fedimint/ui';
import { SignedApiAnnouncement } from '@fedimint/types';
import { normalizeUrl } from '../../../utils';
import { FiCheckCircle, FiAlertTriangle, FiEdit2 } from 'react-icons/fi';
import { useGuardianAdminApi } from '../../../../hooks';

interface SignApiAnnouncementProps {
  ourPeer: { id: number; name: string };
  signedApiAnnouncements: Record<string, SignedApiAnnouncement>;
  currentApiUrl: string;
}

export const SignApiAnnouncement: React.FC<SignApiAnnouncementProps> = ({
  ourPeer,
  signedApiAnnouncements,
  currentApiUrl,
}) => {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const api = useGuardianAdminApi();
  const toast = useToast();
  const [apiUrl, setApiUrl] = useState(currentApiUrl);
  const [isEditing, setIsEditing] = useState(false);
  const [isSigningNew, setIsSigningNew] = useState(false);

  const normalizedCurrentUrl = normalizeUrl(apiUrl);
  const normalizedAnnouncedUrl = normalizeUrl(
    signedApiAnnouncements[ourPeer.id.toString()]?.api_announcement?.api_url ||
      ''
  );

  const announcementMatches = useMemo(() => {
    return normalizedCurrentUrl === normalizedAnnouncedUrl;
  }, [normalizedCurrentUrl, normalizedAnnouncedUrl]);

  const handleSignNewAnnouncement = async () => {
    setIsSigningNew(true);
    try {
      await api.signApiAnnouncement(apiUrl);
      toast.success(
        t('admin.danger-zone.sign-api-announcement.label'),
        t('admin.danger-zone.sign-api-announcement.description')
      );
      onClose();
    } catch (error) {
      console.error('Failed to sign API announcement:', error);
      toast.error(
        t('federation-dashboard.danger-zone.sign-api-announcement.error-title'),
        t(
          'federation-dashboard.danger-zone.sign-api-announcement.error-description'
        )
      );
    } finally {
      setIsSigningNew(false);
    }
  };

  const handleEditApiUrl = () => {
    setIsEditing(true);
  };

  const handleSaveApiUrl = () => {
    setIsEditing(false);
  };

  const handleClose = () => {
    setIsEditing(false);
    setApiUrl(currentApiUrl);
    onClose();
  };

  return (
    <>
      <Button
        size={['sm', 'md']}
        bg='red.500'
        _hover={{ bg: 'red.600' }}
        onClick={onOpen}
      >
        {t('federation-dashboard.danger-zone.sign-api-announcement.title')}
      </Button>
      <Modal isOpen={isOpen} onClose={handleClose} size='lg'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader bg='blue.50' borderTopRadius='md'>
            {t('federation-dashboard.danger-zone.sign-api-announcement.title')}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <Flex direction='column' gap={4}>
              <Box borderWidth={1} borderRadius='md' p={4} bg='gray.50'>
                <Text fontWeight='bold' mb={2}>
                  {t(
                    'federation-dashboard.danger-zone.sign-api-announcement.current-api-url'
                  )}
                </Text>
                {isEditing ? (
                  <Input
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    onBlur={handleSaveApiUrl}
                    fontFamily='mono'
                  />
                ) : (
                  <Flex align='center'>
                    <Text fontFamily='mono' flex={1}>
                      {apiUrl}
                    </Text>
                    <Icon
                      as={FiEdit2}
                      color='blue.500'
                      boxSize={4}
                      cursor='pointer'
                      onClick={handleEditApiUrl}
                    />
                  </Flex>
                )}
              </Box>
              <Box borderWidth={1} borderRadius='md' p={4} bg='gray.50'>
                <Text fontWeight='bold' mb={2}>
                  {t(
                    'federation-dashboard.danger-zone.sign-api-announcement.announced-api-url'
                  )}
                </Text>
                <Text fontFamily='mono' flex={1}>
                  {signedApiAnnouncements[ourPeer.id.toString()]
                    ?.api_announcement?.api_url ||
                    t(
                      'federation-dashboard.danger-zone.sign-api-announcement.no-announcement'
                    )}
                </Text>
              </Box>
              <Divider my={2} />
              <Flex align='center' gap={2}>
                <Icon
                  as={announcementMatches ? FiCheckCircle : FiAlertTriangle}
                  color={announcementMatches ? 'green.500' : 'orange.500'}
                  boxSize={6}
                />
                <Text
                  fontWeight='medium'
                  color={announcementMatches ? 'green.600' : 'orange.600'}
                >
                  {announcementMatches
                    ? t(
                        'federation-dashboard.danger-zone.sign-api-announcement.urls-match'
                      )
                    : t(
                        'federation-dashboard.danger-zone.sign-api-announcement.urls-mismatch'
                      )}
                </Text>
              </Flex>
            </Flex>
          </ModalBody>

          <ModalFooter bg='gray.50' borderBottomRadius='md'>
            {!announcementMatches && (
              <Tooltip
                label={t(
                  'federation-dashboard.danger-zone.sign-api-announcement.sign-tooltip'
                )}
              >
                <Button
                  colorScheme='blue'
                  mr={3}
                  onClick={handleSignNewAnnouncement}
                  isLoading={isSigningNew}
                  loadingText={t(
                    'federation-dashboard.danger-zone.sign-api-announcement.signing-in-progress'
                  )}
                >
                  {t(
                    'federation-dashboard.danger-zone.sign-api-announcement.sign-button'
                  )}
                </Button>
              </Tooltip>
            )}
            <Button variant='ghost' onClick={handleClose}>
              {t('common.close')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
