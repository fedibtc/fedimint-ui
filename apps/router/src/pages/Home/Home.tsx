import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  Button,
  Flex,
  Icon,
  Input,
  Link,
  Stack,
  Text,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';
import { sha256Hash, useTranslation } from '@fedimint/utils';
import { FaDiscord, FaGithub } from 'react-icons/fa';
import { FiX } from 'react-icons/fi';
import { APP_ACTION_TYPE } from '../../context/AppContext';
import { useAppContext } from '../../hooks';
import { useQuery } from '../../hooks';
import HeroSvg from '../../images/hero-1.svg';
import { getServiceType } from '../../helpers/service';
import { LATEST_RELEASE_TAG } from '../../constants';
import { Logo } from '../../components/Logo';

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const query = useQuery();

  const { dispatch, service } = useAppContext();

  const [serviceUrl, setServiceUrl] = useState<string>('');
  const [isGateway, setIsGateway] = useState(false);

  useEffect(() => {
    setIsGateway(false);
  }, [serviceUrl]);

  // If url query param provided then set this in input
  // as priority, otherwise fallback to url in state and then empty string
  useEffect(() => {
    const url = query.get('url') || service?.config.baseUrl || '';
    setServiceUrl(url);
  }, [query, service]);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setServiceUrl(url.trim());
  };

  const handleOnConnect = async () => {
    const id = await sha256Hash(serviceUrl);
    const serviceType = getServiceType(serviceUrl);

    if (!serviceType) return;

    if (serviceType === 'gateway') {
      setIsGateway(true);
      return;
    }

    dispatch({
      type: APP_ACTION_TYPE.ADD_SERVICE,
      payload: { service: { config: { id, baseUrl: serviceUrl } } },
    });

    return navigate(`/guardians/${id}`);
  };

  const handleOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const { key } = e;

    switch (key) {
      case 'Enter':
        handleOnConnect();
        return;
      case 'Escape':
        setServiceUrl('');
        return;
    }
  };

  return (
    <Box width='100%' minHeight='100vh' display='flex' userSelect='none'>
      {/* Left */}
      <Box
        position='relative'
        flex='1'
        backgroundColor='#F8F8F8'
        display={{ base: 'none', lg: 'flex' }}
        alignItems='center'
        justifyContent='center'
        bgImage={HeroSvg}
        bgPosition='center'
        bgSize='contain'
        bgRepeat='no-repeat'
      >
        <Box position='fixed' left='5' top='5'>
          <Text fontSize='14px' fontWeight='500' color='#555'>
            <Link href='https://fedimint.org' target='_blank' mr='1'>
              &copy; Fedimint
            </Link>
            /
            <Link
              href={`https://github.com/fedimint/ui/releases/tag/${LATEST_RELEASE_TAG}`}
              target='_blank'
              ml='1'
            >
              {LATEST_RELEASE_TAG}
            </Link>
          </Text>
        </Box>
      </Box>

      {/* Right */}
      <Box
        background='#FFFFFF'
        flex='1'
        display='flex'
        alignItems='center'
        justifyContent='center'
        flexDirection='column'
      >
        <Logo />
        <Text mt='5' fontSize='28'>
          {t('home.title')}
        </Text>
        <Box
          maxWidth='720px'
          width='100%'
          px={{ base: '20px', lg: '80px' }}
          py={{ base: '40px', lg: '80px' }}
          textAlign={{ base: 'center', lg: 'left' }}
          boxSizing='border-box'
        >
          <Stack gap='3' mb='5'>
            {isGateway && (
              <Alert status='error' textAlign='left'>
                <AlertIcon />
                <Flex direction='column'>
                  <AlertTitle>{t('login.alert-title')}</AlertTitle>
                  <AlertDescription>
                    {t('login.alert-description')}
                  </AlertDescription>
                </Flex>
              </Alert>
            )}
            <InputGroup>
              <Input
                name='url'
                autoFocus
                variant='outline'
                placeholder='e.g. wss://fedimintd-url.com'
                value={serviceUrl}
                onChange={handleOnChange}
                onKeyDown={handleOnKeyDown}
              />
              {serviceUrl.length > 0 && (
                <InputRightElement>
                  <FiX
                    onClick={() => setServiceUrl('')}
                    style={{ cursor: 'pointer' }}
                  />
                </InputRightElement>
              )}
            </InputGroup>
            <Button
              aria-label='connect-button'
              colorScheme='blue'
              onClick={handleOnConnect}
              isLoading={false}
            >
              Connect
            </Button>
          </Stack>
          <Text fontSize='14px'>
            {t('home.learn-more-link')}
            <Link
              href='https://fedimint.org/'
              isExternal
              color='blue.500'
              textAlign='center'
              ml='1'
            >
              click here
            </Link>
          </Text>
          <Text fontSize='14px' mb='5'>
            {t('home.contribute-link')}
            <Link
              href='https://github.com/fedimint/fedimint'
              isExternal
              color='blue.500'
              textAlign='center'
              ml='1'
            >
              click here
            </Link>
          </Text>

          <Link href='https://chat.fedimint.org/' isExternal>
            <Icon fontSize='24px' mr='2'>
              <FaDiscord />
            </Icon>
          </Link>
          <Link href='https://github.com/fedimint' isExternal>
            <Icon fontSize='22px'>
              <FaGithub />
            </Icon>
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default HomePage;
