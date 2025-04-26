import React, { Component, ReactNode } from 'react';
import { Box, Button, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { withTranslation, WithTranslation } from 'react-i18next';

interface ErrorBoundaryProps extends WithTranslation {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Caught Error: ', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          width='100%'
          height='100vh'
          display='flex'
          alignItems='center'
          justifyContent='center'
          flexDirection='column'
        >
          <Logo />
          <Text
            fontSize='xl'
            fontWeight='bold'
            marginBottom={4}
            marginTop={8}
            color='red.500'
          >
            {this.props.t('errorBoundary.something-went-wrong')}
          </Text>

          <Link to={'/'}>
            <Button width={52} colorScheme='blue'>
              {this.props.t('errorBoundary.visit-home')}
            </Button>
          </Link>
          <Button
            width={52}
            marginTop={2}
            onClick={() => window.location.reload()}
            colorScheme='blue'
          >
            {this.props.t('errorBoundary.reload-page')}
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default withTranslation()(ErrorBoundary);
