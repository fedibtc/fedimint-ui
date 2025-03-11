import React, { useState, useEffect, useCallback } from 'react';
import {
  Flex,
  FormLabel,
  Input,
  Button,
  IconButton,
  Text,
  Box,
  Tooltip,
  Switch,
} from '@chakra-ui/react';
import { FiX, FiAlertTriangle, FiInfo } from 'react-icons/fi';
import { IconPreview } from './IconPreview';
import useDebounce from '../../../../../utils/debounce';

interface Site {
  id: string;
  url: string;
  title: string;
  imageUrl: string;
}

interface SitesInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const SitesInput: React.FC<SitesInputProps> = ({ value, onChange }) => {
  const [sites, setSites] = useState<Site[]>([]);
  const [imageValidation, setImageValidation] = useState<
    Record<number, { valid: boolean; error: string }>
  >({});
  const [autoValidateUrls, setAutoValidateUrls] = useState<boolean>(true);
  const [urlToValidate, setUrlToValidate] = useState<{
    url: string;
    index: number;
  } | null>(null);

  const debouncedUrlToValidate = useDebounce(urlToValidate, 300);

  const validateImage = useCallback(
    async (url: string, index: number) => {
      if (!url || !autoValidateUrls) {
        return;
      }

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const blob = await response.blob();
        if (!blob.type.startsWith('image/')) {
          throw new Error('Invalid image format');
        }

        setImageValidation((prev) => ({
          ...prev,
          [index]: { valid: true, error: '' },
        }));
      } catch (error) {
        setImageValidation((prev) => ({
          ...prev,
          [index]: {
            valid: false,
            error:
              error instanceof Error ? error.message : 'Failed to load image',
          },
        }));
      }
    },
    [autoValidateUrls]
  );

  useEffect(() => {
    if (debouncedUrlToValidate) {
      validateImage(debouncedUrlToValidate.url, debouncedUrlToValidate.index);
    }
  }, [debouncedUrlToValidate, validateImage]);

  const debouncedValidate = useCallback((url: string, index: number) => {
    setUrlToValidate({ url, index });
  }, []);

  useEffect(() => {
    try {
      const parsedSites = JSON.parse(value);
      setSites(Array.isArray(parsedSites) ? parsedSites : []);

      if (autoValidateUrls && Array.isArray(parsedSites)) {
        parsedSites.forEach((site, index) => {
          if (site.imageUrl) {
            debouncedValidate(site.imageUrl, index);
          }
        });
      }
    } catch {
      setSites([]);
    }
  }, [value, autoValidateUrls, debouncedValidate]);

  const handleSiteChange = (
    index: number,
    field: keyof Site,
    newValue: string
  ) => {
    const newSites = sites.map((site, i) =>
      i === index ? { ...site, [field]: newValue } : site
    );
    onChange(JSON.stringify(newSites));

    if (field === 'imageUrl' && autoValidateUrls) {
      debouncedValidate(newValue, index);
    }
  };

  const addSite = () => {
    const newSites = [...sites, { id: '', url: '', title: '', imageUrl: '' }];
    onChange(JSON.stringify(newSites));
  };

  const removeSite = (index: number) => {
    const newSites = sites.filter((_, i) => i !== index);
    onChange(JSON.stringify(newSites));
    setImageValidation((prev) => {
      const newValidation = { ...prev };
      delete newValidation[index];
      return newValidation;
    });
  };

  return (
    <Flex flexDirection='column'>
      <Flex justifyContent='space-between' alignItems='center' mb={2}>
        <Text fontSize='lg' fontWeight='bold'>
          Sites
        </Text>
        <Flex alignItems='center' gap={4}>
          <Flex alignItems='center'>
            <FormLabel htmlFor='validate-urls-sites' mb='0' mr={2}>
              Auto-validate URLs
            </FormLabel>
            <Switch
              id='validate-urls-sites'
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
          <Button onClick={addSite} size='sm' variant='outline'>
            Add Site
          </Button>
        </Flex>
      </Flex>
      {sites.map((site, index) => (
        <Flex key={index} alignItems='center' gap={2} mb={2}>
          <Flex
            flex={1}
            alignItems='center'
            gap={2}
            p={2}
            borderWidth={1}
            borderRadius='md'
          >
            {(Object.keys(site) as Array<keyof Site>).map((field) => (
              <Flex
                key={field}
                direction='column'
                flex={1}
                position={field === 'imageUrl' ? 'relative' : 'static'}
              >
                <FormLabel htmlFor={`${field}-${index}`} fontSize='xs' mb={0}>
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </FormLabel>
                <Input
                  id={`${field}-${index}`}
                  placeholder={`Enter ${field}`}
                  value={site[field]}
                  onChange={(e) =>
                    handleSiteChange(index, field, e.target.value)
                  }
                  size='sm'
                  isInvalid={
                    field === 'imageUrl' &&
                    imageValidation[index]?.valid === false
                  }
                />
                {field === 'imageUrl' &&
                  imageValidation[index]?.valid === false && (
                    <Tooltip
                      label={imageValidation[index]?.error}
                      placement='top'
                      hasArrow
                    >
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
            ))}
          </Flex>

          {/* Only show IconPreview when auto-validation is enabled and its a valid image url */}
          {autoValidateUrls && (
            <IconPreview
              imageUrl={site.imageUrl}
              validationState={imageValidation[index]}
            />
          )}

          <IconButton
            aria-label='Remove site'
            icon={<FiX />}
            size='sm'
            color='red.500'
            variant='ghost'
            onClick={() => removeSite(index)}
          />
        </Flex>
      ))}
    </Flex>
  );
};
