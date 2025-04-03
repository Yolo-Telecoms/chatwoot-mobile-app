// File: src/screens/chat-screen/components/message-components/ComposedCell.tsx

import React, { useMemo } from 'react';
import { Text, Dimensions } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { FileErrorIcon, LockIcon } from '@/svg-icons';
import { differenceInHours } from 'date-fns';
import { tailwind } from '@/theme';
import { Channel, Message } from '@/types';
import { unixTimestampToReadableTime } from '@/utils';
import { Avatar, Icon } from '@/components-next';
import { MarkdownDisplay } from './MarkdownDisplay';
import { MenuOption, MessageMenu } from '../message-menu';
import { ReplyMessageCell } from './ReplyMessageCell';
import { INBOX_TYPES, MESSAGE_TYPES, TEXT_MAX_WIDTH, ATTACHMENT_TYPES } from '@/constants';

import { AudioPlayer } from './AudioCell';
import { FilePreview } from './FileCell';
import { ImageContainer } from './ImageCell';
import { VideoPlayer } from './VideoCell';
import { DeliveryStatus } from './DeliveryStatus';
import { useAppSelector } from '@/hooks';
import { useChatWindowContext } from '@/context';
import { getMessagesByConversationId } from '@/store/conversation/conversationSelectors';
import i18n from '@/i18n';

// Replace the require call with an ES import
import botAvatar from '../../../../assets/local/bot-avatar.png';

type ComposedCellProps = {
  messageData: Message;
  channel?: Channel;
  menuOptions: MenuOption[];
};

const { width: windowWidth } = Dimensions.get('window');
const EMAIL_MESSAGE_PADDING = 52; // e.g. 12 + 12 + avatar (24) + small gap (4)
const EMAIL_MESSAGE_WIDTH = windowWidth - EMAIL_MESSAGE_PADDING;

const isMessageCreatedAtLessThan24HoursOld = (messageTimestamp: number) => {
  const currentTime = new Date();
  const messageTime = new Date(messageTimestamp * 1000);
  const hoursDifference = differenceInHours(currentTime, messageTime);
  return hoursDifference > 24;
};

