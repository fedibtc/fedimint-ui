import { useToast as useChakraToast, UseToastOptions } from '@chakra-ui/react';
import { useCallback, useRef } from 'react';

// Default toast configuration
const DEFAULT_TOAST_CONFIG: UseToastOptions = {
  position: 'top-right',
  duration: 5000,
  isClosable: true,
};

/**
 * Custom hook for using toast notifications throughout the application
 */
export const useToast = () => {
  const toast = useChakraToast();
  const activeToasts = useRef<Record<string, string>>({});

  // Deduplication helper
  const showToast = useCallback(
    (
      title: string,
      description: string | undefined,
      status: 'success' | 'error' | 'warning' | 'info'
    ) => {
      // Create a key from the notification content to identify duplicates
      const toastKey = `${title}-${description}-${status}`;

      // If there's an active toast with the same content, don't show another one
      if (activeToasts.current[toastKey]) {
        return;
      }

      // Show the toast and store its ID
      const toastId = toast({
        title,
        description,
        status,
        ...DEFAULT_TOAST_CONFIG,
        // When the toast closes, remove it from our tracking
        onCloseComplete: () => {
          delete activeToasts.current[toastKey];
        },
      });

      // Track this toast
      activeToasts.current[toastKey] = toastId as string;
    },
    [toast]
  );

  // Success notification
  const success = useCallback(
    (title: string, description?: string) => {
      showToast(title, description, 'success');
    },
    [showToast]
  );

  // Error notification
  const error = useCallback(
    (title: string, description?: string) => {
      showToast(title, description, 'error');
    },
    [showToast]
  );

  // Warning notification
  const warning = useCallback(
    (title: string, description?: string) => {
      showToast(title, description, 'warning');
    },
    [showToast]
  );

  // Info notification
  const info = useCallback(
    (title: string, description?: string) => {
      showToast(title, description, 'info');
    },
    [showToast]
  );

  return {
    success,
    error,
    warning,
    info,
    toast,
  };
};
