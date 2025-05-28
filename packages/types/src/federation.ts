import type { MSats } from './bitcoin';
import { AnyModuleParams, ModuleConfigs, ModuleKind } from './modules';
import { MetaConfig } from './meta';

export enum GuardianServerStatus {
  AwaitingPassword = 'awaiting_password',
  SharingConfigGenParams = 'sharing_config_gen_params',
  ReadyForConfigGen = 'ready_for_config_gen',
  ConfigGenFailed = 'config_gen_failed',
  VerifyingConfigs = 'verifying_configs',
  VerifiedConfigs = 'verified_configs',
  Upgrading = 'upgrading',
  SetupRestarted = 'setup_restarted',
  ConsensusRunning = 'consensus_running',
}

export enum PeerConnectionStatus {
  Connected = 'connected',
  Disconnected = 'disconnected',
}

export interface PeerStatus {
  last_contribution: number;
  connection_status: PeerConnectionStatus;
  flagged: boolean;
}

export interface Peer {
  name: string;
  cert: string;
  api_url: string;
  p2p_url: string;
  status: GuardianServerStatus;
}

export type PeerHashMap = Record<number, string>;

export interface FederationStatus {
  session_count: number;
  peers_online: number;
  peers_offline: number;
  peers_flagged: number;
  status_by_peer: Record<string, PeerStatus>;
}

export interface StatusResponse {
  server: GuardianServerStatus;
  federation?: FederationStatus;
}

// 0.7 status response
export type SetupStatusResponse =
  | 'AwaitingLocalParams'
  | 'SharingConnectionCodes'
  | 'ConsensusIsRunning';

export interface Versions {
  core: {
    core_consensus: CoreConsensusVersion;
    api: CoreApiVersion[];
  };
  modules: Record<
    number,
    {
      core_consensus: CoreConsensusVersion;
      module_consensus: ModuleConsensusVersion;
      api: ModuleApiVersion[];
    }
  >;
}

interface ApiEndpoint {
  name: string;
  url: string;
}

type MajorAndMinorVersions = {
  major: number;
  minor: number;
};
export type CoreConsensusVersion = MajorAndMinorVersions;
export type CoreApiVersion = MajorAndMinorVersions;
export type ModuleConsensusVersion = MajorAndMinorVersions;
export type ModuleApiVersion = MajorAndMinorVersions;

export interface ClientConfig {
  global: {
    api_endpoints: Record<number, ApiEndpoint>;
    broadcast_public_keys: Record<number, string>;
    consensus_version: CoreConsensusVersion;
    meta: {
      federation_name: string;
    };
  };
  modules: ModuleConfigs;
}

export interface GatewayClientConfig {
  api_endpoints: Record<number, ApiEndpoint>;
  broadcast_public_keys: Record<number, string>;
  consensus_version: CoreConsensusVersion;
  meta: {
    federation_name: string;
  };
  modules: ModuleConfigs;
}

export interface ModuleSummary {
  net_assets: MSats;
  kind: ModuleKind;
}

export interface AuditSummary {
  net_assets: MSats;
  module_summaries: Record<number, ModuleSummary>;
}

export type DownloadGuardianBackupResponse = {
  tar_archive_bytes: string;
};

export interface ApiAnnouncement {
  api_url: string;
  nonce: number;
}
export interface SignedApiAnnouncement {
  api_announcement: ApiAnnouncement;
  signature: string;
}

export type ConfigGenParams = {
  meta: MetaConfig;
  modules: Record<number, AnyModuleParams>;
};

export type ConsensusParams = ConfigGenParams & {
  peers: Record<number, Peer>;
};

export interface ConsensusState {
  consensus: ConsensusParams;
  our_current_id: number;
}
