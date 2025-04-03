// File: src/store/auth/specs/authMockData.ts

import { UserRole } from '@/types'; // Or wherever you define the role

/**
 * Fill in *all* required fields from your real "User" interface.
 *
 * Adjust as needed if some fields are optional in your code.
 */
export const mockUser = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  account_id: 123,

  // Additional required fields from your actual "User" interface:
  identifier_hash: 'sample-hash',
  availability: 'online',
  thumbnail: 'some-avatar-url',
  availability_status: 'available',
  type: 'user',

  // If you’re storing role, accounts, etc. for your test scenario:
  role: 'agent' as UserRole,
  accounts: [],
  pubsub_token: '',
  avatar_url: '',
  available_name: '',
};

export const mockHeaders = {
  'access-token': 'SxsseweDSEWESDSSSSFDFDf',
  uid: 'uid',
  client: 'client',
};
