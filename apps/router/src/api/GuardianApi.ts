import { JsonRpcError, JsonRpcWebsocket } from 'jsonrpc-client-websocket';
import {
  AuditSummary,
  BitcoinRpcConnectionStatus,
  BitcoinRpcConnectionStatusProgress,
  ClientConfig,
  ConfigGenParams,
  ConsensusState,
  DownloadGuardianBackupResponse,
  FederationStatus,
  ModuleKind,
  PeerHashMap,
  GuardianServerStatus,
  SignedApiAnnouncement,
  StatusResponse,
  Versions,
} from '@fedimint/types';
import {
  AdminRpc,
  GuardianConfig,
  ModuleRpc,
  SetupRpc,
  SharedRpc,
} from '../types/guardian';

export class GuardianApi {
  private websocket: JsonRpcWebsocket | null = null;
  private connectPromise: Promise<JsonRpcWebsocket> | null = null;
  private guardianConfig: GuardianConfig;

  constructor(guardianConfig: GuardianConfig) {
    this.guardianConfig = guardianConfig;
  }

  /*** WebSocket methods ***/

  public connect = async (): Promise<JsonRpcWebsocket> => {
    if (this.websocket !== null) {
      return this.websocket;
    }
    if (this.connectPromise) {
      return await this.connectPromise;
    }

    this.connectPromise = new Promise((resolve, reject) => {
      const requestTimeoutMs = 1000 * 60 * 60 * 5; // 5 minutes, dkg can take a while
      const websocket = new JsonRpcWebsocket(
        this.guardianConfig.baseUrl,
        requestTimeoutMs,
        (error: JsonRpcError) => {
          console.error('failed to create websocket', error);
          reject(error);
          this.shutdown_internal();
        }
      );
      websocket
        .open()
        .then(() => {
          this.websocket = websocket;
          resolve(this.websocket);
        })
        .catch((error) => {
          console.error('failed to open websocket', error);
          reject(
            new Error(
              'Failed to connect to API, confirm your server is online and try again.'
            )
          );
        });
    });

    return this.connectPromise;
  };

  private shutdown_internal = async (): Promise<boolean> => {
    if (this.connectPromise) {
      this.connectPromise = null;
    }
    if (this.websocket) {
      const evt: CloseEvent = await this.websocket.close();
      this.websocket = null;
      return evt.type === 'close' && evt.wasClean;
    }

    return true;
  };

  public testPassword = async (password: string): Promise<boolean> => {
    this.setSessionPassword(password);

    // Attempt a 'status' rpc call with the temporary password.
    try {
      await this.auth();
      return true;
    } catch (err) {
      // TODO: make sure error is auth error, not unrelated
      this.clearPassword();
      return false;
    }
  };

  private clearPassword = () => {
    sessionStorage.removeItem(this.guardianConfig.id);
  };

  /*** Shared RPC methods */

  /*** Shared RPC methods */
  auth = (): Promise<void> => {
    return this.call(SharedRpc.auth);
  };

  status = (): Promise<StatusResponse> => {
    return this.call(SharedRpc.status);
  };

  // This handles both 0.5 and 0.6 shaped responses and returns just 0.5 response (string)
  checkBitcoinStatus = async (): Promise<BitcoinRpcConnectionStatus> => {
    const result:
      | BitcoinRpcConnectionStatus
      | BitcoinRpcConnectionStatusProgress = await this.call(
      SharedRpc.checkBitcoinStatus
    );

    if (typeof result === 'object') {
      return result?.sync_percentage > 0.9999 ? 'Synced' : 'NotSynced';
    }

    return result;
  };

  /*** Setup RPC methods ***/

  public getPassword = (): string | null => {
    return sessionStorage.getItem(this.guardianConfig.id) || null;
  };

  public setSessionPassword = (password: string): void => {
    sessionStorage.setItem(this.guardianConfig.id, password);
  };

  public setPassword = async (password: string): Promise<void> => {
    this.setSessionPassword(password);
    try {
      await this.call(SetupRpc.setPassword);
    } catch (err) {
      // If the call failed, clear the password first then re-throw
      this.clearPassword();
      throw err;
    }
  };

  public setConfigGenConnections = async (
    ourName: string,
    leaderUrl?: string
  ): Promise<void> => {
    const connections = {
      our_name: ourName,
      leader_api_url: leaderUrl,
    };

    return this.call(SetupRpc.setConfigGenConnections, connections);
  };

  public getDefaultConfigGenParams = (): Promise<ConfigGenParams> => {
    return this.call(SetupRpc.getDefaultConfigGenParams);
  };

  public getConsensusConfigGenParams = (): Promise<ConsensusState> => {
    return this.call(SetupRpc.getConsensusConfigGenParams);
  };

  public setConfigGenParams = (params: ConfigGenParams): Promise<void> => {
    return this.call(SetupRpc.setConfigGenParams, params);
  };

  public getVerifyConfigHash = (): Promise<PeerHashMap> => {
    return this.call(SharedRpc.getVerifyConfigHash);
  };

  public runDkg = (): Promise<void> => {
    return this.call(SetupRpc.runDkg);
  };