export const ComposedCell = (props: ComposedCellProps) => {
  const { messageData, channel, menuOptions } = props;
  const {
    messageType,
    content,
    shouldRenderAvatar,
    sender,
    private: isPrivate,
    status,
    sourceId,
    createdAt,
    contentAttributes,
    attachments,
  } = messageData;

  const { conversationId } = useChatWindowContext();
  const messages = useAppSelector(state => getMessagesByConversationId(state, { conversationId }));

  const isIncoming = messageType === MESSAGE_TYPES.INCOMING;
  const isOutgoing = messageType === MESSAGE_TYPES.OUTGOING;
  const isActivity = messageType === MESSAGE_TYPES.ACTIVITY;
  const isTemplate = messageType === MESSAGE_TYPES.TEMPLATE;

  const isReplyMessage = useMemo(
    () => contentAttributes?.inReplyTo !== undefined,
    [contentAttributes?.inReplyTo],
  );

  const replyMessage = useMemo(() => {
    if (!contentAttributes?.inReplyTo) return null;
    return messages.find(m => m.id === contentAttributes.inReplyTo) || null;
  }, [messages, contentAttributes]);

  const errorMessage = contentAttributes?.externalError || '';
  const { imageType } = contentAttributes || {};
  const isInstagramStory = imageType === ATTACHMENT_TYPES.STORY_MENTION;
  const isInstagramStoryExpired = isMessageCreatedAtLessThan24HoursOld(createdAt);

  // Are we dealing with an email inbox message?
  const isEmailMessage = channel === INBOX_TYPES.EMAIL;

  // If the avatar's URI can be null, convert it to undefined:
  const avatarSrc = sender?.thumbnail != null ? { uri: sender.thumbnail ?? undefined } : undefined;

  return (
    <Animated.View
      entering={FadeIn.duration(350)}
      style={tailwind.style(
        'my-[1px]',
        isIncoming && 'items-start',
        isOutgoing && 'items-end',
        isTemplate && 'items-end',
        isEmailMessage && 'items-start',
        isActivity && 'items-center',
        !shouldRenderAvatar && isIncoming ? 'ml-7' : '',
        !shouldRenderAvatar && isOutgoing ? 'pr-7' : '',
        !shouldRenderAvatar && isTemplate ? 'pr-7' : '',
        shouldRenderAvatar ? 'mb-2' : '',
        isPrivate ? 'my-6' : '',
      )}>
      <Animated.View style={tailwind`flex flex-row`}>
        {sender?.name && isIncoming && shouldRenderAvatar && (
          <Animated.View style={tailwind`flex items-end justify-end mr-1`}>
            <Avatar size="md" src={avatarSrc} name={sender?.name || ''} />
          </Animated.View>
        )}

        <MessageMenu menuOptions={menuOptions}>
          <Animated.View
            style={tailwind.style(
              'relative pl-3 pr-2.5 py-2 h-full rounded-2xl overflow-hidden',
              isEmailMessage ? `max-w-[${EMAIL_MESSAGE_WIDTH}px]` : `max-w-[${TEXT_MAX_WIDTH}px]`,
              isIncoming && 'bg-blue-700',
              isOutgoing && 'bg-gray-100',
              isPrivate && 'bg-amber-100',
              shouldRenderAvatar
                ? isOutgoing
                  ? 'rounded-br-none'
                  : isIncoming
                    ? 'rounded-bl-none'
                    : ''
                : '',
            )}>
            <Animated.View style={tailwind`flex flex-row`}>
              {isPrivate && (
                <Animated.View style={tailwind`w-[3px] bg-amber-700 h-auto rounded-[4px]`} />
              )}

              <Animated.View style={tailwind.style(isPrivate ? 'pl-2.5' : '')}>
                {isReplyMessage && replyMessage && (
                  <ReplyMessageCell
                    replyMessage={replyMessage}
                    isIncoming={isIncoming}
                    isOutgoing={isOutgoing}
                  />
                )}
                {content && (
                  <MarkdownDisplay
                    isIncoming={isIncoming}
                    isOutgoing={isOutgoing}
                    messageContent={content}
                  />
                )}

                {attachments &&
                  attachments.map((attachment, index) => {
                    switch (attachment.fileType) {
                      case 'audio':
                        return (
                          <Animated.View
                            key={`audio-${index}`}
                            style={tailwind`flex-1 py-3 px-2 rounded-xl my-2`}>
                            <AudioPlayer
                              audioSrc={attachment.dataUrl}
                              isIncoming={isIncoming}
                              isOutgoing={isOutgoing}
                            />
                          </Animated.View>
                        );
                      case 'image':
                        // e.g. for Instagram stories
                        if (isInstagramStory && isInstagramStoryExpired) {
                          return (
                            <Animated.View
                              key={`expired-img-${index}`}
                              style={tailwind`flex flex-row items-center justify-center py-8 bg-slate-100 gap-1`}>
                              <Icon
                                icon={<FileErrorIcon fill={tailwind.color('text-gray-900')} />}
                              />
                              <Animated.Text
                                style={tailwind`text-cxs font-inter-420-20 text-gray-900 mt-[1px]`}>
                                {i18n.t('CONVERSATION.STORY_NOT_AVAILABLE')}
                              </Animated.Text>
                            </Animated.View>
                          );
                        }
                        return (
                          <Animated.View key={`img-${index}`} style={tailwind`my-2`}>
                            <ImageContainer
                              imageSrc={attachment.dataUrl}
                              width={300 - 24 - (isPrivate ? 13 : 0)}
                              height={215}
                            />
                          </Animated.View>
                        );
                      case 'file':
                        return (
                          <Animated.View
                            key={`file-${index}`}
                            style={tailwind`flex flex-row items-center relative max-w-[300px] my-2`}>
                            <FilePreview
                              fileSrc={attachment.dataUrl}
                              isComposed
                              isIncoming={isIncoming}
                              isOutgoing={isOutgoing}
                            />
                          </Animated.View>
                        );
                      case 'video':
                        return (
                          <Animated.View
                            key={`video-${index}`}
                            style={tailwind`flex flex-row items-center my-2`}>
                            <VideoPlayer videoSrc={attachment.dataUrl} />
                          </Animated.View>
                        );
                      default:
                        return null;
                    }
                  })}

                <Animated.View
                  style={tailwind`h-[21px] pt-[5px] flex flex-row items-center justify-end`}>
                  {isPrivate && <Icon icon={<LockIcon />} size={12} />}
                  <Text
                    style={tailwind.style(
                      'text-xs font-inter-420-20 tracking-[0.32px] pr-1',
                      isIncoming && 'text-whiteA-A11',
                      isOutgoing && 'text-gray-700',
                      isPrivate && 'pl-1',
                    )}>
                    {unixTimestampToReadableTime(createdAt)}
                  </Text>
                  <DeliveryStatus
                    isPrivate={isPrivate}
                    status={status}
                    messageType={messageType}
                    channel={channel}
                    sourceId={sourceId}
                    errorMessage={errorMessage || ''}
                    deliveredColor="text-gray-700"
                    sentColor="text-gray-700"
                  />
                </Animated.View>
              </Animated.View>
            </Animated.View>
          </Animated.View>
        </MessageMenu>

        {shouldRenderAvatar && (isPrivate || isOutgoing || isTemplate) && (
          <Animated.View style={tailwind`flex items-end justify-end ml-1`}>
            <Avatar
              size="md"
              // No 'require()' usage, and we convert null to undefined for the thumbnail.
              src={
                isTemplate
                  ? botAvatar
                  : sender?.thumbnail != null
                    ? { uri: sender.thumbnail ?? undefined }
                    : undefined
              }
              name={sender?.name || ''}
            />
          </Animated.View>
        )}
      </Animated.View>
    </Animated.View>
  );
};
