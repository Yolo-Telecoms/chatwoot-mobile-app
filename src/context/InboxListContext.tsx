// File: src/context/InboxListContext.tsx

import { createContext, useContext, FC, ReactNode } from 'react';
import { SharedValue, useSharedValue } from 'react-native-reanimated';

interface InboxListStateContextType {
  openedRowIndex: SharedValue<number>;
}

const InboxListStateContext = createContext<InboxListStateContextType | undefined>(undefined);

export function useInboxListStateContext(): InboxListStateContextType {
  const context = useContext(InboxListStateContext);
  if (!context) {
    throw new Error(
      'InboxListStateContext: `InboxListStateContext` is undefined. Wrap your component in InboxListStateProvider.',
    );
  }
  return context;
}

interface InboxListStateProviderProps {
  children?: ReactNode;
}

export const InboxListStateProvider: FC<InboxListStateProviderProps> = ({ children }) => {
  const openedRowIndex = useSharedValue<number>(-1);

  return (
    <InboxListStateContext.Provider value={{ openedRowIndex }}>
      {children}
    </InboxListStateContext.Provider>
  );
};
