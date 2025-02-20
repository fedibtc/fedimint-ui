import React, { useState } from 'react';
import {
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Button,
  Text,
  useTheme,
  InputGroup,
  IconButton,
  InputRightAddon,
} from '@chakra-ui/react';
import { useTranslation } from '@fedimint/utils';
import { FormGroup } from '@fedimint/ui';
import LightbulbLogo from '../../../../assets/svgs/lightbulb.svg?react';
import { generatePassword } from '../../../../utils';
import { FiEye, FiEyeOff } from 'react-icons/fi';

interface BasicSettingsFormProps {
  myName: string;
  setMyName: (name: string) => void;
  password: string | null;
  setPassword: (password: string) => void;
}

export const BasicSettingsForm: React.FC<BasicSettingsFormProps> = ({
  myName,
  setMyName,
  password,
  setPassword,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <FormGroup
      icon={LightbulbLogo}
      title={`${t('set-config.basic-settings')}`}
      isOpen={true}
    >
      <FormControl>
        <FormLabel>{t('set-config.guardian-name')}</FormLabel>
        <Input
          value={myName}
          onChange={(ev) => setMyName(ev.currentTarget.value)}
        />
        <FormHelperText>{t('set-config.guardian-name-help')}</FormHelperText>
      </FormControl>
      <FormControl>
        <FormLabel>{t('set-config.admin-password')}</FormLabel>
        {password === null ? (
          <Button onClick={() => setPassword(generatePassword())} w='100%'>
            {t('set-config.admin-password-generate')}
          </Button>
        ) : (
          <InputGroup>
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              placeholder='Password'
              onChange={(ev) => setPassword(ev.currentTarget.value)}
            />
            <InputRightAddon>
              <IconButton
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                icon={showPassword ? <FiEyeOff /> : <FiEye />}
                onClick={() => setShowPassword(!showPassword)}
                variant='ghost'
                m={-4}
              />
            </InputRightAddon>
          </InputGroup>
        )}
        <FormHelperText style={{ marginTop: '16px', marginBottom: '16px' }}>
          <Text color={theme.colors.yellow[500]}>
            {password === null
              ? t('set-config.admin-password-set')
              : t('set-config.admin-password-help')}
          </Text>
        </FormHelperText>
      </FormControl>
    </FormGroup>
  );
};
