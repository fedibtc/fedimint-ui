import React from 'react';
import { Box, Flex, useBreakpointValue } from '@chakra-ui/react';
import { Header } from './Header';
import { Footer } from './Footer';

export interface WrapperProps {
  children: React.ReactNode;
}

export const Wrapper = function Wrapper({
  children,
}: WrapperProps): JSX.Element {
  const size = useBreakpointValue({ base: 'md', lg: 'lg' });
  return (
    <Box position='relative' minHeight='100vh'>
      <Flex flexDir='column' alignItems='center'>
        <Box
          maxW={size === 'lg' ? '1200px' : '960px'}
          mt={10}
          mb={20}
          mr={[2, 4, 6, 10]}
          ml={[2, 4, 6, 10]}
          pl={5}
          pr={5}
          width='100%'
          alignItems='center'
        >
          <Header />
          {children}
        </Box>
      </Flex>
      <Footer />
    </Box>
  );
};
