import React, { useState, useCallback, useEffect } from 'react';
import {
  Button,
  Flex,
  FormLabel,
  Input,
  Text,
  IconButton,
  Tooltip,
  Box,
  Switch,
} from '@chakra-ui/react';
import { FiX, FiAlertTriangle, FiInfo } from 'react-icons/fi';
import { IconPreview } from './IconPreview';
import useDebounce from '../../../../../utils/debounce';

interface CustomMetaFieldsProps {
  customMeta: Record<string, string>;
  setCustomMeta: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export const CustomMetaFields: React.FC<CustomMetaFieldsProps> = ({
  customMeta,
  setCustomMeta,
}) => {
  const [iconValidity, setIconValidity] = useState<boolean>(true);
  const [localIconUrl, setLocalIconUrl] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string>('');
  const [autoValidateUrls, setAutoValidateUrls] = useState<boolean>(true);
  const [pendingIconUrl, setPendingIconUrl] = useState<string | null>(null);
  const debouncedIconUrl = useDebounce(pendingIconUrl, 300);

  const isImageField = (key: string): boolean => {
    return (
      key.includes('icon_url') ||
      key.includes('image') ||
      key.includes('avatar')
    );
  };

  const validateIcon = useCallback(async (url: string) => {
    if (!url) return null;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      if (!blob.type.startsWith('image/')) {
        throw new Error('Invalid image format');
      }
      const objectURL = URL.createObjectURL(blob);
      setLocalIconUrl(objectURL);
      setIconValidity(true);
      setValidationError('');
      return objectURL;
    } catch (error) {
      setLocalIconUrl(null);
      setIconValidity(false);
      setValidationError(
        error instanceof Error ? error.message : 'Failed to load image'
      );
      return null;
    }
  }, []);

  useEffect(() => {
    if (debouncedIconUrl && autoValidateUrls) {
      validateIcon(debouncedIconUrl);
    }
  }, [debouncedIconUrl, autoValidateUrls, validateIcon]);

  const handleMetaChange = (oldKey: string, newKey: string, value: string) => {
    setCustomMeta((prev) => {
      const newMeta = { ...prev };
      if (oldKey !== newKey) {
        delete newMeta[oldKey];
      }
      newMeta[newKey] = value;
      return newMeta;
    });

    if (isImageField(newKey) && autoValidateUrls && value) {
      setIconValidity(true);
      setValidationError('');
      setPendingIconUrl(value);
    }
  };

  const handleFieldBlur = (key: string, value: string) => {
    if (isImageField(key) && value && autoValidateUrls) {
      setPendingIconUrl(value);
    }
  };

  const addCustomField = () => {
    const newKey = `custom_${Object.keys(customMeta).length + 1}`;
    setCustomMeta((prev) => ({ ...prev, [newKey]: '' }));
  };

  const removeCustomField = (key: string) => {
    setCustomMeta((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [key]: _, ...rest } = prev;
      return rest;
    });
  };

  return (
    <>
      <Flex justifyContent='space-between' alignItems='center' mb={4}>
        <Text fontSize='lg' fontWeight='bold'>
          Meta Fields
        </Text>
        <Flex alignItems='center' gap={4}>
          <Flex alignItems='center'>
            <FormLabel htmlFor='validate-urls' mb='0' mr={2}>
              Auto-validate URLs
            </FormLabel>
            <Switch
              id='validate-urls'
              isChecked={autoValidateUrls}
              onChange={(e) => setAutoValidateUrls(e.target.checked)}
              colorScheme='blue'
            />
            <Tooltip
              label='When enabled, image URLs are automatically validated by making external requests. Disable to protect privacy.'
              placement='top'
              hasArrow
            >
              <Box ml={1} color='gray.500' cursor='help'>
                <FiInfo />
              </Box>
            </Tooltip>
          </Flex>
          <Button onClick={addCustomField} size='sm' variant='outline'>
            Add Field
          </Button>
        </Flex>
      </Flex>
      <Flex flexDirection='column' gap={4}>
        {Object.entries(customMeta).map(([key, value]) => (
          <Flex key={key} alignItems='center' gap={2}>
            <Flex
              flex={1}
              alignItems='center'
              gap={2}
              p={2}
              borderWidth={1}
              borderRadius='md'
            >
              <Flex direction='column' flex={1} maxWidth='25%'>
                <FormLabel htmlFor={`key-${key}`} fontSize='xs' mb={0}>
                  Key
                </FormLabel>
                <Input
                  id={`key-${key}`}
                  defaultValue={key}
                  onBlur={(e) => handleMetaChange(key, e.target.value, value)}
                  size='sm'
                />
              </Flex>
              <Flex direction='column' flex={3} position='relative'>
                <FormLabel htmlFor={`value-${key}`} fontSize='xs' mb={0}>
                  Value
                </FormLabel>
                <Input
                  id={`value-${key}`}
                  value={value}
                  onChange={(e) => handleMetaChange(key, key, e.target.value)}
                  onBlur={() => handleFieldBlur(key, value)}
                  size='sm'
                  isInvalid={isImageField(key) && !iconValidity}
                />
                {isImageField(key) && !iconValidity && validationError && (
                  <Tooltip label={validationError} placement='top' hasArrow>
                    <Box
                      position='absolute'
                      right={2}
                      top='50%'
                      color='red.500'
                      cursor='pointer'
                      display='flex'
                      alignItems='center'
                      zIndex={2}
                    >
                      <FiAlertTriangle />
                    </Box>
                  </Tooltip>
                )}
              </Flex>
            </Flex>
            {isImageField(key) && autoValidateUrls && (
              <IconPreview
                imageUrl={
                  key === 'federation_icon_url' && autoValidateUrls
                    ? localIconUrl ?? ''
                    : value
                }
              />
            )}
            <IconButton
              aria-label='Remove field'
              icon={<FiX />}
              size='sm'
              fontSize='xl'
              color='red.500'
              variant='ghost'
              onClick={() => removeCustomField(key)}
              minWidth='auto'
              height='auto'
              padding={1}
            />
          </Flex>
        ))}
      </Flex>
    </>
  );
};
