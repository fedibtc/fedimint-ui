import React from 'react';
import { Flex, Heading, Text } from '@chakra-ui/react';
import { useTranslation } from '@fedimint/utils';
import { useTheme } from '@fedimint/ui';

interface ErrorMessageProps {
  error: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ error }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Flex
      direction='column'
      align='center'
      width='100%'
      paddingTop='10vh'
      paddingX='4'
      textAlign='center'
    >
      <Heading size='lg' marginBottom='4' color={theme.colors.red[500]}>
        {t('common.error')}
      </Heading>
      <Text fontSize='md' color={theme.colors.gray[700]}>
        {error}
      </Text>
    </Flex>
  );
};
