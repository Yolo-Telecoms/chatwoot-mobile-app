// File: src/screens/chat-screen/components/reply-box/ReplyBoxContainer.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Keyboard, TextInput } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  useDerivedValue,
  useAnimatedStyle,
  withSpring,
  SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useChatWindowContext, useRefsContext } from '@/context';
import {
  useHaptic,
  isAWhatsAppChannel,
  isAnEmailChannel,
  isASmsInbox,
  isAFacebookInbox,
  isALineChannel,
  isATelegramChannel,
  isAWebWidgetInbox,
  isAPIInbox,
  getTypingUsersText,
} from '@/utils';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { MESSAGE_MAX_LENGTH, REPLY_EDITOR_MODES } from '@/constants';
import { tailwind } from '@/theme';
import {
  selectMessageContent,
  selectAttachments,
  selectQuoteMessage,
  resetSentMessage,
  selectIsPrivateMessage,
  togglePrivateMessage,
  setMessageContent,
} from '@/store/conversation/sendMessageSlice';
import { selectUserId, selectUserName, selectUserThumbnail } from '@/store/auth/authSelectors';
import {
  selectConversationById,
  getLastEmailInSelectedChat,
} from '@/store/conversation/conversationSelectors';
import { selectInboxById } from '@/store/inbox/inboxSelectors';
import { conversationActions } from '@/store/conversation/conversationActions';

import { AddCommandButton } from './buttons/AddCommandButton';
import { SendMessageButton } from './buttons/SendMessageButton';
import { MessageTextInput } from './MessageTextInput';
import { QuoteReply } from './QuoteReply';
import { ReplyWarning } from './ReplyWarning';
import { CannedResponses } from './CannedResponses';
import { AttachedMedia } from '../message-components/AttachedMedia';
import { CommandOptionsMenu } from '../message-components/CommandOptionsMenu';
import { SendMessagePayload } from '@/store/conversation/conversationTypes';
import { TypingIndicator } from './TypingIndicator';
import { selectTypingUsersByConversationId } from '@/store/conversation/conversationTypingSlice';
import AnalyticsHelper from '@/helpers/AnalyticsHelper';
import { CONVERSATION_EVENTS } from '@/constants/analyticsEvents';
import {
  allMessageVariables,
  replaceMessageVariables,
  getAllUndefinedVariablesInMessage,
} from '@/utils/messageVariableUtils';
import { ReplyEmailHead } from './ReplyEmailHead';
import { selectAssignableParticipantsByInboxId } from '@/store/assignable-agent/assignableAgentSelectors';

import { Conversation, Agent, CannedResponse, Message } from '@/types';

const SHEET_APPEAR_SPRING_CONFIG = {
  damping: 20,
  stiffness: 120,
};

const AnimatedKeyboardStickyView = Animated.createAnimatedComponent(KeyboardStickyView);

