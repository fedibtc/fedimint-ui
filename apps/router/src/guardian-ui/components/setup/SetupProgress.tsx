import React from 'react';
import {
  Box,
  Center,
  Flex,
  Hide,
  Progress,
  Show,
  Text,
  useTheme,
} from '@chakra-ui/react';
import CheckIcon from '../../assets/svgs/white-check.svg?react';
import { useTranslation } from '@fedimint/utils';
import { StepState } from '../../../types/guardian';

interface StepProps {
  text: string;
  state: StepState;
  isFirst?: boolean;
}

const Step: React.FC<StepProps> = ({ text, state, isFirst }) => {
  const theme = useTheme();

  const colorState = (
    inActiveColor: string,
    activeColor: string,
    completedColor: string
  ) =>
    state === StepState.InActive
      ? inActiveColor
      : state === StepState.Active
      ? activeColor
      : completedColor;

  return (
    <Flex
      w={isFirst ? 'auto' : '100%'}
      position='relative'
      flexDir='column'
      alignItems='flex-end'
      justifyContent='space-between'
      pb={{ base: '24px', md: '28px' }}
    >
      <Flex alignItems='center' h='100%' w='100%'>
        <Box
          w='100%'
          h='2px'
          bgColor={
            state === StepState.InActive
              ? theme.colors.gray[200]
              : theme.colors.blue[600]
          }
        ></Box>
        <Flex>
          <Center
            borderRadius={'50%'}
            h={state === StepState.Active ? '36px' : '24px'}
            w={state === StepState.Active ? '36px' : '24px'}
            bgColor={colorState(
              'transparent',
              theme.colors.blue[50],
              'transparent'
            )}
          >
            <Center
              borderRadius='50%'
              h='24px'
              w='24px'
              bgColor={colorState(
                theme.colors.gray[100],
                theme.colors.blue[600],
                theme.colors.blue[600]
              )}
            >
              {state === StepState.Completed ? (
                <CheckIcon />
              ) : (
                <Center
                  borderRadius='50%'
                  h='8px'
                  w='8px'
                  bgColor='white'
                ></Center>
              )}
            </Center>
          </Center>
        </Flex>
      </Flex>
      <Text
        position='absolute'
        bottom={0}
        right={0}
        transform={`translateX(50%) translateX(${
          state === StepState.Active ? '-18px' : '-12px'
        })`}
        textAlign='center'
        fontWeight='600'
        fontSize='14px'
        color={colorState(
          theme.colors.gray[700],
          theme.colors.blue[600],
          theme.colors.gray[700]
        )}
        whiteSpace='nowrap'
      >
        {text}
      </Text>
    </Flex>
  );
};

interface SetupProgressProps {
  setupProgress: number;
  isHost: boolean;
}

export const SetupProgress: React.FC<SetupProgressProps> = ({
  setupProgress,
  isHost,
}) => {
  const { t } = useTranslation();

  return (
    <Flex justifyContent='center' alignItems='center' w='100%'>
      <Hide below='md'>
        <Flex w='100%' px={{ base: 7, md: 9 }} justifyContent='space-between'>
          <Step
            text={t('setup.progress.set-config.step')}
            state={setupProgress === 1 ? StepState.Active : StepState.Completed}
            isFirst
          />
          <Step
            text={t(
              isHost
                ? 'setup.progress.connect-guardians.step-leader'
                : 'setup.progress.connect-guardians.step-follower'
            )}
            state={
              setupProgress === 2
                ? StepState.Active
                : setupProgress > 2
                ? StepState.Completed
                : StepState.InActive
            }
          />
          <Step
            text={t('setup.progress.verify-guardians.step')}
            state={
              setupProgress === 4
                ? StepState.Active
                : setupProgress > 4
                ? StepState.Completed
                : StepState.InActive
            }
          />
          <Step
            text={t('setup.progress.setup-complete.step')}
            state={
              setupProgress === 5 ? StepState.Completed : StepState.InActive
            }
          />
        </Flex>
      </Hide>
      <Show below='md'>
        <Progress
          w='100%'
          value={(setupProgress / 5) * 100}
          size='sm'
          colorScheme='blue'
          borderRadius='100'
        />
      </Show>
    </Flex>
  );
};
