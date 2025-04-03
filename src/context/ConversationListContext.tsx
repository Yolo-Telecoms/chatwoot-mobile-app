// File: src/context/ConversationListContext.tsx

import { createContext, useContext, FC } from 'react';
import { SharedValue, useSharedValue } from 'react-native-reanimated';

// We define our context's shape:
interface ConversationListStateContextType {
  openedRowIndex: SharedValue<number>;
}

// Create the context
const ConversationListStateContext = createContext<ConversationListStateContextType | undefined>(
  undefined,
);

// Provide a custom hook to consume this context
export const useConversationListStateContext = (): ConversationListStateContextType => {
  const context = useContext(ConversationListStateContext);
  if (!context) {
    throw new Error(
      'ConversationListStateContext: `ConversationListStateContext` is undefined. Wrap your component in ConversationListStateProvider.',
    );
  }
  return context;
};

// Create our provider
export const ConversationListStateProvider: FC<{ children?: React.ReactNode }> = props => {
  const openedRowIndex = useSharedValue<number>(-1);

  return (
    <ConversationListStateContext.Provider value={{ openedRowIndex }}>
      {props.children}
    </ConversationListStateContext.Provider>
  );
};
