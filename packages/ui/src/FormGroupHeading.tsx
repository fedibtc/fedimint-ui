import React from 'react';
import { Icon, Heading, Spacer, Button } from '@chakra-ui/react';
import { theme } from './theme';

interface Props {
  icon?: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  title: React.ReactNode;
  onClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  chevronIcon?: string;
}

export const FormGroupHeading: React.FC<Props> = ({
  icon,
  title,
  onClick,
  chevronIcon,
}) => {
  return (
    <Button
      mb={3}
      variant='ghost'
      bg={theme.colors.gray[100]}
      color={theme.colors.gray[700]}
      p={2}
      borderRadius={8}
      onClick={onClick}
      cursor='pointer'
    >
      {icon && <Icon width='20px' height='20px' mr={2} as={icon} />}
      <Heading fontSize='md' lineHeight='20px' fontWeight='700'>
        {title}
      </Heading>
      <Spacer />
      {chevronIcon}
    </Button>
  );
};
