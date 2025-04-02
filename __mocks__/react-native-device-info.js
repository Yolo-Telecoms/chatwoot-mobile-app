/* eslint-disable no-undef */
jest.mock('react-native-device-info', () => {
  return {
    getVersion: () => 4,
  };
});
