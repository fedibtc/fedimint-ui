import React, { useState, useCallback, useEffect } from 'react';
import { Flex, FormLabel, Input } from '@chakra-ui/react';
import { snakeToTitleCase } from '@fedimint/utils';
import { IconPreview } from './IconPreview';

interface MetaInputProps {
  metaKey: string;
  value: string;
  onChange: (key: string, value: string) => void;
}

export const MetaInput: React.FC<MetaInputProps> = ({
  metaKey,
  value,
  onChange,
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [localImageUrl, setLocalImageUrl] = useState<string | null>(null);
  const [localIsIconValid, setLocalIsIconValid] = useState(true);

  const validateIcon = useCallback(async (url: string) => {
    try {
      // Use Image constructor to validate image URL (avoids CORS issues)
      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          setLocalImageUrl(url); // Use original URL since we can't create blob URL
          setLocalIsIconValid(true);
          resolve();
        };
        img.onerror = () => {
          reject(new Error('Image failed to load'));
        };
        img.src = url;
      });
      return url; // Return original URL since we can't create blob URL
    } catch (error) {
      setLocalImageUrl(null);
      setLocalIsIconValid(false);
      if (error instanceof Error) {
        console.error(`Icon validation failed: ${error.message}`);
      }
      return null;
    }
  }, []);

  // Add this useEffect hook
  useEffect(() => {
    if (metaKey === 'federation_icon_url' && value) {
      validateIcon(value);
    }
  }, [metaKey, value, validateIcon]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
  };

  const handleBlur = () => {
    onChange(metaKey, localValue);
    if (metaKey === 'federation_icon_url' && localValue) {
      validateIcon(localValue);
    }
  };

  return (
    <Flex alignItems='center'>
      <Flex flexDirection='column' flex={1}>
        <FormLabel fontWeight='bold' mb={1}>
          {snakeToTitleCase(metaKey)}
        </FormLabel>
        <Flex alignItems='center' gap={2}>
          <Input
            type={metaKey === 'federation_icon_url' ? 'url' : 'text'}
            value={localValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            borderColor={
              (['federation_name', 'welcome_message'].includes(metaKey) &&
                localValue.trim() === '') ||
              (metaKey === 'federation_icon_url' && !localIsIconValid)
                ? 'yellow.400'
                : 'inherit'
            }
          />
          {metaKey === 'federation_icon_url' && (
            <IconPreview imageUrl={localImageUrl ?? ''} />
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};
