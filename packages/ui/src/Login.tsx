import React, { useCallback, useState } from 'react';
import {
  Box,
  Input,
  FormControl,
  Button,
  Flex,
  FormErrorMessage,
  Heading,
  InputRightElement,
  InputGroup,
  Text,
} from '@chakra-ui/react';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import { useTranslation } from '@fedimint/utils';

interface LoginProps {
  serviceId: string;
  checkAuth: (password: string) => Promise<boolean>;
  setAuthenticated: () => void;
  parseError: (err: unknown) => string;
}

export const Login: React.FC<LoginProps> = ({
  serviceId,
  checkAuth,
  setAuthenticated,
  parseError,
}) => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = useCallback(
    async (ev: React.FormEvent) => {
      ev.preventDefault();

      setLoading(true);
      try {
        const isValid = await checkAuth(password);
        if (isValid) {
          setAuthenticated();
        } else {
          setError(t('login.errors.invalid-password'));
        }
      } catch (err: unknown) {
        console.error({ err });
        setError(parseError(err));
      }
      setLoading(false);
    },
    [password, checkAuth, setAuthenticated, parseError, t]
  );

  return (
    <Box width={{ base: '100%' }} maxW={'440px'} p={3} mt={3}>
      <form onSubmit={handleSubmit}>
        <Flex direction='column' gap={4} width='100%'>
          <Flex direction='column' align='start' gap={4}>
            <Box>
              <Heading size='sm' fontWeight='medium' mb={1}>
                {t('login.title')}
              </Heading>
              <Text size='sm'>{t('login.help')}</Text>
            </Box>
          </Flex>
          <FormControl isInvalid={!!error} maxW='480px'>
            <InputGroup size='md'>
              <Input
                id={`password-${serviceId}`}
                placeholder={t('login.password')}
                name={`password-${serviceId}`}
                pr='4.5rem'
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(ev) => setPassword(ev.currentTarget.value)}
                autoComplete='off'
              />
              <InputRightElement onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
              </InputRightElement>
            </InputGroup>
            {error && <FormErrorMessage>{error}</FormErrorMessage>}
          </FormControl>
          <Button isLoading={loading} type='submit'>
            {t('login.submit')}
          </Button>
        </Flex>
      </form>
    </Box>
  );
};
