import { ConfigGenParams, ConsensusParams } from '@fedimint/types';
import {
  coreProtocolMetadataSchema,
  fediMetadataSchema,
} from './metaDataSchema';

export const isValidNumber = (value: string, min?: number, max?: number) => {
  const int = parseInt(value, 10);
  if (Number.isNaN(int)) return false;
  if (typeof min === 'number' && int < min) return false;
  if (typeof max === 'number' && int > max) return false;
  return true;
};

export const isValidMeta = (meta: [string, string[] | string][]) => {
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
  return coreProtocolMetadataSchema.safeParse(meta).success;
}

export function validateFediMetadata(
  meta: Record<string, string | string[] | boolean | undefined>
): boolean {
  return fediMetadataSchema.safeParse(meta).success;
}
