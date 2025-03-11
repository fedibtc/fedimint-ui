import React from 'react';
import { Box, Image } from '@chakra-ui/react';

interface IconPreviewProps {
  imageUrl: string;
  validationState?: { valid: boolean; error: string };
}

export const IconPreview: React.FC<IconPreviewProps> = ({
  imageUrl,
  validationState,
}) => {
  const isValid = validationState === undefined ? true : validationState.valid;

  return (
    <Box
      width='40px'
      height='40px'
      borderRadius='md'
      overflow='hidden'
      bg='gray.100'
      display='flex'
      alignItems='center'
      justifyContent='center'
      boxShadow='sm'
      flexShrink={0}
    >
      {imageUrl && isValid ? (
        <Image
          src={imageUrl}
          alt='Icon'
          objectFit='cover'
          width='100%'
          height='100%'
          fallback={<Box>?</Box>}
        />
      ) : (
        <Box fontSize='md' fontWeight='bold' color='gray.400'>
          ?
        </Box>
      )}
    </Box>
  );
};
