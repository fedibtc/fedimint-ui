import React, { ReactElement } from 'react';
import { Flex, useTheme, Link, Icon } from '@chakra-ui/react';
import { FaDiscord, FaGithub } from 'react-icons/fa';
import { LATEST_RELEASE_TAG } from '../constants';

export const Footer = () => {
  const theme = useTheme();

  interface CustomLinkProps {
    href: string;
    children: string | ReactElement;
  }

  const CustomLink = ({ href, children }: CustomLinkProps) => {
    return (
      <Link
        _hover={{ textDecoration: 'underline' }}
        fontSize='sm'
        fontWeight='500'
        color={theme.colors.gray[800]}
        transition={`text-decoration 1s ease-in-out`}
        href={href}
        target='_blank'
        rel='noreferrer'
        w='fit-content'
      >
        {children}
      </Link>
    );
  };

  return (
    <Flex
      bgColor={theme.colors.gray[100]}
      h='50px'
      w='100%'
      pl={5}
      pr={5}
      align='center'
      justify='space-between'
      position='fixed'
      bottom='0'
    >
      <CustomLink
        href={`https://github.com/fedimint/ui/releases/tag/${LATEST_RELEASE_TAG}`}
      >
        {LATEST_RELEASE_TAG}
      </CustomLink>
      <CustomLink href='https://fedimint.org'>&copy; Fedimint</CustomLink>
      <div>
        <CustomLink href='https://chat.fedimint.org/'>
          <Icon fontSize='24px' mr='2'>
            <FaDiscord />
          </Icon>
        </CustomLink>
        <CustomLink href='https://github.com/fedimint'>
          <Icon fontSize='22px'>
            <FaGithub />
          </Icon>
        </CustomLink>
      </div>
    </Flex>
  );
};
