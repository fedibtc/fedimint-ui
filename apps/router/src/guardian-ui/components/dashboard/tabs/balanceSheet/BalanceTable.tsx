import React from 'react';
import {
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Icon,
  Flex,
  Box,
  Text,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import CheckIcon from '../../../../assets/svgs/check-circle.svg?react';
import CloseIcon from '../../../../assets/svgs/x-circle.svg?react';
import { AuditSummary, ModuleKind, MSats } from '@fedimint/types';
import { formatValue } from '@fedimint/utils';

interface BalanceTableProps {
  auditSummary: AuditSummary;
  unit: 'msats' | 'sats' | 'btc';
}

export const BalanceTable: React.FC<BalanceTableProps> = ({
  auditSummary,
  unit,
}) => {
  const moduleSummaries = Object.entries(auditSummary.module_summaries).filter(
    ([, module]) => module.kind !== ModuleKind.Unknown
  );

  const totalAssets = moduleSummaries.reduce((sum, [, module]) => {
    return sum + (module.net_assets > 0 ? module.net_assets : 0);
  }, 0) as MSats;
  const totalLiabilities = moduleSummaries.reduce((sum, [, module]) => {
    return sum + Math.abs(module.net_assets < 0 ? module.net_assets : 0);
  }, 0) as MSats;

  return (
    <Grid templateColumns='1fr' gap={4} width='100%'>
      <GridItem width='100%'>
        <Table variant='simple' width='100%'>
          <Thead>
            <Tr>
              <Th>Module</Th>
              <Th isNumeric>Assets</Th>
              <Th isNumeric>Liabilities</Th>
            </Tr>
          </Thead>
          <Tbody>
            {moduleSummaries.map(([key, module]) => (
              <Tr key={key}>
                <Td>{module.kind}</Td>
                <Td isNumeric>
                  {module.net_assets > 0
                    ? formatValue(module.net_assets, unit)
                    : '0'}
                </Td>
                <Td isNumeric>
                  {module.net_assets < 0
                    ? formatValue(Math.abs(module.net_assets) as MSats, unit)
                    : '0'}
                </Td>
              </Tr>
            ))}
            <Tr>
              <Td fontWeight='bold'>Total</Td>
              <Td isNumeric fontWeight='bold'>
                {formatValue(totalAssets, unit)}
              </Td>
              <Td isNumeric fontWeight='bold'>
                {formatValue(totalLiabilities, unit)}
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </GridItem>

      <GridItem width='100%'>
        <Grid templateColumns='repeat(2, 1fr)' gap={4} width='100%'>
          {totalAssets - totalLiabilities > 0 && (
            <GridItem>
              <Box
                p={4}
                borderWidth={1}
                borderRadius='md'
                height='100%'
                width='100%'
              >
                <Text fontWeight='bold' mb={2}>
                  Accumulated Fees:
                </Text>
                <Flex justifyContent='space-between' alignItems='center'>
                  <Text>
                    {formatValue(
                      (totalAssets - totalLiabilities) as MSats,
                      unit
                    ) +
                      ' ' +
                      unit}
                  </Text>
                </Flex>
              </Box>
            </GridItem>
          )}

          <GridItem>
            <Box
              p={4}
              borderWidth={1}
              borderRadius='md'
              height='100%'
              width='100%'
            >
              <Text fontWeight='bold' mb={2}>
                Full Reserve?
              </Text>
              <Flex justifyContent='space-between' alignItems='center'>
                {totalAssets >= totalLiabilities ? (
                  <Flex alignItems='center'>
                    <Text mr={2} fontWeight='bold' color='green.500'>
                      Yes
                    </Text>
                    <Icon as={CheckIcon} color='green.500' />
                  </Flex>
                ) : (
                  <Flex alignItems='center'>
                    <Text mr={2} fontWeight='bold' color='red.500'>
                      No
                    </Text>
                    <Icon as={CloseIcon} color='red.500' />
                  </Flex>
                )}
              </Flex>
            </Box>
          </GridItem>
        </Grid>
      </GridItem>
    </Grid>
  );
};
