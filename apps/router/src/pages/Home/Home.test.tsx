import React from 'react';
import {
  act,
  render,
  screen,
  userEvent,
  waitFor,
} from '../../utils/testing/customRender';
import '@testing-library/jest-dom';
import HomePage from './Home';

// Mock AppContext
const mockedUseAppContext = jest.fn();
jest.mock('../../hooks', () => ({
  useAppContext: () => mockedUseAppContext(),
}));

// Mock sha256Hash
jest.mock('@fedimint/utils', () => ({
  ...jest.requireActual('@fedimint/utils'),
  sha256Hash: () => 'dummy-hash-value',
}));

describe('pages/Home', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('When a user clicks the connect button with an empty input value', () => {
    const mockDispatch = jest.fn();

    beforeEach(() => {
      mockedUseAppContext.mockImplementation(() => ({
        service: null,
        dispatch: mockDispatch,
      }));
    });

    it('should not call dispatch', async () => {
      render(<HomePage />);

      await act(async () => {
        const button = screen.getByLabelText('connect-button');
        userEvent.click(button);
      });

      await waitFor(() => {
        expect(mockDispatch).not.toHaveBeenCalled();
      });
    });
  });

  // We don't support gateway urls at this time so check for this
  describe('When a user clicks the connect button with a gateway url input value', () => {
    const mockDispatch = jest.fn();

    beforeEach(() => {
      mockedUseAppContext.mockImplementation(() => ({
        service: null,
        dispatch: mockDispatch,
      }));
    });

    it('should not call dispatch', async () => {
      render(<HomePage />);

      const input = screen.getByPlaceholderText(
        'Guardian URL'
      ) as HTMLInputElement;

      await act(async () => {
        userEvent.type(input, 'https://gateway-url.com:8175');

        const button = screen.getByLabelText('connect-button');
        userEvent.click(button);
      });

      await waitFor(() => {
        expect(mockDispatch).not.toHaveBeenCalled();
      });
    });
  });

  describe('When a user clicks the connect button with a guardian url input value', () => {
    const mockDispatch = jest.fn();

    beforeEach(() => {
      mockedUseAppContext.mockImplementation(() => ({
        service: null,
        dispatch: mockDispatch,
      }));
    });

    it('should call dispatch', async () => {
      render(<HomePage />);

      const input = screen.getByPlaceholderText(
        'Guardian URL'
      ) as HTMLInputElement;

      await act(async () => {
        userEvent.type(input, 'wss://guardian-url.com:8174');

        const button = screen.getByLabelText('connect-button');
        userEvent.click(button);
      });

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalled();
      });
    });
  });

  describe('When there is no service in LocalStorage', () => {
    beforeEach(() => {
      mockedUseAppContext.mockImplementation(() => ({
        service: null,
        dispatch: jest.fn(),
      }));
    });

    it('should render an input without a value', () => {
      render(<HomePage />);
      const input = screen.getByPlaceholderText('Guardian URL');

      expect(input).toBeInTheDocument();
    });
  });

  describe('When there is a guardian in LocalStorage', () => {
    beforeEach(() => {
      mockedUseAppContext.mockImplementation(() => ({
        service: {
          config: {
            id: '51c1eeeb3b350bfe050d8b7ac04700548f6d96c3d8dc2e8f4489a2ebc662833d',
            baseUrl: 'wss://fedimintd-l7ik.test.app:8174',
          },
        },
        dispatch: jest.fn(),
      }));
    });

    it('should render guardian url', () => {
      render(<HomePage />);
      const url = screen.getByDisplayValue(
        'wss://fedimintd-l7ik.test.app:8174'
      );
      expect(url).toBeInTheDocument();
    });
  });

  describe('When there is a gateway in LocalStorage', () => {
    beforeEach(() => {
      mockedUseAppContext.mockImplementation(() => ({
        service: {
          config: {
            id: '08fbbdb098ed66e0735a43c70ba71e4df12f27888f3facb619325e6f06bea314',
            baseUrl: 'https://gatewayd-1234.test.app:8175',
          },
        },
        dispatch: jest.fn(),
      }));
    });

    it('should render gateway url', () => {
      render(<HomePage />);
      const url = screen.getByDisplayValue(
        'https://gatewayd-1234.test.app:8175'
      );
      expect(url).toBeInTheDocument();
    });
  });
});
