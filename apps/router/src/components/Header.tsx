import React from 'react';
import { Flex } from '@chakra-ui/react';
import { Logo } from './Logo';

export const Header = function Header() {
  return (
    <Flex width='100%' justifyContent={['space-between']} mb='30px'>
      <Logo />
    </Flex>
  );
};
