import { MetaConfig, MetaFields } from '@fedimint/types';

export const metaToFields = (meta: MetaConfig): MetaFields => {
  return Object.entries(meta).map(([key, value]) => [key, value ?? '']);
};

export const fieldsToMeta = (fields: MetaFields): MetaConfig => {
  return Object.fromEntries(fields);
};

/** https://stackoverflow.com/a/57391629 */
const bytesToHex = (bytes: Uint8Array): string => {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(
    ''
  );
};

/** https://stackoverflow.com/a/57391629 */
const hexToBytes = (hex: string): Uint8Array => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
};

/** https://stackoverflow.com/a/57391629 */
const stringToUTF8Bytes = (string: string): Uint8Array => {
  return new TextEncoder().encode(string);
};

export const metaToHex = (meta: MetaConfig): string => {
  try {
    const str = JSON.stringify(meta);
    const bytes = stringToUTF8Bytes(str);
    const hex = bytesToHex(bytes);
    return hex;
  } catch (error) {
    throw new Error('Invalid meta object. Failed to encode to hex.');
  }
};

export const hexToMeta = (hex: string): MetaConfig => {
  try {
    const bytes = hexToBytes(hex);
    const str = new TextDecoder().decode(bytes);
    return JSON.parse(str);
  } catch (error) {
    throw new Error('Invalid hex string. Failed to decode to meta object.');
  }
};
