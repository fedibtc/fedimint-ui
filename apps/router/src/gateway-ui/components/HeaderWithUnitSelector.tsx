import React from 'react';
import { Flex, Heading, Tabs, TabList, Tab } from '@chakra-ui/react';
import { useTranslation } from '@fedimint/utils';
import { useGatewayContext } from '../../hooks';
import { GATEWAY_APP_ACTION_TYPE } from '../../types/gateway';
import { UNIT_OPTIONS } from '../../types';
import { useTheme } from '@fedimint/ui';

export const HeaderWithUnitSelector: React.FC = () => {
  const { dispatch } = useGatewayContext();
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Flex
      direction={['column', 'row']}
      justifyContent='space-between'
      alignItems={['flex-start', 'center']}
    >
      <Heading
        as='h1'
        fontSize={['xl', '2xl']}
        fontWeight='500'
        color={theme.colors.gray[900]}
      >
        {t('header.title')}
      </Heading>
      <Tabs
        size='sm'
        variant='soft-rounded'
        defaultIndex={0}
        onChange={(index) => {
          dispatch({
            type: GATEWAY_APP_ACTION_TYPE.SET_UNIT,
            payload: UNIT_OPTIONS[index],
          });
        }}
      >
        <TabList>
          {UNIT_OPTIONS.map((option) => (
            <Tab
              key={option}
              _selected={{
                bg: theme.colors.blue[500],
                color: 'white',
              }}
            >
              {option.toUpperCase()}
            </Tab>
          ))}
        </TabList>
      </Tabs>
    </Flex>
  );
};
