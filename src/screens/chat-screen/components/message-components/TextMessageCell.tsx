import React from 'react';
import Animated, { FadeIn } from 'react-native-reanimated';
import tw from 'twrnc'; // TWRNC is typically used as a tagged template
import { Channel, Message } from '@/types';
import { Avatar } from '@/components-next/common';

import { ActivityTextCell } from './ActivityTextCell';
import { BotTextCell } from './BotTextCell';
import { MenuOption, MessageMenu } from '../message-menu';
import { MessageTextCell } from './MessageTextCell';
import { PrivateTextCell } from './PrivateTextCell';
import { MESSAGE_TYPES } from '@/constants';
import botAvatar from '../../../../assets/local/bot-avatar.png';

export type TextMessageCellProps = {
  item: Message;
  channel?: Channel;
  menuOptions: MenuOption[];
};

export const TextMessageCell = (props: TextMessageCellProps) => {
  const { item: messageItem, channel, menuOptions } = props;

  const {
    messageType,
    shouldRenderAvatar,
    sender,
    private: isPrivate,
    status,
    sourceId,
    content,
    createdAt,
    contentAttributes,
  } = messageItem;

  const isIncoming = messageType === MESSAGE_TYPES.INCOMING;
  const isOutgoing = messageType === MESSAGE_TYPES.OUTGOING;
  const isActivity = messageType === MESSAGE_TYPES.ACTIVITY;
  const isTemplate = messageType === MESSAGE_TYPES.TEMPLATE;

  const isSentByBot = !sender || ('type' in sender && sender.type === 'agent_bot');
  const errorMessage = contentAttributes?.externalError || '';

  return (
    <Animated.View
      entering={FadeIn.duration(350)}
      style={[
        // Tagged templates for each style snippet:
        tw`my-[1px]`,
        isIncoming && tw`items-start`,
        (isOutgoing || isTemplate) && tw`items-end`,
        isActivity && tw`items-center`,

        // shift horizontally if no avatar
        !shouldRenderAvatar && isIncoming && tw`ml-7`,
        !shouldRenderAvatar && (isOutgoing || isTemplate) && tw`pr-7`,
        shouldRenderAvatar && tw`mb-1`,
        messageItem.private && tw`my-2`,
      ]}>
      <Animated.View style={tw`flex flex-row`}>
        {sender?.name && isIncoming && shouldRenderAvatar && (
          <Animated.View style={tw`flex items-end justify-end mr-1`}>
            <Avatar
              size="md"
              src={sender?.thumbnail ? { uri: sender.thumbnail } : undefined}
              name={sender.name}
            />
          </Animated.View>
        )}

        <MessageMenu menuOptions={menuOptions}>
          <>
            {isPrivate ? (
              <PrivateTextCell text={content} timeStamp={createdAt} />
            ) : (
              <>
                {(isOutgoing && !isSentByBot) || isIncoming ? (
                  <MessageTextCell
                    isActivity={isActivity}
                    isIncoming={isIncoming}
                    isOutgoing={isOutgoing}
                    text={content}
                    timeStamp={createdAt}
                    status={status}
                    isAvatarRendered={shouldRenderAvatar}
                    channel={channel}
                    messageType={messageType}
                    sourceId={sourceId || ''}
                    isPrivate={isPrivate}
                    errorMessage={errorMessage}
                    sender={sender}
                    contentAttributes={contentAttributes}
                  />
                ) : null}
                {(isOutgoing && isSentByBot) || isTemplate ? (
                  <BotTextCell
                    text={content}
                    timeStamp={createdAt}
                    status={status}
                    isAvatarRendered={shouldRenderAvatar}
                    channel={channel}
                    messageType={messageType}
                    sourceId={sourceId || ''}
                    isPrivate={isPrivate}
                    errorMessage={errorMessage}
                  />
                ) : null}
                {isActivity && <ActivityTextCell text={content} timeStamp={createdAt} />}
              </>
            )}
          </>
        </MessageMenu>

        {shouldRenderAvatar && (isPrivate || isOutgoing || isTemplate) && (
          <Animated.View style={tw`flex items-end justify-end ml-1`}>
            <Avatar
              size="md"
              src={isTemplate || isSentByBot ? botAvatar : { uri: sender?.thumbnail }}
              name={sender?.name || ''}
            />
          </Animated.View>
        )}
      </Animated.View>
    </Animated.View>
  );
};
