// File: src/store/conversation/conversationTypingSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TypingUser } from '@/types';
import { RootState } from '@/store';

interface TypingUserPayload {
  conversationId: number;
  user: TypingUser;
}

interface ConversationTypingState {
  records: { [conversationId: number]: TypingUser[] };
}

const initialState: ConversationTypingState = {
  // Must be an object, not array, or TS sees it as never[]
  records: {},
};

const conversationTypingSlice = createSlice({
  name: 'conversationTyping',
  initialState,
  reducers: {
    setTypingUsers: (state, action: PayloadAction<TypingUserPayload>) => {
      const { conversationId, user } = action.payload;
      const records = state.records[conversationId] ?? [];
      const hasUserRecordAlready = records.some(
        record => record.id === user.id && record.type === user.type,
      );
      if (!hasUserRecordAlready) {
        state.records[conversationId] = [...records, user];
      }
    },
    removeTypingUser: (state, action: PayloadAction<TypingUserPayload>) => {
      const { conversationId, user } = action.payload;
      const records = state.records[conversationId] ?? [];
      state.records[conversationId] = records.filter(
        record => !(record.id === user.id && record.type === user.type),
      );
    },
  },
});

export const { setTypingUsers, removeTypingUser } = conversationTypingSlice.actions;
export default conversationTypingSlice.reducer;

// 2) A direct function-based selector returning TypingUser[]
export const selectTypingUsersByConversationId = (
  state: RootState,
  conversationId: number,
): TypingUser[] => {
  const allRecords = state.conversationTyping.records;
  return allRecords[conversationId] || [];
};
