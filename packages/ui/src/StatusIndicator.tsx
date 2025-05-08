import React, { FC } from 'react';
import { Box, Text, useColorModeValue } from '@chakra-ui/react';
import { useTheme } from './theme';

interface StatusIndicatorProps {
  status?: 'error' | 'warning' | 'success';
  children: React.ReactNode;
}

// Have to update pill color based on quorum.
export const StatusIndicator: FC<StatusIndicatorProps> = ({
  status,
  children,
}) => {
  const theme = useTheme();
  const color = theme.colors[status || 'gray'];
  const bgColor = useColorModeValue(
    status ? color[50] : color[100],
    color[700]
  );
  const textColor = useColorModeValue(color[700], color[200]);
  const dotColor = useColorModeValue(color[500], color[400]);
  return (
    <Box
      display='inline-flex'
      h='22px'
      p='0 8px'
      gap='6px'
      borderRadius='10px'
      alignItems='center'
      bgColor={bgColor}
    >
      <Box bgColor={dotColor} h='6px' w='6px' borderRadius='100%' />
      <Text
        color={textColor}
        fontSize='12px'
        lineHeight='16px'
        fontWeight='500'
      >
        {children}
      </Text>
    </Box>
  );
};
