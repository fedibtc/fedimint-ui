import { JsonRpcError, JsonRpcWebsocket } from 'jsonrpc-client-websocket';
import {
  AuditSummary,
  BitcoinRpcConnectionStatus,
  BitcoinRpcConnectionStatusProgress,
  ClientConfig,
  DownloadGuardianBackupResponse,
  FederationStatus,
  ModuleKind,
  SetupStatusResponse,
  PeerHashMap,
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
  private password: string | null;

  constructor(guardianConfig: GuardianConfig) {
    this.guardianConfig = guardianConfig;
    this.password = null;
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

  public setPassword = (password: string | null): void => {
    this.password = password;
  };

  public getPassword = (): string | null => {
    return this.password;
  };

  public testPassword = async (password: string): Promise<boolean> => {
    // set password here so that auth call below can use it
    this.setPassword(password);

    // Attempt a 'status' rpc call with the temporary password.
    // It will throw if there's an issue
    try {
      await this.auth();
      return true;
    } catch (err) {
      // TODO: make sure error is auth error, not unrelated
      this.setPassword(null);
      return false;
    }
  };

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

  public getVerifyConfigHash = (): Promise<PeerHashMap> => {
    return this.call(SharedRpc.getVerifyConfigHash);
  };

  /*** Setup RPC methods ***/

  public setupStatus = (): Promise<SetupStatusResponse> => {
    return this.call(SetupRpc.setupStatus);
  };

  public setLocalParams = (params: {
    name: string;
    federation_name?: string;
  }): Promise<string> => {
    return this.call(SetupRpc.setLocalParams, params);
  };

  public addPeerSetupCode = (code: string): Promise<string> => {
    return this.call(SetupRpc.addPeerSetupCode, code);
  };

  public resetPeerSetupCodes = (): Promise<void> => {
    return this.call(SetupRpc.resetPeerSetupCodes);
  };

  public startDkg = (): Promise<boolean> => {
    return this.call(SetupRpc.startDkg);
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
      if (!this.guardianConfig?.baseUrl) {
        throw new Error('guardian baseUrl not found in config');
      }

      const websocket = await this.connect();

      const response = await websocket.call(method, [
        {
          auth: this.password || null,
          params,
        },
      ]);

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
