import { ConfigGenParams, ConsensusParams } from '@fedimint/types';

const isHexEncodedId = (value: string): boolean => {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    value.length % 2 === 0 &&
    /^[0-9A-Fa-f]+$/.test(value)
  );
};

export const isValidNumber = (value: string, min?: number, max?: number) => {
  const int = parseInt(value, 10);
  if (Number.isNaN(int)) return false;
  if (typeof min === 'number' && int < min) return false;
  if (typeof max === 'number' && int > max) return false;
  return true;
};

export const isValidMeta = (meta: [string, string][]) => {
  if (!meta.every(([key, value]) => key && value)) return false;
  const metaRecord = Object.fromEntries(meta);
  if (!validateCoreProtocolMetadata(metaRecord)) return false;
  if (!validateFediMetadata(metaRecord)) return false;
  return true;
};

export function isConsensusparams(
  params: ConfigGenParams | ConsensusParams
): params is ConsensusParams {
  return 'peers' in params;
}

export function validateCoreProtocolMetadata(
  meta: Record<string, string | string[] | boolean | undefined>
): boolean {
  if ('vetted_gateways' in meta) {
    if (!Array.isArray(meta.vetted_gateways)) return false;
    for (const id of meta.vetted_gateways) {
      if (typeof id !== 'string' || !isHexEncodedId(id)) return false;
    }
  }

  if ('federation_expiry_timestamp' in meta) {
    if (
      typeof meta.federation_expiry_timestamp !== 'string' ||
      !isValidNumber(meta.federation_expiry_timestamp, 1)
    ) {
      return false;
    }
  }

  if ('federation_name' in meta) {
    if (typeof meta.federation_name !== 'string') return false;
  }

  if ('meta_override_url' in meta) {
    if (
      typeof meta.meta_override_url !== 'string' ||
      !meta.meta_override_url.startsWith('https://')
    ) {
      return false;
    }
  }

  if ('welcome_message' in meta) {
    if (typeof meta.welcome_message !== 'string') return false;
  }
  return true;
}

export function validateFediMetadata(
  meta: Record<string, string | string[] | boolean | undefined>
): boolean {
  if (meta['fedi:stability_pool_disabled'] === 'false') {
    if (!('fedi:max_stable_balance_msats' in meta)) return false;
    const value = meta['fedi:max_stable_balance_msats'];
    if (typeof value !== 'string' || !isValidNumber(value, 1)) return false;
  }

  if ('fedi:pinned_message' in meta) {
    if (typeof meta['fedi:pinned_message'] !== 'string') return false;
  }

  if ('fedi:federation_icon_url' in meta) {
    const url = meta['fedi:federation_icon_url'];
    if (
      typeof url !== 'string' ||
      !url.startsWith('https://') ||
      !/(\.jpg|\.jpeg|\.png)$/i.test(url)
    )
      return false;
  }

  if ('fedi:tos_url' in meta) {
    const url = meta['fedi:tos_url'];
    if (typeof url !== 'string' || !url.startsWith('https://')) return false;
  }

  if ('fedi:default_currency' in meta) {
    if (
      typeof meta['fedi:default_currency'] !== 'string' ||
      !/^[A-Z]{3}$/.test(meta['fedi:default_currency'])
    )
      return false;
  }

  if ('fedi:popup_end_timestamp' in meta) {
    if (
      typeof meta['fedi:popup_end_timestamp'] !== 'string' ||
      !isValidNumber(meta['fedi:popup_end_timestamp'], 1)
    )
      return false;
  }

  const booleanKeys = [
    'fedi:invite_codes_disabled',
    'fedi:new_members_disabled',
    'fedi:offline_wallet_disabled',
    'fedi:social_recovery_disabled',
    'fedi:onchain_deposits_disabled',
  ];

  for (const key of booleanKeys) {
    if (key in meta) {
      const value = meta[key];
      if (typeof value !== 'string' || (value !== 'true' && value !== 'false'))
        return false;
    }
  }

  if ('fedi:max_invoice_msats' in meta) {
    if (
      typeof meta['fedi:max_invoice_msats'] !== 'string' ||
      !isValidNumber(meta['fedi:max_invoice_msats'], 1)
    )
      return false;
  }

  if ('fedi:max_balance_msats' in meta) {
    if (
      typeof meta['fedi:max_balance_msats'] !== 'string' ||
      !isValidNumber(meta['fedi:max_balance_msats'], 1)
    )
      return false;
  }

  if ('fedi:fedimods' in meta) {
    try {
      const mods = JSON.parse(
        typeof meta['fedi:fedimods'] === 'string' ? meta['fedi:fedimods'] : '{}'
      );
      if (
        !Array.isArray(mods) ||
        !mods.every((item) => typeof item === 'object' && item !== null)
      ) {
        return false;
      }
    } catch {
      return false;
    }
  }

  if ('fedi:default_group_chats' in meta) {
    try {
      const chats = JSON.parse(
        typeof meta['fedi:default_group_chats'] === 'string'
          ? meta['fedi:default_group_chats']
          : '[]'
      );
      if (
        !Array.isArray(chats) ||
        !chats.every((item) => typeof item === 'string')
      ) {
        return false;
      }
    } catch {
      return false;
    }
  }

  if ('fedi:meta_external_url' in meta) {
    if (
      typeof meta['fedi:meta_external_url'] !== 'string' ||
      !meta['fedi:meta_external_url'].startsWith('https://')
    )
      return false;
  }
  return true;
}
