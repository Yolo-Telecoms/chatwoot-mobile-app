// File: src/context/RefsContext.tsx

import { createContext, useContext, useRef, FC, ReactNode, RefObject } from 'react';
import PagerView from 'react-native-pager-view';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { FlashList } from '@shopify/flash-list';
import { Message } from '@/types';

/**
 * Let's unify the type so we consistently store a FlashList<Message | {date: string}> ref.
 */
interface RefsContextType {
  userAvailabilityStatusSheetRef: RefObject<BottomSheetModal>;
  filtersModalSheetRef: RefObject<BottomSheetModal>;
  actionsModalSheetRef: RefObject<BottomSheetModal>;
  languagesModalSheetRef: RefObject<BottomSheetModal>;
  chatPagerView: RefObject<PagerView>;
  addLabelSheetRef: RefObject<BottomSheetModal>;
  macrosListSheetRef: RefObject<BottomSheetModal>;
  notificationPreferencesSheetRef: RefObject<BottomSheetModal>;
  switchAccountSheetRef: RefObject<BottomSheetModal>;
  debugActionsSheetRef: RefObject<BottomSheetModal>;
  // unify flashlist to store items of type Message | { date: string }
  messageListRef: RefObject<FlashList<Message | { date: string }>>;
  inboxFiltersSheetRef: RefObject<BottomSheetModal>;
  slaEventsSheetRef: RefObject<BottomSheetModal>;
  deliveryStatusSheetRef: RefObject<BottomSheetModal>;
  updateParticipantSheetRef: RefObject<BottomSheetModal>;
}

const RefsContext = createContext<RefsContextType | undefined>(undefined);

export function useRefsContext(): RefsContextType {
  const context = useContext(RefsContext);
  if (!context) {
    throw new Error(
      'useRefsContext: `RefsContext` is undefined. You might have forgotten to wrap your component with <RefsProvider>.',
    );
  }
  return context;
}

interface RefsProviderProps {
  children?: ReactNode;
}

/**
 * RefsProvider – create & provide multiple useRef references used across the app
 */
export const RefsProvider: FC<RefsProviderProps> = ({ children }) => {
  const userAvailabilityStatusSheetRef = useRef<BottomSheetModal>(null);
  const filtersModalSheetRef = useRef<BottomSheetModal>(null);
  const actionsModalSheetRef = useRef<BottomSheetModal>(null);
  const languagesModalSheetRef = useRef<BottomSheetModal>(null);
  const notificationPreferencesSheetRef = useRef<BottomSheetModal>(null);
  const addLabelSheetRef = useRef<BottomSheetModal>(null);
  const macrosListSheetRef = useRef<BottomSheetModal>(null);
  const chatPagerView = useRef<PagerView>(null);
  const switchAccountSheetRef = useRef<BottomSheetModal>(null);
  const debugActionsSheetRef = useRef<BottomSheetModal>(null);
  const inboxFiltersSheetRef = useRef<BottomSheetModal>(null);
  // Align with the type: <Message | { date: string }>
  const messageListRef = useRef<FlashList<Message | { date: string }>>(null);
  const slaEventsSheetRef = useRef<BottomSheetModal>(null);
  const deliveryStatusSheetRef = useRef<BottomSheetModal>(null);
  const updateParticipantSheetRef = useRef<BottomSheetModal>(null);

  const contextRefValues: RefsContextType = {
    userAvailabilityStatusSheetRef,
    filtersModalSheetRef,
    actionsModalSheetRef,
    languagesModalSheetRef,
    notificationPreferencesSheetRef,
    chatPagerView,
    addLabelSheetRef,
    macrosListSheetRef,
    switchAccountSheetRef,
    debugActionsSheetRef,
    inboxFiltersSheetRef,
    messageListRef,
    slaEventsSheetRef,
    deliveryStatusSheetRef,
    updateParticipantSheetRef,
  };

  return <RefsContext.Provider value={contextRefValues}>{children}</RefsContext.Provider>;
};
