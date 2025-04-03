// File: src/store/auth/specs/authSlice.spec.ts

import authReducer, { resetAuth, setAccount, AuthState } from '@/store/auth/authSlice';
import { mockUser } from './authMockData'; // <-- we only import what's actually used
import { authActions } from '@/store/auth/authActions';

// Remove these if not actually used in the tests
// import { mockHeaders } from './authMockData';   // no longer used
// import { UserRole } from '@/types';            // no longer used

jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
}));

jest.mock('@/i18n', () => ({
  t: (key: string) => key,
}));

jest.mock('@/helpers/ToastHelper', () => ({
  showToast: jest.fn(),
}));

jest.mock('@/services/APIService', () => ({
  apiService: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('Auth Slice', () => {
  // AuthState from your code
  const initialState: AuthState = {
    user: null,
    accessToken: null,
    uiFlags: {
      isLoggingIn: false,
      isResettingPassword: false,
    },
    headers: null,
    error: null,
  };

  it('should handle initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('reducers', () => {
    // it('should handle logout', ... ) // Skipped for now

    it('should handle resetAuth', () => {
      // Provide a valid "availability_status"
      const state: AuthState = {
        ...initialState,
        user: {
          ...mockUser,
          accounts: [],
          pubsub_token: 'token',
          avatar_url: 'url',
          available_name: 'name',
          availability_status: 'online' as const,
        },
        accessToken: 'token',
        headers: { 'access-token': 'token', uid: 'uid', client: 'client' },
        uiFlags: {
          isLoggingIn: false,
          isResettingPassword: false,
        },
        error: null,
      };
      expect(authReducer(state, resetAuth())).toEqual(initialState);
    });

    it('should handle setAccount', () => {
      const state: AuthState = {
        ...initialState,
        user: {
          ...mockUser,
          accounts: [],
          pubsub_token: '',
          avatar_url: '',
          available_name: '',
          // also fix availability_status here
          availability_status: 'online' as const,
        },
      };
      expect(authReducer(state, setAccount(123))).toEqual(state);
    });
  });

  describe('auth extra reducers', () => {
    it('should set isLoggingIn to true when login is pending', () => {
      const action = { type: authActions.login.pending.type };
      const state = authReducer(initialState, action);
      expect(state.uiFlags.isLoggingIn).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle login.fulfilled', () => {
      const payload = {
        user: mockUser,
        headers: { 'access-token': 'token', uid: 'uid', client: 'client' },
      };
      const action = { type: authActions.login.fulfilled.type, payload };
      const state = authReducer(initialState, action);
      expect(state.user).toEqual(mockUser);
      expect(state.headers).toEqual(payload.headers);
      expect(state.uiFlags.isLoggingIn).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle login.rejected', () => {
      const error = 'Invalid credentials';
      const action = {
        type: authActions.login.rejected.type,
        payload: { errors: [error] },
      };
      const state = authReducer(initialState, action);
      expect(state.uiFlags.isLoggingIn).toBe(false);
      expect(state.error).toBe(error);
    });
  });
});
