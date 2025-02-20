import React from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import { useTranslation } from '@fedimint/utils';
import WarningIcon from '../../../../assets/svgs/warning.svg?react';
import { useTrimmedInput } from '../../../../../hooks';

interface ConfirmPasswordModalProps {
  password: string;
  submitConfig: () => Promise<void>;
  isOpen: boolean;
  onClose: () => void;
  guardianName: string;
}

export const ConfirmPasswordModal: React.FC<ConfirmPasswordModalProps> = ({
  password,
  submitConfig,
  isOpen,
  onClose,
  guardianName,
}) => {
  const { t } = useTranslation();
  const [confirmPassword, setConfirmPassword] = useTrimmedInput('');
  const [confirmGuardianName, setConfirmGuardianName] = useTrimmedInput('');

  const confirmed =
    confirmPassword === password && confirmGuardianName === guardianName;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t('set-config.confirm-and-backup-password')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl>
            <FormLabel>{t('set-config.confirm-password')}</FormLabel>
            <Input
              id='confirm-password'
              type='password'
              value={confirmPassword}
              onChange={(ev) => setConfirmPassword(ev.currentTarget.value)}
              placeholder='Confirm Password'
            />
            {password !== confirmPassword && (
              <FormHelperText color='red'>
                {t('set-config.error-password-mismatch')}
              </FormHelperText>
            )}
            <Alert status='warning' mt={4}>
              <AlertIcon>
                <WarningIcon />
              </AlertIcon>
              <Box>
                <AlertTitle>
                  {t('set-config.password-warning-title')}
                </AlertTitle>
                <AlertDescription>
                  {t('set-config.password-warning')}
                </AlertDescription>
              </Box>
            </Alert>
            <FormLabel mt={4}>
              {t('set-config.acknowledge-backed-up', {
                guardianName: guardianName,
              })}
            </FormLabel>
            <Input
              type='text'
              value={confirmGuardianName}
              onChange={(ev) => setConfirmGuardianName(ev.currentTarget.value)}
              placeholder={guardianName}
            />
            {confirmGuardianName !== guardianName &&
              confirmGuardianName !== '' && (
                <FormHelperText color='red'>
                  {t('set-config.error-guardian-name-mismatch')}
                </FormHelperText>
              )}
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Flex justifyContent='flex-start' width='100%'>
            <Button
              colorScheme='blue'
              mr={3}
              onClick={() => {
                if (confirmed) {
                  onClose();
                  submitConfig();
                }
              }}
              isDisabled={!confirmed}
            >
              {t('common.next')}
            </Button>
            <Button variant='ghost' onClick={onClose}>
              {t('common.back')}
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
