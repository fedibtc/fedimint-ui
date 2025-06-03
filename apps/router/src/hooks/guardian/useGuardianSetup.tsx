import { useContext } from 'react';
import {
  SetupContext,
  SetupContextValue,
} from '../../context/guardian/SetupContext';
import { SetupApiInterface } from '../../api/GuardianApi';
import { GuardianContext } from '../../context/guardian/GuardianContext';

export const useGuardianSetupContext = (): SetupContextValue => {
  const setup = useContext(SetupContext);
  if (!setup)
    throw new Error(
      'useGuardianSetupContext must be used within a SetupContextProvider'
    );
  return setup;
};

export const useGuardianSetupApi = (): SetupApiInterface => {
  const guardian = useContext(GuardianContext);
  if (!guardian)
    throw new Error(
      'useGuardianSetupApi must be used within a GuardianContextProvider'
    );

  return guardian.api;
};
