import React, { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import { SharedChakraProvider, theme } from '@fedimint/ui';
import { AppContextProvider } from '../../context/AppContext';

vi.mock('@fedimint/utils', async () => {
  const originalModule = await vi.importActual('@fedimint/utils');

  return {
    ...originalModule,
    useTranslation: () => ({
      t: (str: string) => str,
    }),
  };
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <MemoryRouter>
      <SharedChakraProvider theme={theme}>
        <AppContextProvider>{children}</AppContextProvider>
      </SharedChakraProvider>
    </MemoryRouter>
  );
};

const customRender = (ui: ReactElement) => render(ui, { wrapper: TestWrapper });

export * from '@testing-library/react';
export { customRender as render };
