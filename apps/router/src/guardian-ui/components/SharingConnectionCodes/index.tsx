import React, { useState } from 'react';
import {
  Box,
  Button,
  Center,
  Code,
  Divider,
  Flex,
  Input,
  Link,
  Heading,
  Text,
} from '@chakra-ui/react';
import { useTranslation } from '@fedimint/utils';
import {
  useGuardianDispatch,
  useGuardianSetupApi,
  useGuardianSetupContext,
  useGuardianConfig,
  useTrimmedInput,
} from '../../../hooks';
import { FiRefreshCw } from 'react-icons/fi';
import { GUARDIAN_APP_ACTION_TYPE } from '../../../types/guardian';
import { GuardianApi } from '../../../api/GuardianApi';

export const SharingConnectionCodes: React.FC = () => {
  const { t } = useTranslation();
  const api = useGuardianSetupApi();
  const { state } = useGuardianSetupContext();
  const guardianDispatch = useGuardianDispatch();
  const config = useGuardianConfig();

  const { code, password, guardianName, federationName } = state;

  const [refreshRequired, setRefreshRequired] = useState<boolean>(false);

  const handleOnSubmit = async () => {
    try {
      api.setPassword(password);
      await api.startDkg();

      setRefreshRequired(true);
    } catch (err) {
      console.log('error', err);
    }
  };

  const handleTryReconnect = async () => {
    const api = new GuardianApi(config);

    try {
      await api.connect();
      const connected = await api.testPassword(password);

      if (connected) {
        window.location.reload();
      }
    } catch {
      console.log('COULD NOT CONNECT');
    }
  };

  // page was refreshed so code no longer available
  if (!code) {
    return (
      <Center>
        <Box bg='white' padding='5' borderRadius='10' width={500}>
          <Flex gap={3} flexDirection={'column'}>
            <Heading size='sm'>No Setup Code</Heading>
            <Text>
              No setup code found in state. Please start with a new guardian.
            </Text>
            <Link href='/' color='blue.600'>
              Back to homepage
            </Link>
          </Flex>
        </Box>
      </Center>
    );
  }

  // page was refreshed so code no longer available
  if (refreshRequired) {
    return (
      <Center>
        <Box bg='white' padding='5' borderRadius='10' width={500}>
          <Flex gap={3} flexDirection={'column'}>
            <Heading size='sm'>Running Consensus</Heading>
            <Text>
              The consensus is now running so please allow a few minutes for
              this to complete.
            </Text>
            <Button leftIcon={<FiRefreshCw />} onClick={handleTryReconnect}>
              Refresh
            </Button>
          </Flex>
        </Box>
      </Center>
    );
  }

  return (
    <Center>
      <Box bg='white' padding='5' borderRadius='10' width={500}>
        <Flex gap='5' flexDirection='column'>
          <Heading size='sm'>Launch</Heading>
          <Text>
            Here&#39;s your setup code to share with other guardians (if
            required).
          </Text>

          {/* Show truncated code */}
          <Code padding={2}>{`${code?.substring(0, 20)}...${code?.substring(
            code.length - 20
          )}`}</Code>

          <Button
            borderRadius='8px'
            isDisabled={false}
            onClick={handleOnSubmit}
            isLoading={false}
            variant={'outline'}
          >
            Copy to Clipboard
          </Button>

          <Divider></Divider>

          <Button
            borderRadius='8px'
            isDisabled={false}
            onClick={handleOnSubmit}
            isLoading={false}
          >
            Launch Federation
          </Button>
          <Text size={'sm'} color={'gray.500'}>
            Your are about to launch with one Guardian which is recommended for
            testing only.
          </Text>
        </Flex>
      </Box>
    </Center>
  );
};
