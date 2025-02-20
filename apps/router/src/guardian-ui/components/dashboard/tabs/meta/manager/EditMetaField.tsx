import {
  Box,
  Button,
  Flex,
  FormControl,
  FormHelperText,
  IconButton,
  Input,
  Link,
  useTheme,
} from '@chakra-ui/react';
import React from 'react';
import { MetaFields } from '@fedimint/types';
import { useTranslation, Trans } from '@fedimint/utils';
import TrashIcon from '../../../../assets/svgs/trash.svg?react';
import PlusIcon from '../../../../assets/svgs/plus.svg?react';

interface Props {
  metaFields: MetaFields;
  onChangeMetaFields: (value: MetaFields) => void;
  protectDerivedMeta?: boolean;
}

export const EditMetaField: React.FC<Props> = ({
  metaFields,
  onChangeMetaFields,
  protectDerivedMeta = true,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const derivedMetaKeys = ['federation_name'];

  const handleChangeMetaField = (key: string, value: string, index: number) => {
    const newFields = [...metaFields];
    newFields[index] = [key, value];
    onChangeMetaFields(newFields);
  };

  const handleRemoveMetaField = (idx: number) => {
    onChangeMetaFields(metaFields.filter((_, i) => i !== idx));
  };

  const handleAddMetaField = () => {
    onChangeMetaFields([...metaFields, ['', '']]);
  };

  return (
    <FormControl>
      <Flex direction='column' gap={3}>
        <Box as='h2' fontSize='xl' m={2}>
          {t('set-config.meta-fields-title')}
        </Box>
        <FormHelperText mt={0} mb={2}>
          <Trans
            i18nKey='set-config.meta-fields-description'
            components={{
              docs: (
                <Link
                  href='https://github.com/fedimint/fedimint/blob/master/docs/meta_fields/README.md'
                  target='_blank'
                  rel='noopener noreferrer'
                  color={theme.colors.blue[600]}
                />
              ),
            }}
          />
        </FormHelperText>
        {metaFields.map(([key, value], idx) => {
          const isDerived = derivedMetaKeys.includes(key);
          return (
            <Flex gap={2} key={idx} align='center'>
              <Input
                placeholder={t('set-config.meta-fields-key')}
                value={key}
                isDisabled={isDerived ? protectDerivedMeta : false}
                onChange={(ev) =>
                  handleChangeMetaField(ev.target.value, value, idx)
                }
              />
              <Input
                placeholder={isDerived ? '' : t('set-config.meta-fields-value')}
                value={value}
                isDisabled={isDerived && protectDerivedMeta}
                onChange={(ev) =>
                  handleChangeMetaField(key, ev.target.value, idx)
                }
              />
              {isDerived && protectDerivedMeta ? (
                <Box width={'58px'} height={'42px'} opacity={0} /> // Invisible placeholder
              ) : (
                <IconButton
                  variant='ghost'
                  size='xs'
                  width={'42px'}
                  height={'42px'}
                  fontSize={12}
                  aria-label={t('common.remove')}
                  colorScheme='red'
                  color={theme.colors.gray[300]}
                  _hover={{ color: theme.colors.red[500] }}
                  icon={<TrashIcon height={20} />}
                  onClick={() => handleRemoveMetaField(idx)}
                />
              )}
            </Flex>
          );
        })}
        <Button
          leftIcon={<PlusIcon height={20} width={20} />}
          variant='outline'
          onClick={handleAddMetaField}
        >
          {t('set-config.meta-fields-add-another')}
        </Button>
      </Flex>
    </FormControl>
  );
};
