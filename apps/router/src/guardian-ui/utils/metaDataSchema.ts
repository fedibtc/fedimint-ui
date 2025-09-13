import { z } from 'zod';
import { isValidNumber } from './validators';

const isHexEncodedId = (value: string): boolean => {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    value.length % 2 === 0 &&
    /^[0-9A-Fa-f]+$/.test(value)
  );
};

export const coreProtocolMetadataSchema = z
  .object({
    vetted_gateways: z.optional(
      z.array(
        z.string().refine(isHexEncodedId, { message: 'Invalid hex encoded id' })
      )
    ),
    federation_expiry_timestamp: z.optional(
      z.string().refine((val) => parseInt(val, 10) > 0, {
        message: 'Invalid federation_expiry_timestamp',
      })
    ),
    federation_name: z.optional(z.string()),
    meta_override_url: z.optional(
      z.string().refine((val) => val.startsWith('https://'), {
        message: "meta_override_url must start with 'https://'",
      })
    ),
    welcome_message: z.optional(z.string()),
  })
  .passthrough();

export const fediMetadataSchema = z
  .object({
    'fedi:stability_pool_disabled': z.optional(
      z.string().refine((val) => val === 'true' || val === 'false', {
        message: "Must be 'true' or 'false'",
      })
    ),
    'fedi:max_stable_balance_msats': z.optional(
      z.string().refine((val) => isValidNumber(val, 1), {
        message: 'Invalid fedi:max_stable_balance_msats',
      })
    ),
    'fedi:pinned_message': z.optional(z.string()),
    'fedi:federation_icon_url': z.optional(
      z
        .string()
        .refine(
          (val) =>
            val.startsWith('https://') && /(\.jpg|\.jpeg|\.png)$/i.test(val),
          { message: 'Invalid fedi:federation_icon_url' }
        )
    ),
    'fedi:tos_url': z.optional(
      z.string().refine((val) => val.startsWith('https://'), {
        message: 'Invalid fedi:tos_url',
      })
    ),
    'fedi:default_currency': z.optional(z.string().regex(/^[A-Z]{3}$/)),
    'fedi:popup_end_timestamp': z.optional(
      z.string().refine((val) => isValidNumber(val, 1), {
        message: 'Invalid fedi:popup_end_timestamp',
      })
    ),
    'fedi:invite_codes_disabled': z.optional(
      z.string().refine((val) => val === 'true' || val === 'false', {
        message: "Must be 'true' or 'false'",
      })
    ),
    'fedi:new_members_disabled': z.optional(
      z.string().refine((val) => val === 'true' || val === 'false', {
        message: "Must be 'true' or 'false'",
      })
    ),
    'fedi:offline_wallet_disabled': z.optional(
      z.string().refine((val) => val === 'true' || val === 'false', {
        message: "Must be 'true' or 'false'",
      })
    ),
    'fedi:social_recovery_disabled': z.optional(
      z.string().refine((val) => val === 'true' || val === 'false', {
        message: "Must be 'true' or 'false'",
      })
    ),
    'fedi:onchain_deposits_disabled': z.optional(
      z.string().refine((val) => val === 'true' || val === 'false', {
        message: "Must be 'true' or 'false'",
      })
    ),
    'fedi:max_invoice_msats': z.optional(
      z.string().refine((val) => isValidNumber(val, 1), {
        message: 'Invalid fedi:max_invoice_msats',
      })
    ),
    'fedi:max_balance_msats': z.optional(
      z.string().refine((val) => isValidNumber(val, 1), {
        message: 'Invalid fedi:max_balance_msats',
      })
    ),
    'fedi:fedimods': z.optional(
      z.string().refine(
        (val) => {
          try {
            const mods = JSON.parse(val);
            return (
              Array.isArray(mods) &&
              mods.every((item) => typeof item === 'object' && item !== null)
            );
          } catch {
            return false;
          }
        },
        { message: 'Invalid fedi:fedimods' }
      )
    ),
    'fedi:default_group_chats': z.optional(
      z.string().refine(
        (val) => {
          try {
            const chats = JSON.parse(val);
            return (
              Array.isArray(chats) &&
              chats.every((item) => typeof item === 'string')
            );
          } catch {
            return false;
          }
        },
        { message: 'Invalid fedi:default_group_chats' }
      )
    ),
    'fedi:meta_external_url': z.optional(
      z.string().refine((val) => val.startsWith('https://'), {
        message: 'Invalid fedi:meta_external_url',
      })
    ),
  })
  .passthrough()
  .superRefine((data, ctx) => {
    if (
      data['fedi:stability_pool_disabled'] === 'false' &&
      !data['fedi:max_stable_balance_msats']
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "fedi:max_stable_balance_msats is required when fedi:stability_pool_disabled is 'false'",
      });
    }
  });
