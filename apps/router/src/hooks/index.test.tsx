import { vi } from 'vitest';
import { renderHook, waitFor } from '../utils/testing/customRender';
import { APP_ACTION_TYPE } from '../context/AppContext';
import { useAppInit } from './';

vi.mock('@fedimint/utils');

const mockedDispatch = vi.fn();

describe('hooks/index', () => {
  beforeEach(async () => {
    const utils = await import('@fedimint/utils');
    utils.sha256Hash = vi.fn().mockReturnValue('dummy-hash-value');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('useAppInit', () => {
    describe('When no url is provided', () => {
      it('should not call dispatch', () => {
        renderHook(() => useAppInit(mockedDispatch));

        expect(mockedDispatch).not.toHaveBeenCalled();
      });
    });

    describe('When guardian url is provided', () => {
      it('should call dispatch with correct args', async () => {
        renderHook(() => useAppInit(mockedDispatch, 'wss://guardian.com'));

        await waitFor(() => {
          expect(mockedDispatch).toBeCalledWith({
            type: APP_ACTION_TYPE.ADD_SERVICE,
            payload: {
              service: {
                config: {
                  id: 'dummy-hash-value',
                  baseUrl: 'wss://guardian.com',
                },
              },
            },
          });
        });
      });
    });

    describe('When gateway url is provided', () => {
      it('should call dispatch with correct args', async () => {
        renderHook(() => useAppInit(mockedDispatch, 'https://gateway.com'));

        await waitFor(() => {
          expect(mockedDispatch).toBeCalledWith({
            type: APP_ACTION_TYPE.ADD_SERVICE,
            payload: {
              service: {
                config: {
                  id: 'dummy-hash-value',
                  baseUrl: 'https://gateway.com',
                },
              },
            },
          });
        });
      });
    });
  });
});
