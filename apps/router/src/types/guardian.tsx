export type GuardianConfig = {
  id: string;
  baseUrl: string;
};

export type GuardianStatus =
  | 'AwaitingLocalParams'
  | 'SharingConnectionCodes'
  | 'ConsensusIsRunning';

export interface GuardianAppState {
  status: GuardianStatus | undefined;
  authed: boolean;
  error: string;
}

export enum GUARDIAN_APP_ACTION_TYPE {
  SET_STATUS = 'SET_STATUS',
  SET_AUTHED = 'SET_AUTHED',
  SET_ERROR = 'SET_ERROR',
}

export type GuardianAppAction =
  | {
      type: GUARDIAN_APP_ACTION_TYPE.SET_STATUS;
      payload: GuardianStatus | undefined;
    }
  | {
      type: GUARDIAN_APP_ACTION_TYPE.SET_AUTHED;
      payload: boolean;
    }
  | {
      type: GUARDIAN_APP_ACTION_TYPE.SET_ERROR;
      payload: string;
    };

export enum GuardianRole {
  Host = 'Host',
  Follower = 'Follower',
  Solo = 'Solo',
}

export enum SetupProgress {
  Start = 'Start',
  SetConfiguration = 'SetConfiguration',
  ConnectGuardians = 'ConnectGuardians',
  RunDKG = 'RunDKG',
  VerifyGuardians = 'VerifyGuardians',
  SetupComplete = 'SetupComplete',
  Backup = 'Backup',
}

export enum StepState {
  Active = 'Active',
  InActive = 'InActive',
  Completed = 'Completed',
}

export interface tosConfigState {
  showTos: boolean;
  tos: string | undefined;
}

export interface SetupState {
  guardianName: string;
  federationName: string;
  isLeader: boolean;
  password: string;
  code: string | null;
  peers: Record<string, string>[];
  error: string | null;
}

export enum SETUP_ACTION_TYPE {
  RESET = 'RESET',
  SET_DATA = 'SET_DATA',
  ADD_PEER = 'ADD_PEER',
  RESET_PEERS = 'RESET_PEERS',
  SET_ERROR = 'SET_ERROR',
}

export type SetupAction =
  | {
      type: SETUP_ACTION_TYPE.RESET;
    }
  | {
      type: SETUP_ACTION_TYPE.SET_DATA;
      payload: Record<string, string | boolean>;
    }
  | {
      type: SETUP_ACTION_TYPE.ADD_PEER;
      payload: Record<string, string>;
    }
  | {
      type: SETUP_ACTION_TYPE.RESET_PEERS;
    }
  | {
      type: SETUP_ACTION_TYPE.SET_ERROR;
      payload: string | null;
    };

// Setup RPC methods (only exist during setup)
export enum SetupRpc {
  setupStatus = 'setup_status',
  setLocalParams = 'set_local_params',
  addPeerSetupCode = 'add_peer_setup_code',
  startDkg = 'start_dkg',
  setPassword = 'set_password',
  resetPeerSetupCodes = 'reset_peer_setup_codes',
}

// Admin RPC methods (only exist after run_consensus)
export enum AdminRpc {
  version = 'version',
  fetchBlockCount = 'block_count',
  federationStatus = 'status',
  inviteCode = 'invite_code',
  config = 'client_config_json',
  moduleApiCall = 'module',
  audit = 'audit',
  downloadGuardianBackup = 'download_guardian_backup',
  federationId = 'federation_id',
  apiAnnouncements = 'api_announcements',
  signApiAnnouncement = 'sign_api_announcement',
  shutdown = 'shutdown',
}

export enum SharedRpc {
  auth = 'auth',
  status = 'status',
  checkBitcoinStatus = 'check_bitcoin_status',
  getVerifyConfigHash = 'verify_config_hash',
}

export enum ModuleRpc {
  // Lightning Module
  listGateways = 'list_gateways',
  blockCount = 'block_count',
  // Meta Module
  submitMeta = 'submit',
  getConsensus = 'get_consensus',
  getConsensusRev = 'get_consensus_rev',
  getSubmissions = 'get_submission',
}
