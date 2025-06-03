import React from 'react';
import { Box, Center, Flex, Heading } from '@chakra-ui/icons';

type Props = {
  children: React.ReactElement;
  heading?: string;
};

export const CenterBox: React.FC<Props> = ({ children, heading }: Props) => {
  return (
    <Center
      display='flex'
      height='100%'
      justifyContent='center'
      width='100%'
      padding={{ base: 4, md: 10 }}
    >
      <Box
        bg='white'
        padding={{ base: 4, md: 8 }}
        borderRadius='10'
        width={{ base: '100%', md: '500px' }}
      >
        <Flex gap={3} flexDirection={'column'}>
          {heading && (
            <Heading
              fontSize={{ base: 24, md: 30 }}
              lineHeight={{ base: '24px', md: '30px' }}
            >
              {heading}
            </Heading>
          )}
          {children}
        </Flex>
      </Box>
    </Center>
  );
};
