import { Flex, Text } from '@chakra-ui/react';
import React from 'react';
import { useTheme } from './theme';

interface KeyValue {
  key: string;
  label?: React.ReactNode;
  value: React.ReactNode;
}

export interface KeyValuesProps {
  keyValues: KeyValue[];
  direction?: 'row' | 'column';
}

export const KeyValues: React.FC<KeyValuesProps> = ({
  keyValues,
  direction = 'column',
}) => {
  const theme = useTheme();
  return (
    <Flex
      direction={direction}
      gap={direction === 'column' ? '24px' : '48px'}
      flexWrap='wrap'
    >
      {keyValues.map(({ key, label, value }) => (
        <Flex direction='column' gap='4px' key={key}>
          <Text
            size='sm'
            fontWeight='500'
            color={theme.colors.gray[500]}
            key={key}
          >
            {label || key}
          </Text>
          {value}
        </Flex>
      ))}
    </Flex>
  );
};
