import React, { useEffect, useState } from 'react';
import {
  Flex,
  Icon,
  Button,
  Text,
  useTheme,
  useDisclosure,
} from '@chakra-ui/react';
import {
  BitcoinRpc,
  ConfigGenParams,
  ModuleKind,
  Network,
  BitcoinRpcConnectionStatus,
} from '@fedimint/types';
import { useTranslation } from '@fedimint/utils';
import { GuardianRole } from '../../../../../types/guardian';
import ArrowRightIcon from '../../../../assets/svgs/arrow-right.svg?react';
import {
  formatApiErrorMessage,
  getModuleParamsFromConfig,
  applyConfigGenModuleParams,
} from '../../../../utils/api';
import { isValidMeta, isValidNumber } from '../../../../utils/validators';
import { BasicSettingsForm } from './BasicSettingsForm';
import { FederationSettingsForm } from './FederationSettingsForm';
import { BitcoinSettingsForm } from './BitcoinSettingsForm';
import { ConfirmPasswordModal } from './ConfirmPasswordModal';
import {
  useGuardianSetupApi,
  useGuardianSetupContext,
} from '../../../../../hooks';

interface Props {
  next: () => void;
}

const MIN_BFT_NUM_PEERS = '4';

export const SetConfiguration: React.FC<Props> = ({ next }: Props) => {
  const { t } = useTranslation();
  const api = useGuardianSetupApi();
  const {
    state: {
      role,
      configGenParams,
      myName: stateMyName,
      password: statePassword,
      numPeers: stateNumPeers,
    },
    submitConfiguration,
  } = useGuardianSetupContext();
  const theme = useTheme();
  const isHost = role === GuardianRole.Host;
  const isSolo = role === GuardianRole.Solo;
  const [myName, setMyName] = useState(stateMyName);
  const [password, setPassword] = useState(statePassword);
  const [hostServerUrl, setHostServerUrl] = useState('');
  const [defaultParams, setDefaultParams] = useState<ConfigGenParams>();
  const [federationName, setFederationName] = useState('');
  const [metaFields, setMetaFields] = useState<[string, string][]>([['', '']]);
  const [blockConfirmations, setBlockConfirmations] = useState('');
  const [network, setNetwork] = useState('');
  const [networkSetFromParams, setNetworkSetFromParams] = useState(false);
  const [bitcoinRpc, setBitcoinRpc] = useState<BitcoinRpc>({
    kind: '',
    url: '',
  });
  const [bitcoinSetFromParams, setBitcoinSetFromParams] = useState(false);
  const [bitcoinStatus, setBitcoinStatus] =
    useState<BitcoinRpcConnectionStatus>();
  const [mintAmounts, setMintAmounts] = useState<number[]>([]);
  const [error, setError] = useState<string>();
  const [numPeers, setNumPeers] = useState(
    stateNumPeers ? stateNumPeers.toString() : isSolo ? '1' : MIN_BFT_NUM_PEERS
  );

  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const initStateFromParams = (params: ConfigGenParams) => {
      setDefaultParams(params);
      setFederationName(params.meta?.federation_name || '');

      const meta = { federation_name: '', ...params.meta };
      setMetaFields(Object.entries(meta));

      const mintModule = getModuleParamsFromConfig(params, ModuleKind.Mint);
      if (mintModule?.consensus?.mint_amounts) {
        setMintAmounts(mintModule?.consensus.mint_amounts);
      }

      const walletModule = getModuleParamsFromConfig(params, ModuleKind.Wallet);
      const walletConsensus = walletModule?.consensus;
      if (walletConsensus?.finality_delay !== undefined) {
        setBlockConfirmations(walletConsensus.finality_delay.toString());
      }
      if (walletConsensus?.network) {
        setNetwork(walletConsensus.network);
        setNetworkSetFromParams(true);
      }
      if (walletModule?.local?.bitcoin_rpc) {
        setBitcoinRpc(walletModule.local.bitcoin_rpc);
        setBitcoinSetFromParams(true);
      }
    };

    if (configGenParams === null) {
      api
        .getDefaultConfigGenParams()
        .then(initStateFromParams)
        .catch((err) => {
          console.error(err);
        });
    } else {
      initStateFromParams(configGenParams);
    }
  }, [configGenParams, api]);

  useEffect(() => {
    const fetchBitcoinStatus = async () => {
      try {
        const status = await api.checkBitcoinStatus();
        setBitcoinStatus(status);
      } catch (error) {
        console.error('Failed to fetch Bitcoin status:', error);
      }
    };

    fetchBitcoinStatus();
  }, [api]);

  // Update password when updated from state
  useEffect(() => {
    setPassword(statePassword);
  }, [statePassword]);

  const hostCriteria = [
    myName,
    password,
    federationName,
    isValidNumber(numPeers, 4),
    isValidNumber(blockConfirmations, 0, 200),
    isValidMeta(metaFields),
    network,
  ];

  const soloCriteria = [
    myName,
    password,
    federationName,
    isValidNumber(blockConfirmations, 0, 200),
    isValidMeta(metaFields),
    network,
  ];

  const followerCriteria = [myName, password, hostServerUrl];

  const isValid: boolean = isHost
    ? hostCriteria.every(Boolean)
    : isSolo
    ? soloCriteria.every(Boolean)
    : followerCriteria.every(Boolean);

  const handleChangeFederationName = (
    ev: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newName = ev.currentTarget.value;
    setFederationName(newName);
    setMetaFields((prev) =>
      prev.map(([key, val]) =>
        key === 'federation_name' ? [key, newName] : [key, val]
      )
    );
  };

  const submitConfig = async () => {
    if (password === null) return;
    setError(undefined);
    try {
      if (!defaultParams)
        throw new Error(
          'Cannot submit before fetching default config gen parameters'
        );
      // Fedimint finality delay is 1 less than the number of block confirmations input by the UI
      const finalityDelay = parseInt(blockConfirmations, 10);
      const moduleConfigs = applyConfigGenModuleParams(defaultParams.modules, {
        [ModuleKind.Mint]: {
          consensus: { mint_amounts: mintAmounts },
          local: {},
        },
        [ModuleKind.Wallet]: {
          consensus: {
            finality_delay: finalityDelay,
            network: network as Network,
          },
          local: {
            bitcoin_rpc: bitcoinRpc,
          },
        },
        [ModuleKind.Ln]: {
          consensus: { network: network as Network },
          local: { bitcoin_rpc: bitcoinRpc },
        },
      });
      if (isHost || isSolo) {
        // Hosts set their own connection name
        // - They should submit both their local and the consensus config gen params.
        await submitConfiguration({
          myName,
          password,
          configs: {
            numPeers: parseInt(numPeers, 10),
            meta: metaFields.reduce(
              (acc, [key, val]) => ({ ...acc, [key]: val }),
              {}
            ),
            modules: moduleConfigs,
          },
        });
      } else {
        // Followers set their own connection name, and hosts server URL to connect to.
        // - They should submit ONLY their local config gen params
        await submitConfiguration({
          myName,
          password,
          configs: {
            hostServerUrl,
            meta: {},
            modules: moduleConfigs,
          },
        });
      }
      next();
    } catch (err) {
      setError(formatApiErrorMessage(err));
    }
  };

  return (
    <Flex
      direction='column'
      gap={['2', '6']}
      justify='flex-start'
      align='flex-start'
      width='auto'
      minWidth='90%'
    >
      <FederationSettingsForm
        federationName={federationName}
        handleChangeFederationName={handleChangeFederationName}
        numPeers={numPeers}
        setNumPeers={setNumPeers}
        isHost={isHost}
        isFollower={!isHost && !isSolo}
        hostServerUrl={hostServerUrl}
        setHostServerUrl={setHostServerUrl}
      />
      <BitcoinSettingsForm
        network={network as Network}
        setNetwork={setNetwork}
        networkSetFromParams={networkSetFromParams}
        bitcoinRpc={bitcoinRpc}
        setBitcoinRpc={setBitcoinRpc}
        bitcoinSetFromParams={bitcoinSetFromParams}
        blockConfirmations={blockConfirmations}
        setBlockConfirmations={setBlockConfirmations}
        isHostOrSolo={isHost || isSolo}
        bitcoinStatus={bitcoinStatus}
      />
      <BasicSettingsForm
        myName={myName}
        setMyName={setMyName}
        password={password}
        setPassword={setPassword}
      />
      <Button
        isDisabled={!isValid}
        onClick={onOpen}
        leftIcon={<Icon as={ArrowRightIcon} />}
        width='60%'
        alignSelf='center'
      >
        {t('common.continue')}
      </Button>
      {error && (
        <Text color={theme.colors.red[500]} mt={4}>
          {error}
        </Text>
      )}
      {password !== null && bitcoinStatus === 'Synced' && (
        <ConfirmPasswordModal
          password={password}
          submitConfig={submitConfig}
          isOpen={isOpen}
          onClose={onClose}
          guardianName={myName}
        />
      )}
    </Flex>
  );
};
