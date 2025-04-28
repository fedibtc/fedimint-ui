import React from 'react';
import {
  ChakraProvider,
  ChakraProviderProps,
  createStandaloneToast,
} from '@chakra-ui/react';

/**
 * Shared chakra provider avails the exact same context
 * between components in @fedimint/ui and apps / packages that depend on these components
 */
export const SharedChakraProvider: React.FC<ChakraProviderProps> = ({
  theme,
  children,
}: ChakraProviderProps) => {
  // Create toast with the same theme
  const { ToastContainer } = createStandaloneToast({ theme });

  return (
    <ChakraProvider theme={theme}>
      {children}
      <ToastContainer />
    </ChakraProvider>
  );
};

// Export useToast hook for convenience
export { useToast } from '@chakra-ui/react';
