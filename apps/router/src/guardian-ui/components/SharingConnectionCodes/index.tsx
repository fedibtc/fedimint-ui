import React, { useEffect, useState } from 'react';
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
import { SETUP_ACTION_TYPE } from '../../../types/guardian';
import { GuardianApi } from '../../../api/GuardianApi';
import { Spinner } from '@chakra-ui/react';

const truncateCode = (code: string) =>
  `${code?.substring(0, 20)}...${code?.substring(code.length - 5)}`;

export const SharingConnectionCodes: React.FC = () => {
  const { t } = useTranslation();
  const api = useGuardianSetupApi();
  const { state, dispatch } = useGuardianSetupContext();
  // const guardianDispatch = useGuardianDispatch();
  const config = useGuardianConfig();

  const { code, guardians, password, guardianName, federationName } = state;

  const [consensusRunning, setConsensusRunning] = useState<boolean>(false);
  const [guardianCode, setGuardianCode] = useState<string>('');

  const POLL_RATE = 5000; // check every 5 seconds

  // During consensus on 0.7 the api switches off and doesn't come online
  // again until dkg has finished!
  useEffect(() => {
    if (!consensusRunning) return;

    const intervalId = setInterval(async () => {
      const api = new GuardianApi(config);
      await api.connect();
      const connected = await api.testPassword(password);

      if (connected) {
        window.location.reload();
      }
    }, POLL_RATE);

    return () => clearInterval(intervalId);
  }, [config, consensusRunning, password]);

  const handleOnSubmit = async () => {
    try {
      api.setPassword(password);
      await api.startDkg();

      setConsensusRunning(true);
    } catch (err) {
      console.log(err);
    }
  };

  const handleAddCode = async () => {
    try {
      const guardianName = await api.addPeerSetupCode(guardianCode);

      const newGuardian = {
        name: guardianName,
        code: guardianCode,
      };

      dispatch({
        type: SETUP_ACTION_TYPE.ADD_CODE,
        payload: newGuardian,
      });

      setGuardianCode('');
    } catch (err) {
      console.log(err);
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

  if (consensusRunning) {
    return (
      <Center>
        <Box bg='white' padding='5' borderRadius='10' width={500}>
          <Flex gap={3} flexDirection={'column'}>
            <Heading size='sm'>Running Consensus</Heading>
            <Text>
              The consensus is now running so please allow a few minutes for
              this to complete.
            </Text>
            <Spinner size='md' />
            {/* <Button leftIcon={<FiRefreshCw />} onClick={handleTryReconnect}>
              Refresh
            </Button> */}
          </Flex>
        </Box>
      </Center>
    );
  }

  return (
    <Center>
      <Box
        bg='white'
        padding='5'
        boxSizing='border-box'
        borderRadius='10'
        overflow='hidden'
        width={500}
      >
        <Flex gap='5' flexDirection='column'>
          <Heading size='sm'>{`${guardianName} Setup`}</Heading>
          <Text>
            Here&#39;s your setup code to share with other guardians (if
            required).
          </Text>

          {/* Show truncated code */}
          <Code padding={2} borderRadius={5}>
            {code}
          </Code>

          {/* <Button
            borderRadius='8px'
            isDisabled={false}
            onClick={handleOnSubmit}
            isLoading={false}
            variant={'outline'}
          >
            Copy to Clipboard
          </Button> */}

          <Divider></Divider>
          <Heading size='xs'>Add Guardians</Heading>
          <Text>Add other Guardian codes below:</Text>

          {guardians.map((guardian: Record<string, string>) => (
            <Box key={code}>
              <Text fontWeight={'bold'}>{guardian.name}</Text>
              <Code padding={2} borderRadius={5} width='100%'>
                {truncateCode(guardian.code)}
              </Code>
            </Box>
          ))}

          <Input
            value={guardianCode}
            name='code'
            type='text'
            placeholder='Enter code'
            onChange={(ev) => setGuardianCode(ev.currentTarget.value)}
          />
          <Button
            variant={'outline'}
            borderRadius='8px'
            isDisabled={false}
            onClick={handleAddCode}
          >
            Add Code
          </Button>

          <Divider></Divider>

          <Button
            borderRadius='8px'
            isDisabled={
              consensusRunning || (guardians.length > 0 && guardians.length < 3)
            } // need 3 or more other guardians (for multi guardian setup)
            onClick={handleOnSubmit}
          >
            Launch Federation
          </Button>
        </Flex>
      </Box>
    </Center>
  );
};
