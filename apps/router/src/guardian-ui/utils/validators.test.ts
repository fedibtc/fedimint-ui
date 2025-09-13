import {
  isValidMeta,
  validateCoreProtocolMetadata,
  validateFediMetadata,
} from './validators';

describe('Federation Metadata Validation', () => {
  describe('Core Protocol Metadata', () => {
    test('should validate valid core protocol metadata', () => {
      const validCoreMeta = {
        vetted_gateways: ['31637A7863323431323361736466'],
        federation_expiry_timestamp: '2',
        federation_name: 'Test Federation',
        meta_override_url: 'https://example.com',
        welcome_message: 'Welcome to the federation!',
      };

      expect(validateCoreProtocolMetadata(validCoreMeta)).toBe(true);
    });

    test('should fail invalid core protocol metadata', () => {
      const invalidCoreMeta = {
        vetted_gateways: '31637A7863323431323361736466',
        federation_expiry_timestamp: '0',
        meta_override_url: 'http://example.com',
      };

      expect(validateCoreProtocolMetadata(invalidCoreMeta)).toBe(false);
    });
  });

  describe('Fedi Metadata', () => {
    test('should validate valid fedi metadata when StabilityPool is enabled', () => {
      const validFediMeta = {
        'fedi:stability_pool_disabled': 'false',
        'fedi:max_stable_balance_msats': '1000000000',
        'fedi:default_currency': 'USD',
        'fedi:federation_icon_url': 'https://example.com/icon.png',
        'fedi:tos_url': 'https://example.com/tos',
      };

      expect(validateFediMetadata(validFediMeta)).toBe(true);
    });

    test('should fail fedi metadata when required field is missing', () => {
      const invalidFediMeta = {
        'fedi:stability_pool_disabled': 'false',
        'fedi:default_currency': 'USD',
      };

      expect(validateFediMetadata(invalidFediMeta)).toBe(false);
    });
  });

  describe('Combined Metadata via isValidMeta', () => {
    test('should validate metadata provided as an array of key/value pairs (valid case)', () => {
      const validMetaArray: [string, string[] | string][] = [
        ['vetted_gateways', ['31637A7863323431323361736466']],
        ['federation_expiry_timestamp', '1609459200'],
        ['meta_override_url', 'https://example.com'],
        ['fedi:stability_pool_disabled', 'false'],
        ['fedi:max_stable_balance_msats', '1000000000'],
      ];

      expect(isValidMeta(validMetaArray)).toBe(true);
    });

    test('should fail validation when any metadata field is invalid (invalid case)', () => {
      const invalidMetaArray: [string, string][] = [
        ['vetted_gateways', '31637A7863323431323361736466'],
        ['federation_expiry_timestamp', '1609459200'],
      ];

      expect(isValidMeta(invalidMetaArray)).toBe(false);
    });
  });
});
