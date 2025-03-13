// Opaque numeric types to avoid mixing different denominations of bitcoin
type BitcoinUnit<K, T> = K & { _: T };
export type Btc = BitcoinUnit<number, 'Btc'>;
export type Sats = BitcoinUnit<number, 'Sats'>;
export type MSats = BitcoinUnit<number, 'MSats'>;

// Type adaptation from https://docs.rs/bitcoin/latest/bitcoin/network/enum.Network.html
export enum Network {
  Bitcoin = 'bitcoin',
  Testnet = 'testnet',
  Signet = 'signet',
  Regtest = 'regtest',
}

export enum BitcoinRpcKind {
  Bitcoind = 'bitcoind',
  Esplora = 'esplora',
  // Electrum = 'electrum', TODO: needs testing fedimint side
}

export class Bip21Uri {
  constructor(public address: string, public amountSats?: Sats) {}

  toString(): string {
    let uri = `bitcoin:${this.address}`;
    if (this.amountSats !== undefined) {
      // Convert sats to btc for Bip21 URI, ensuring 8 decimal places
      uri += `?amount=${(this.amountSats / 100000000).toFixed(8)}`;
    }
    return uri;
  }
}

// 0.5 check_bitcoin_status response shape
export type BitcoinRpcConnectionStatus = 'Synced' | string;

// 0.6 check_bitcoin_statusresponse shape
export type BitcoinRpcConnectionStatusProgress = {
  chain_top_block_height: number;
  chain_top_block_time: number;
  sync_percentage: number;
};
