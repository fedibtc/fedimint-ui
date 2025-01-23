import React from 'react';
import ReactDOM from 'react-dom/client';
import { Fonts, SharedChakraProvider, theme } from '@fedimint/ui';
import spaceGroteskTtf from '@fedimint/ui/assets/fonts/SpaceGrotesk-Variable.ttf';
import interTtf from '@fedimint/ui/assets/fonts/Inter-Variable.ttf';
import { ColorModeScript } from '@chakra-ui/react';
import { i18nProvider } from '@fedimint/utils';
import { languages } from './languages';
import { AppContextProvider } from './context/AppContext';
import App from './App';

i18nProvider(languages);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <SharedChakraProvider theme={theme}>
      <ColorModeScript />
      <Fonts spaceGroteskTtf={spaceGroteskTtf} interTtf={interTtf} />
      <AppContextProvider>
        <App />
      </AppContextProvider>
    </SharedChakraProvider>
  </React.StrictMode>
);
