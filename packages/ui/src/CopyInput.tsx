import React from 'react';
import {
  InputGroup,
  Input,
  Button,
  InputRightElement,
  useClipboard,
  Flex,
} from '@chakra-ui/react';
import { useTheme } from './theme';

export interface CopyInputProps {
  value: string;
  size?: 'sm' | 'md' | 'lg';
  buttonLeftIcon?: React.ReactElement;
}

export const CopyInput: React.FC<CopyInputProps> = ({
  value,
  size = 'md',
  buttonLeftIcon,
}) => {
  const { onCopy, hasCopied } = useClipboard(value);
  const theme = useTheme();
  const buttonWidth = {
    lg: '115px',
    md: '100px',
    sm: '96px',
  }[size];

  return (
    <InputGroup width='100%' size={size}>
      <Input
        readOnly
        value={value}
        width='100%'
        textOverflow='ellipsis'
        overflow='hidden'
        paddingRight={buttonWidth}
        bg={theme.colors.white}
      />
      <InputRightElement
        borderLeft={`1px solid ${theme.colors.border.input}`}
        width={buttonWidth}
        top='1px'
        right='1px'
        height='calc(100% - 2px)'
      >
        <Button
          variant='ghost'
          leftIcon={
            <Flex align='center' fontSize='20px'>
              {buttonLeftIcon}
            </Flex>
          }
          onClick={onCopy}
          borderRadius={theme.components.Input.sizes[size].addon.borderRadius}
          borderTopLeftRadius={0}
          borderBottomLeftRadius={0}
          size={size}
          height='100%'
          width='100%'
          colorScheme='gray'
          bg={theme.colors.white}
          color={theme.colors.gray[700]}
        >
          {hasCopied ? 'Copied' : 'Copy'}
        </Button>
      </InputRightElement>
    </InputGroup>
  );
};
