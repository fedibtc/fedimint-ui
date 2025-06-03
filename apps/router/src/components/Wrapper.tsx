import React from 'react';
import { Flex } from '@chakra-ui/react';
import { Header } from './Header';
import { Footer } from './Footer';

export interface WrapperProps {
  children: React.ReactNode;
}

export const Wrapper = function Wrapper({
  children,
}: WrapperProps): JSX.Element {
  return (
    <Flex flexDirection='column' height='100%'>
      <Header />
      <Flex
        flex={1}
        justifyContent='center'
        margin='80px auto 50px'
        width='100%'
        maxWidth='1080px'
      >
        {children}
      </Flex>
      <Footer />
    </Flex>
  );
};
