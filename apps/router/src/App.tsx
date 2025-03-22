import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom';
import { useAppContext } from './hooks';
import { GuardianContextProvider } from './context/guardian/GuardianContext';
import { GatewayContextProvider } from './context/gateway/GatewayContext';
import { Guardian } from './guardian-ui/Guardian';
import { Gateway } from './gateway-ui/Gateway';
import { Wrapper } from './components/Wrapper';
import HomePage from './pages/Home';

export default function App() {
  const { service } = useAppContext();

  return (
    <Router>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route
          path='/guardians/:id'
          element={
            service ? (
              <Wrapper>
                <GuardianContextProvider>
                  <Guardian />
                </GuardianContextProvider>
              </Wrapper>
            ) : (
              <Navigate replace to='/' />
            )
          }
        />
        <Route
          path='/gateways/:id'
          element={
            service ? (
              <Wrapper>
                <GatewayContextProvider>
                  <Gateway />
                </GatewayContextProvider>
              </Wrapper>
            ) : (
              <Navigate replace to='/' />
            )
          }
        />
      </Routes>
    </Router>
  );
}
