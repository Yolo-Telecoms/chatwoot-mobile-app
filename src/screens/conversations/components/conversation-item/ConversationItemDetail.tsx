/* eslint-disable react/display-name */
import React, { memo, useState } from 'react';
import { Dimensions, ImageURISource, Text } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { isEqual } from 'lodash';

import { Avatar } from '@/components-next/common';
import { tailwind } from '@/theme';
import { Agent, Conversation, ConversationAdditionalAttributes, Label, Message } from '@/types';

import { ConversationId } from './ConversationId';
import { ConversationLastMessage } from './ConversationLastMessage';
import { PriorityIndicator } from './PriorityIndicator';
import { UnreadIndicator } from './UnreadIndicator';
import { ChannelIndicator } from './ChannelIndicator';
import { SLAIndicator } from './SLAIndicator';
import { LabelIndicator } from './LabelIndicator';
import { LastActivityTime } from './LastActivityTime';
import { SLA } from '@/types/common/SLA';
import { Inbox } from '@/types/Inbox';
import { TypingMessage } from './TypingMessage';

const { width } = Dimensions.get('screen');

// Make this type more explicit instead of using '{}':
type AppliedSlaConversationDetails = {
  firstReplyCreatedAt: number;
  waitingSince: number;
  status: string;
};

type ConversationDetailSubCellProps = Pick<
  Conversation,
  'id' | 'priority' | 'labels' | 'unreadCount' | 'inboxId' | 'slaPolicyId'
> & {
  senderName: string | null;
  assignee: Agent | null;
  timestamp: number;
  lastMessage?: Message | null;
  inbox: Inbox | null;
  appliedSla: SLA | null;
  appliedSlaConversationDetails?: AppliedSlaConversationDetails | null;
  additionalAttributes?: ConversationAdditionalAttributes;
  allLabels: Label[];
  typingText?: string;
};

const checkIfPropsAreSame = (
  prev: ConversationDetailSubCellProps,
  next: ConversationDetailSubCellProps,
) => {
  return isEqual(prev, next);
};

export const ConversationItemDetail = memo((props: ConversationDetailSubCellProps) => {
  const {
    id: conversationId,
    priority,
    unreadCount,
    labels,
    assignee,
    senderName,
    timestamp,
    slaPolicyId,
    lastMessage,
    inbox,
    appliedSla,
    appliedSlaConversationDetails,
    additionalAttributes,
    allLabels,
    typingText,
  } = props;

  const [shouldShowSLA, setShouldShowSLA] = useState(true);

  const hasPriority = priority !== null;
  const hasLabels = labels.length > 0;
  const hasSLA = !!slaPolicyId && shouldShowSLA;

  // If there's no lastMessage, maybe return null
  if (!lastMessage) {
    return null;
  }

  return (
    // Instead of <AnimatedNativeView>, use <Animated.View>
    <Animated.View
      layout={LinearTransition.springify().damping(28).stiffness(200)}
      style={tailwind.style('flex-1 gap-1 py-3 border-b-[1px] border-b-blackA-A3')}>
      <Animated.View style={tailwind.style('flex flex-row justify-between items-center h-[24px]')}>
        <Animated.View style={tailwind.style('flex flex-row items-center h-[24px] gap-[5px]')}>
          <Text
            numberOfLines={1}
            style={tailwind.style(
              'text-base font-inter-medium-24 tracking-[0.24px] text-gray-950 capitalize',
              `max-w-[${width - 250}px]`,
            )}>
            {senderName}
          </Text>
          <ConversationId id={conversationId} />
        </Animated.View>
        <Animated.View style={tailwind.style('flex flex-row items-center gap-2')}>
          {hasPriority && <PriorityIndicator priority={priority} />}
          {inbox && <ChannelIndicator inbox={inbox} additionalAttributes={additionalAttributes} />}
          <LastActivityTime timestamp={timestamp} />
        </Animated.View>
      </Animated.View>

      {hasLabels || hasSLA ? (
        <Animated.View style={tailwind`flex flex-col items-center gap-1`}>
          <Animated.View style={tailwind`flex flex-row w-full justify-between items-center gap-2`}>
            {typingText ? (
              <TypingMessage typingText={typingText} />
            ) : (
              <ConversationLastMessage numberOfLines={1} lastMessage={lastMessage} />
            )}

            {unreadCount >= 1 && (
              <Animated.View style={tailwind`flex-shrink-0`}>
                <UnreadIndicator count={unreadCount} />
              </Animated.View>
            )}
          </Animated.View>

          <Animated.View style={tailwind`flex flex-row h-6 justify-between items-center gap-2`}>
            <Animated.View style={tailwind`flex flex-row flex-1 gap-2 items-center`}>
              {hasSLA && appliedSla && appliedSlaConversationDetails && (
                <SLAIndicator
                  slaPolicyId={slaPolicyId}
                  appliedSla={appliedSla}
                  appliedSlaConversationDetails={appliedSlaConversationDetails}
                  onSLAStatusChange={setShouldShowSLA}
                />
              )}
              {hasLabels && hasSLA && <Animated.View style={tailwind`w-[1px] h-3 bg-slate-500`} />}
              {hasLabels && <LabelIndicator labels={labels.slice(0, 2)} allLabels={allLabels} />}
            </Animated.View>

            {assignee && (
              <Animated.View>
                <Avatar
                  size="sm"
                  name={assignee.name as string}
                  src={{ uri: assignee.thumbnail } as ImageURISource}
                />
              </Animated.View>
            )}
          </Animated.View>
        </Animated.View>
      ) : (
        <Animated.View style={tailwind`flex flex-row items-end gap-2`}>
          {typingText ? (
            <TypingMessage typingText={typingText} />
          ) : (
            <ConversationLastMessage numberOfLines={2} lastMessage={lastMessage} />
          )}

          <Animated.View style={tailwind`flex flex-row items-end gap-1`}>
            {assignee && (
              <Animated.View style={tailwind.style(unreadCount >= 1 ? 'pr-1' : '')}>
                <Avatar
                  size="sm"
                  name={assignee.name as string}
                  src={{ uri: assignee.thumbnail } as ImageURISource}
                />
              </Animated.View>
            )}
            {unreadCount >= 1 && <UnreadIndicator count={unreadCount} />}
          </Animated.View>
        </Animated.View>
      )}
    </Animated.View>
  );
}, checkIfPropsAreSame);
