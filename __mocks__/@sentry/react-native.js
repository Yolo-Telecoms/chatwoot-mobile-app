/* eslint-disable no-undef */
jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
}));
