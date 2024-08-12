import React from 'react';
import {
  Flex,
  CircularProgress,
  CircularProgressLabel,
  useTheme,
} from '@chakra-ui/react';
import { useTranslation } from '@fedimint/utils';

export const Loading: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Flex
      bgColor={theme.colors.white}
      justifyContent='center'
      alignItems='center'
    >
      <CircularProgress
        isIndeterminate={true}
        color={theme.colors.blue[600]}
        size='240px'
        thickness='8px'
        capIsRound={true}
      >
        <CircularProgressLabel
          fontSize='md'
          fontWeight='500'
          color={theme.colors.gray[600]}
          fontFamily={theme.fonts.body}
          textAlign='center'
          width='150px'
        >
          {t('admin.fetch-info-modal-text')}
        </CircularProgressLabel>
      </CircularProgress>
    </Flex>
  );
};
