import React from 'react';
import { Flex } from '@chakra-ui/react';
import { Logo } from './Logo';

export const Header = function Header() {
  return (
    <Flex
      alignItems='center'
      bg='#F9F9F9'
      borderBottom='1px solid #EFEFEF'
      height='80px'
      pl={5}
      pr={5}
      position='fixed'
      top='0'
      width='100%'
      zIndex={10}
    >
      <Logo />
    </Flex>
  );
};
