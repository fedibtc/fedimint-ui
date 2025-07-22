import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  Textarea,
  Text,
  useColorModeValue,
  Badge,
} from '@chakra-ui/react';
import { useTranslation } from '@fedimint/utils';

interface MetaJsonEditorProps {
  customMeta: Record<string, string>;
  sites: string;
  onChange: (customMeta: Record<string, string>, sites: string) => void;
}

export const MetaJsonEditor: React.FC<MetaJsonEditorProps> = ({
  customMeta,
  sites,
  onChange,
}) => {
  const { t } = useTranslation();
  const [jsonText, setJsonText] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Background color for the JSON editor
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Convert the customMeta and sites to a JSON string
  useEffect(() => {
    try {
      // Parse sites string to JSON if it's valid
      let sitesArray = [];
      try {
        sitesArray = JSON.parse(sites);
      } catch (e) {
        console.warn('Could not parse sites as JSON, using empty array', e);
      }

      // If there are no custom meta fields and sites is empty, show a template
      if (
        Object.keys(customMeta).length === 0 &&
        (sitesArray.length === 0 ||
          (Array.isArray(sitesArray) &&
            sitesArray.every(
              (s) => !s.id && !s.url && !s.title && !s.imageUrl
            )))
      ) {
        const templateData = {
          custom_1: '',
          federation_name: '',
          welcome_message: '',
          federation_icon_url: '',
          sites: [
            {
              id: '',
              url: '',
              title: '',
              imageUrl: '',
            },
          ],
        };
        setJsonText(JSON.stringify(templateData, null, 2));
      } else {
        const jsonData = {
          ...customMeta,
          sites: sitesArray,
        };

        setJsonText(JSON.stringify(jsonData, null, 2));
      }

      setIsValid(true);
      setErrorMessage('');
    } catch (error) {
      console.error('Error converting meta to JSON:', error);
      setIsValid(false);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
    }
  }, [customMeta, sites]);

  // Handle changes to the JSON text
  const handleJsonChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newJsonText = e.target.value;
      setJsonText(newJsonText);

      try {
        const parsed = JSON.parse(newJsonText);
        const { sites: newSites, ...rest } = parsed;

        setIsValid(true);
        setErrorMessage('');

        // Only update parent if JSON is valid
        onChange(
          rest,
          Array.isArray(newSites)
            ? JSON.stringify(newSites)
            : typeof newSites === 'string'
            ? newSites
            : '[]'
        );
      } catch (error) {
        setIsValid(false);
        setErrorMessage(
          error instanceof Error ? error.message : 'Invalid JSON'
        );
        // Don't update parent if JSON is invalid
      }
    },
    [onChange]
  );

  return (
    <Box>
      <FormControl>
        <FormLabel display='flex' alignItems='center'>
          {t('federation-dashboard.config.manage-meta.json-editor')}
          <Badge ml={2} colorScheme={isValid ? 'green' : 'red'} variant='solid'>
            {isValid
              ? t('federation-dashboard.config.manage-meta.valid-json')
              : t('federation-dashboard.config.manage-meta.invalid-json')}
          </Badge>
        </FormLabel>
        <Textarea
          value={jsonText}
          onChange={handleJsonChange}
          minHeight='300px'
          fontFamily='monospace'
          bg={bgColor}
          borderColor={borderColor}
          _hover={{ borderColor: isValid ? 'blue.300' : 'red.300' }}
          borderWidth={2}
          borderStyle='solid'
          borderRadius='md'
          p={4}
          spellCheck='false'
          autoComplete='off'
          autoCorrect='off'
          autoCapitalize='off'
          placeholder={`{
  "custom_1": "https://example.com/image.png",
  "federation_name": "My Federation",
  "welcome_message": "Welcome to our federation!",
  "federation_icon_url": "https://example.com/icon.png",
  "sites": [
    {
      "id": "1",
      "url": "http://localhost:3000/guardians/...",
      "title": "Guardian 1",
      "imageUrl": "https://example.com/image.png"
    }
  ]
}`}
        />
        {!isValid && (
          <Text color='red.500' fontSize='sm' mt={2}>
            {errorMessage}
          </Text>
        )}
      </FormControl>
    </Box>
  );
};