const BottomSheetContent = () => {
  const hapticSelection = useHaptic();
  const dispatch = useAppDispatch();
  const { bottom } = useSafeAreaInsets();
  const { messageListRef } = useRefsContext();

  // Redux store & local states
  const userId = useAppSelector(selectUserId);
  const userThumbnail = useAppSelector(selectUserThumbnail);
  const userName = useAppSelector(selectUserName);
  const messageContent = useAppSelector(selectMessageContent);
  const attachedFiles = useAppSelector(selectAttachments);
  const quoteMessage = useAppSelector(selectQuoteMessage);
  const isPrivate = useAppSelector(selectIsPrivateMessage);

  // Context from the chat window
  const {
    isAddMenuOptionSheetOpen,
    setAddMenuOptionSheetState,
    textInputRef,
    isTextInputFocused,
    conversationId,
  } = useChatWindowContext();

  const conversation = useAppSelector(state => selectConversationById(state, conversationId));
  const { inboxId, canReply } = conversation || {};
  const inbox = useAppSelector(state => (inboxId ? selectInboxById(state, inboxId) : undefined));

  // Agents
  const selectAgents = useAppSelector(selectAssignableParticipantsByInboxId);
  const agents = inboxId ? selectAgents(inboxId, '') : [];

  // local states for email fields
  const [replyEditorMode, setReplyEditorMode] = useState(REPLY_EDITOR_MODES.REPLY);
  const [ccEmails, setCCEmails] = useState('');
  const [bccEmails, setBCCEmails] = useState('');
  const [toEmails, setToEmails] = useState('');

  const [selectedCannedResponse, setSelectedCannedResponse] = useState<string | null>(null);

  // Typing users
  const typingUsers = useAppSelector(state =>
    selectTypingUsersByConversationId(state, conversationId),
  );
  const typingText = useMemo(() => getTypingUsersText({ users: typingUsers }), [typingUsers]);

  const attachmentsLength = useMemo(() => attachedFiles.length, [attachedFiles.length]);

  // Condition for email channels
  const shouldShowReplyHeader = inbox && isAnEmailChannel(inbox) && !isPrivate;

  // 1) We assume `getLastEmailInSelectedChat` returns Message | undefined
  // So now `lastEmail` can be `Message` or undefined.
  const lastEmail: Message | undefined = useAppSelector(state => {
    if (!shouldShowReplyHeader) return undefined;
    const result = getLastEmailInSelectedChat(state, { conversationId });
    return Array.isArray(result) && result.length === 0 ? undefined : (result as Message);
  });

  // 2) Populate cc/bcc/to from lastEmail
  useEffect(() => {
    if (!lastEmail) return;

    const emailAttributes =
      (lastEmail?.contentAttributes?.email as { cc?: string[]; bcc?: string[]; from?: string[] }) ??
      {};

    // Retrieve the conversation contact
    const conversationContact = conversation?.meta?.sender?.email || '';

    // cast so TS knows it's string[]
    let cc = emailAttributes.cc ?? [];
    let to: string[] = [];

    // remove conversation contact from CC
    cc = cc.filter((email: string) => email !== conversationContact);

    // If last incoming msg sender is different from the conversation contact
    if (emailAttributes.from && !emailAttributes.from.includes(conversationContact)) {
      to.push(...(emailAttributes.from as string[]));
      cc.push(conversationContact);
    }

    // remove conversation contact from BCC
    let bcc = ((emailAttributes.bcc as string[]) || []).filter(
      (email: string) => email !== conversationContact,
    );

    // ensure only unique
    bcc = [...new Set(bcc)];
    cc = [...new Set(cc)];
    to = [...new Set(to)];

    setCCEmails(cc.join(', '));
    setBCCEmails(bcc.join(', '));
    setToEmails(to.join(', '));
  }, [lastEmail, conversation?.meta?.sender?.email, conversation]);

  const messageVariables = allMessageVariables({
    conversation: conversation as Conversation,
  });

  // auto toggle private vs reply
  useEffect(() => {
    if (canReply || (inbox && isAWhatsAppChannel(inbox))) {
      setReplyEditorMode(REPLY_EDITOR_MODES.REPLY);
      dispatch(togglePrivateMessage(false));
    } else {
      setReplyEditorMode(REPLY_EDITOR_MODES.NOTE);
      dispatch(togglePrivateMessage(true));
    }
  }, [inbox, canReply, dispatch]);

  // The derived value for the “add menu option” sheet
  const derivedAddMenuOptionStateValue = useDerivedValue(() => {
    return isAddMenuOptionSheetOpen
      ? withSpring(1, SHEET_APPEAR_SPRING_CONFIG)
      : withSpring(0, SHEET_APPEAR_SPRING_CONFIG);
  });

  // animate the input container
  const animatedInputWrapperStyle = useAnimatedStyle(() => {
    return {
      marginBottom: isTextInputFocused ? 0 : bottom,
    };
  }, [isTextInputFocused, bottom]);

  const handleShowAddMenuOption = () => {
    if (isAddMenuOptionSheetOpen) {
      hapticSelection?.();
      setAddMenuOptionSheetState(false);
    } else {
      Keyboard.dismiss();
      hapticSelection?.();
      setAddMenuOptionSheetState(true);
    }
  };

  // Just a placeholder
  const setReplyToInPayload = (messagePayload: SendMessagePayload) => {
    // if (quoteMessage?.id) {
    //   messagePayload.contentAttributes = { ...messagePayload.contentAttributes, inReplyTo: quoteMessage.id };
    // }
    return messagePayload;
  };

  const getMessagePayload = (message: string) => {
    let updatedMessage = message;
    if (isPrivate) {
      // handle mention
      const regex = /@\[([\w\s]+)\]\((\d+)\)/g;
      updatedMessage = message.replace(
        regex,
        '[@$1](mention://user/$2/' + encodeURIComponent('$1') + ')',
      );
    }

    let messagePayload: SendMessagePayload = {
      conversationId,
      message: updatedMessage,
      private: isPrivate,
      sender: {
        id: userId ?? 0,
        thumbnail: userThumbnail ?? '',
        name: userName ?? '',
      },
    };

    messagePayload = setReplyToInPayload(messagePayload);

    if (attachedFiles && attachedFiles.length > 0) {
      // For now, we only handle single file
      // @ts-expect-error: handle multiple attachments logic
      messagePayload.file = attachedFiles[0];
    }

    // For email fields
    if (!isPrivate && isAnEmailChannel(inbox)) {
      if (ccEmails) messagePayload.ccEmails = ccEmails;
      if (bccEmails) messagePayload.bccEmails = bccEmails;
      if (toEmails) messagePayload.toEmails = toEmails;
    }

    return messagePayload;
  };

  const confirmOnSendReply = () => {
    hapticSelection?.();
    if (textInputRef && 'current' in textInputRef && textInputRef.current) {
      (textInputRef.current as TextInput).clear();
    }

    AnalyticsHelper.track(CONVERSATION_EVENTS.SENT_MESSAGE);

    const undefinedVariables = getAllUndefinedVariablesInMessage({
      message: messageContent,
      variables: messageVariables,
    });

    if (undefinedVariables.length > 0) {
      const undefinedVariablesCount = undefinedVariables.length;
      const undefinedVariablesText = undefinedVariables.join(', ');
      Alert.alert(
        `You have ${undefinedVariablesCount} undefined variable(s) in your message: ${undefinedVariablesText}. Please check and try again with valid variables.`,
      );
    } else {
      const messagePayload = getMessagePayload(messageContent);
      sendMessage(messagePayload);
    }
  };

  const sendMessage = (messagePayload: SendMessagePayload) => {
    dispatch(conversationActions.sendMessage(messagePayload));
    dispatch(resetSentMessage());
    setSelectedCannedResponse(null);
    dispatch(setMessageContent(''));
    setCCEmails('');
    setBCCEmails('');
    setToEmails('');
    messageListRef?.current?.scrollToOffset({ offset: 0, animated: true });
  };

  // Check if we can show "attach file" button
  const shouldShowFileUpload =
    inbox &&
    (isAWebWidgetInbox(inbox) ||
      isAFacebookInbox(inbox) ||
      isAWhatsAppChannel(inbox) ||
      isAPIInbox(inbox) ||
      isASmsInbox(inbox) ||
      isAnEmailChannel(inbox) ||
      isATelegramChannel(inbox) ||
      isALineChannel(inbox));

  // define max length per channel
  const maxLength = () => {
    if (isPrivate) return MESSAGE_MAX_LENGTH.GENERAL;
    if (isAFacebookInbox(inbox)) return MESSAGE_MAX_LENGTH.FACEBOOK;
    if (isAWhatsAppChannel(inbox)) return MESSAGE_MAX_LENGTH.TWILIO_WHATSAPP;
    if (isASmsInbox(inbox)) return MESSAGE_MAX_LENGTH.TWILIO_SMS;
    if (isAnEmailChannel(inbox)) return MESSAGE_MAX_LENGTH.EMAIL;
    return MESSAGE_MAX_LENGTH.GENERAL;
  };

  const onSelectCannedResponse = (cannedResponse: CannedResponse) => {
    const updatedContent = replaceMessageVariables({
      message: cannedResponse.content,
      variables: messageVariables,
    });
    AnalyticsHelper.track(CONVERSATION_EVENTS.INSERTED_A_CANNED_RESPONSE);
    setSelectedCannedResponse(updatedContent);
  };

  const shouldShowCannedResponses = messageContent?.charAt(0) === '/';

  return (
    <Animated.View layout={LinearTransition.springify().damping(38).stiffness(240)}>
      <AnimatedKeyboardStickyView style={[tailwind`bg-white`, animatedInputWrapperStyle]}>
        {/* if can't reply, show some warning */}
        {!canReply && inbox && conversation && (
          <Animated.View entering={FadeIn.duration(250)} exiting={FadeOut.duration(10)}>
            <ReplyWarning inbox={inbox} conversation={conversation} />
          </Animated.View>
        )}

        {shouldShowCannedResponses && (
          <CannedResponses searchKey={messageContent} onSelect={onSelectCannedResponse} />
        )}

        <Animated.View
          layout={LinearTransition.springify().damping(38).stiffness(240)}
          style={tailwind.style(
            `pb-2 border-t-[1px] border-t-blackA-A3`,
            // If reply header is shown, use 'pt-0', else 'pt-2'
            shouldShowReplyHeader ? 'pt-0' : 'pt-2',
          )}>
          {quoteMessage && (
            <Animated.View entering={FadeIn.duration(250)} exiting={FadeOut.duration(10)}>
              <QuoteReply />
            </Animated.View>
          )}

          {shouldShowReplyHeader && (
            <ReplyEmailHead
              ccEmails={ccEmails}
              bccEmails={bccEmails}
              toEmails={toEmails}
              onUpdateCC={setCCEmails}
              onUpdateBCC={setBCCEmails}
              onUpdateTo={setToEmails}
            />
          )}

          {typingText && <TypingIndicator typingText={typingText} />}

          <Animated.View style={tailwind`flex flex-row px-1 items-end z-20 relative`}>
            {attachmentsLength === 0 && shouldShowFileUpload && (
              <AddCommandButton
                onPress={handleShowAddMenuOption}
                // 4) If your child expects SharedValue<number>, do this cast:
                derivedAddMenuOptionStateValue={
                  derivedAddMenuOptionStateValue as unknown as SharedValue<number>
                }
              />
            )}
            <MessageTextInput
              maxLength={maxLength()}
              replyEditorMode={replyEditorMode}
              selectedCannedResponse={selectedCannedResponse}
              agents={agents as Agent[]}
              messageContent={messageContent}
            />
            {(messageContent.length > 0 || attachmentsLength > 0) && (
              <SendMessageButton onPress={confirmOnSendReply} />
            )}
          </Animated.View>
        </Animated.View>

        {isAddMenuOptionSheetOpen ? (
          <CommandOptionsMenu />
        ) : attachmentsLength > 0 ? (
          <AttachedMedia />
        ) : null}
      </AnimatedKeyboardStickyView>
    </Animated.View>
  );
};

export const ReplyBoxContainer = () => {
  return <BottomSheetContent />;
};
