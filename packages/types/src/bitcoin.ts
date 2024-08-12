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
