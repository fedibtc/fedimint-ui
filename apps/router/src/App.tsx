import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { GuardianContextProvider } from './context/guardian/GuardianContext';
import { GatewayContextProvider } from './context/gateway/GatewayContext';
import { Guardian } from './guardian-ui/Guardian';
import { Gateway } from './gateway-ui/Gateway';
import { Wrapper } from './components/Wrapper';
import HomePage from './pages/Home';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route
          path='/guardians/:id'
          element={
            <Wrapper>
              <GuardianContextProvider>
                <Guardian />
              </GuardianContextProvider>
            </Wrapper>
          }
        />
        <Route
          path='/gateways/:id'
          element={
            <Wrapper>
              <GatewayContextProvider>
                <Gateway />
              </GatewayContextProvider>
            </Wrapper>
          }
        />
      </Routes>
    </Router>
  );
}