  public verifiedConfigs = (): Promise<void> => {
    return this.call(SetupRpc.verifiedConfigs);
  };

  public startConsensus = async (): Promise<void> => {
    const sleep = (time: number) =>
      new Promise((resolve) => setTimeout(resolve, time));

    // Special case: start_consensus kills the server, which sometimes causes it not to respond.
    // If it doesn't respond within 5 seconds, continue on with status checks.
    await Promise.any([this.call<null>(SetupRpc.startConsensus), sleep(5000)]);

    // Try to reconnect and confirm that status is ConsensusRunning. Retry multiple
    // times, but eventually give up and just throw.
    let tries = 0;
    const maxTries = 10;
    const attemptConfirmConsensusRunning = async (): Promise<void> => {
      try {
        if (!this.guardianConfig?.baseUrl) {
          throw new Error('guardian baseUrl not found in config');
        }
        await this.connect();
        await this.shutdown_internal();
        const status = await this.status();
        if (status.server === GuardianServerStatus.ConsensusRunning) {
          return;
        } else {
          throw new Error(
            `Expected status ConsensusRunning, got ${status.server}`
          );
        }
      } catch (err) {
        console.warn('Failed to confirm consensus running:', err);
      }
      // Retry after a delay if we haven't exceeded the max number of tries, otherwise give up.
      if (tries < maxTries) {
        tries++;
        await sleep(1000);
        return attemptConfirmConsensusRunning();
      } else {
        throw new Error('Failed to start consensus, see logs for more info.');
      }
    };

    return attemptConfirmConsensusRunning();
  };

  public restartSetup: () => Promise<void> = () => {
    return this.call(SetupRpc.restartSetup);
  };

  /*** Running RPC methods */

  public version = (): Promise<Versions> => {
    return this.call(AdminRpc.version);
  };

  public fetchBlockCount = (config: ClientConfig): Promise<number> => {
    const walletModuleId = config
      ? Object.entries(config.modules).find(
          (m) => m[1].kind === ModuleKind.Wallet
        )?.[0]
      : undefined;

    if (!walletModuleId) {
      throw new Error('No wallet module found');
    }
    return this.moduleApiCall(Number(walletModuleId), ModuleRpc.blockCount);
  };

  public federationStatus = (): Promise<FederationStatus> => {
    return this.call(AdminRpc.federationStatus);
  };

  public federationId = (): Promise<string> => {
    return this.call(AdminRpc.federationId);
  };

  public inviteCode = (): Promise<string> => {
    return this.call(AdminRpc.inviteCode);
  };

  public config = (): Promise<ClientConfig> => {
    return this.call(AdminRpc.config);
  };

  public audit = (): Promise<AuditSummary> => {
    return this.call(AdminRpc.audit);
  };

  // Returns the .tar bytes backup of the guardian config as a base64 encoded string
  public downloadGuardianBackup =
    (): Promise<DownloadGuardianBackupResponse> => {
      return this.call(AdminRpc.downloadGuardianBackup);
    };

  public apiAnnouncements = async (): Promise<
    Record<string, SignedApiAnnouncement>
  > => {
    return this.call(AdminRpc.apiAnnouncements);
  };

  public signApiAnnouncement = async (
    newUrl: string
  ): Promise<SignedApiAnnouncement> => {
    return this.call(AdminRpc.signApiAnnouncement, newUrl);
  };

  public shutdown = async (session?: number): Promise<void> => {
    return this.call(AdminRpc.shutdown, session);
  };

  public moduleApiCall = <T>(
    moduleId: number,
    rpc: ModuleRpc,
    params: unknown = null
  ): Promise<T> => {
    const method = `${AdminRpc.moduleApiCall}_${moduleId}_${rpc}`;
    return this.call_any_method<T>(method, params);
  };

  private call = async <T>(
    method: SetupRpc | AdminRpc | SharedRpc,
    params: unknown = null
  ): Promise<T> => {
    return this.call_any_method(method, params);
  };

  // NOTE: Uncomment the console.logs for debugging all fedimint rpc calls
  private call_any_method = async <T>(
    method: string,
    params: unknown = null
  ): Promise<T> => {
    try {
      const password = this.getPassword();
      if (!this.guardianConfig?.baseUrl) {
        throw new Error('guardian baseUrl not found in config');
      }
      const websocket = await this.connect();
      // console.log('method', method);
      const response = await websocket.call(method, [
        {
          auth: password || null,
          params,
        },
      ]);
      // console.log('response', response);

      if (response.error) {
        throw response.error;
      }

      const result = response.result as T;

      return result;
    } catch (error: unknown) {
      console.error(`error calling '${method}' on websocket rpc : `, error);
      throw 'error' in (error as { error: JsonRpcError })
        ? (error as { error: JsonRpcError }).error
        : error;
    }
  };
}

export type SetupApiInterface = Pick<
  GuardianApi,
  keyof typeof SetupRpc | keyof typeof SharedRpc
>;
export type AdminApiInterface = Pick<
  GuardianApi,
  keyof typeof AdminRpc | keyof typeof SharedRpc
>;
