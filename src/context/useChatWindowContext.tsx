// File: src/context/useChatWindowContext.tsx

import { createContext, useContext, useRef, useState, FC, ReactNode, Ref } from 'react';
import { TextInputProps } from 'react-native';

interface ChatWindowContextType {
  isAddMenuOptionSheetOpen: boolean;
  setAddMenuOptionSheetState: React.Dispatch<React.SetStateAction<boolean>>;

  textInputRef: Ref<TextInputProps>;

  isTextInputFocused: boolean;
  setIsTextInputFocused: React.Dispatch<React.SetStateAction<boolean>>;

  isVoiceRecorderOpen: boolean;
  setIsVoiceRecorderOpen: React.Dispatch<React.SetStateAction<boolean>>;

  pagerViewIndex: number;
  setPagerViewIndex: React.Dispatch<React.SetStateAction<number>>;
  conversationId: number;
}

const ChatWindowContext = createContext<ChatWindowContextType | undefined>(undefined);

export function useChatWindowContext(): ChatWindowContextType {
  const context = useContext(ChatWindowContext);
  if (!context) {
    throw new Error(
      'ChatWindowContext: `ChatWindowContext` is undefined. Wrap your component in ChatWindowProvider.',
    );
  }
  return context;
}

interface ChatWindowProviderProps {
  children?: ReactNode;
  conversationId?: number;
}

export const ChatWindowProvider: FC<ChatWindowProviderProps> = ({
  children,
  conversationId = 0,
}) => {
  const [isAddMenuOptionSheetOpen, setAddMenuOptionSheetState] = useState(false);
  const [isTextInputFocused, setIsTextInputFocused] = useState(false);
  const [isVoiceRecorderOpen, setIsVoiceRecorderOpen] = useState(false);
  const [pagerViewIndex, setPagerViewIndex] = useState(0);

  const textInputRef = useRef<TextInputProps>(null);

  return (
    <ChatWindowContext.Provider
      value={{
        isAddMenuOptionSheetOpen,
        setAddMenuOptionSheetState,
        textInputRef,
        isTextInputFocused,
        setIsTextInputFocused,
        isVoiceRecorderOpen,
        setIsVoiceRecorderOpen,
        pagerViewIndex,
        setPagerViewIndex,
        conversationId,
      }}>
      {children}
    </ChatWindowContext.Provider>
  );
};
