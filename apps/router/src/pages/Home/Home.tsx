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
import { getVersionInfo } from '@fedimint/router/src/constants/Version';
import { sha256Hash, useTranslation } from '@fedimint/utils';
import { FaDiscord, FaGithub } from 'react-icons/fa';
import { FiX } from 'react-icons/fi';
import { APP_ACTION_TYPE } from '../../context/AppContext';
import { useAppContext } from '../../hooks';
import HeroSvg from '../../images/hero-1.svg';
import { getServiceType } from '../../helpers/service';
import { Logo } from '../../components/Logo';
import { Service } from '../../types';

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { dispatch, services } = useAppContext();
  const version = getVersionInfo();

  const [serviceUrl, setServiceUrl] = useState<string>('');
  const [isGateway, setIsGateway] = useState(false);

  useEffect(() => {
    setIsGateway(false);
  }, [serviceUrl]);

  useEffect(() => {
    if (Object.keys(services).length === 0) {
      setServiceUrl('');
      return;
    }

    Object.values(services).forEach((service: Service) => {
      setServiceUrl(service.config.baseUrl);
    });
  }, [services]);

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
      payload: { id, service: { config: { id, baseUrl: serviceUrl } } },
    });

    return navigate(`/guardians/${id}`);
  };

  const handleOnDelete = () => {
    dispatch({
      type: APP_ACTION_TYPE.REMOVE_SERVICE,
    });
  };

  return (
    <Box width='100%' minHeight='100vh' display='flex'>
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
        bgSize='cover'
        bgRepeat='no-repeat'
      >
        <Box position='fixed' left='5' top='5'>
          <Text fontSize='14px' fontWeight='500' color='#555'>
            <Link href='https://fedimint.org' target='_blank' mr='1'>
              &copy; Fedimint
            </Link>
            /
            <Link href={version.url} target='_blank' ml='1'>
              v0.5.0
            </Link>
          </Text>
        </Box>
      </Box>

      {/* Right */}
      <Box
        background='#FFFFF'
        flex='1'
        display='flex'
        alignItems='center'
        justifyContent='center'
        flexDirection='column'
      >
        <Logo />
        <Text mt='5' fontSize='28'>
          {t('login.title')}
        </Text>
        <Box
          maxWidth='720px'
          width='100%'
          p={{ base: '40px', lg: '80px' }}
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
                variant='outline'
                placeholder={t('home.guardian-url')}
                value={serviceUrl}
                onChange={handleOnChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleOnConnect();
                  }
                }}
              />
              {serviceUrl.length > 0 && (
                <InputRightElement>
                  <FiX onClick={handleOnDelete} style={{ cursor: 'pointer' }} />
                </InputRightElement>
              )}
            </InputGroup>
            <Button
              colorScheme='blue'
              onClick={handleOnConnect}
              isLoading={false}
            >
              Connect
            </Button>
          </Stack>
          <Text fontSize='14px' mb='5'>
            {t('home.learn-more-link')}
            <Link
              href='https://github.com/fedimint/fedimint'
              isExternal
              color='blue.500'
              textAlign='center'
              ml='1'
            >
              here
            </Link>
            .
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
