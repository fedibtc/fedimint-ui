import React, { useCallback } from 'react';
import { Button, Flex } from '@chakra-ui/react';
import { useTranslation } from '@fedimint/utils';
import { FiDownload, FiUpload } from 'react-icons/fi';

interface MetaJsonActionsProps {
  customMeta: Record<string, string>;
  sites: string;
  setCustomMeta: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setSites: React.Dispatch<React.SetStateAction<string>>;
}

export const MetaJsonActions: React.FC<MetaJsonActionsProps> = ({
  customMeta,
  sites,
  setCustomMeta,
  setSites,
}) => {
  const { t } = useTranslation();

  const handleExportJson = useCallback(() => {
    try {
      // Parse sites string to JSON if it's valid
      let sitesArray = [];
      try {
        sitesArray = JSON.parse(sites);
      } catch (e) {
        console.warn('Could not parse sites as JSON, using empty array', e);
      }

      // Combine customMeta and sites into a single JSON object
      const exportData = {
        ...customMeta,
        sites: sitesArray,
      };

      // Create a JSON string with pretty formatting
      const jsonString = JSON.stringify(exportData, null, 2);

      // Create a blob from the JSON string
      const blob = new Blob([jsonString], { type: 'application/json' });

      // Create a URL for the blob
      const url = URL.createObjectURL(blob);

      // Create a temporary anchor element to trigger the download
      const a = document.createElement('a');
      a.href = url;
      a.download = 'federation-meta.json';
      document.body.appendChild(a);
      a.click();

      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log('Meta fields exported successfully');
    } catch (error) {
      console.error('Error exporting meta JSON:', error);
    }
  }, [customMeta, sites]);

  const handleImportJson = useCallback(() => {
    try {
      // Create a file input element
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'application/json';

      // Handle file selection
      fileInput.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const jsonData = JSON.parse(event.target?.result as string);

            // Extract sites field if it exists
            const { sites: importedSites, ...rest } = jsonData;

            // Update state with imported data
            if (importedSites) {
              // If importedSites is an array, stringify it
              if (Array.isArray(importedSites)) {
                setSites(JSON.stringify(importedSites));
              } else if (typeof importedSites === 'string') {
                // If it's already a string, use it directly
                setSites(importedSites);
              } else {
                // For any other type, convert to string
                setSites(JSON.stringify(importedSites));
              }
            }

            setCustomMeta(rest);

            console.log('Meta fields imported successfully');
          } catch (parseError) {
            console.error('Error parsing imported JSON:', parseError);
          }
        };

        reader.readAsText(file);
      };

      // Trigger file selection dialog
      fileInput.click();
    } catch (error) {
      console.error('Error importing meta JSON:', error);
    }
  }, [setCustomMeta, setSites]);

  return (
    <Flex gap={2}>
      <Button
        leftIcon={<FiUpload />}
        onClick={handleImportJson}
        variant='outline'
        colorScheme='blue'
        size='md'
      >
        {t('federation-dashboard.config.manage-meta.import-json')}
      </Button>
      <Button
        leftIcon={<FiDownload />}
        onClick={handleExportJson}
        variant='outline'
        colorScheme='blue'
        size='md'
      >
        {t('federation-dashboard.config.manage-meta.export-json')}
      </Button>
    </Flex>
  );
};
