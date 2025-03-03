import React, { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';

import { BottomSheetBackdrop, Icon } from '@/components-next';
import i18n from '@/i18n';

import { useRefsContext } from '@/context';
import { CaretRight, ChevronLeft, InfoIcon, MacroIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { Agent, Macro } from '@/types';
import { useHaptic, useScaleAnimation } from '@/utils';
import { useAppSelector } from '@/hooks';
import { selectAllMacros } from '@/store/macro/macroSelectors';
import { selectAllLabels } from '@/store/label/labelSelectors';
import { selectAllTeams } from '@/store/team/teamSelectors';
import { selectAssignableAgentsByInboxId } from '@/store/assignable-agent/assignableAgentSelectors';

import {
  resolveActionName,
  resolveTeamIds,
  resolveLabels,
  resolveAgents,
} from '@/utils/macroUtils';
import { selectConversationById } from '@/store/conversation/conversationSelectors';
import { Spinner } from '@/components-next';

type MacroDetailsProps = {
  macro: Macro;
  conversationId: number;
  onBack: () => void;
  onClose: () => void;
};

const MacroDetails = ({ macro, onBack, onClose, conversationId }: MacroDetailsProps) => {
  const hapticSelection = useHaptic();
  const labels = useAppSelector(selectAllLabels);
  const teams = useAppSelector(selectAllTeams);

  const selectedConversation = useAppSelector(state =>
    selectConversationById(state, conversationId),
  );

  const inboxId = selectedConversation?.inboxId;

  const inboxIds = inboxId ? [inboxId] : [];

  const agents = useAppSelector(state => selectAssignableAgentsByInboxId(state, inboxIds, ''));
  const { handlers, animatedStyle } = useScaleAnimation();

  const [isRunning, setMacroRunning] = useState(false);

  const getActionValue = (key: string, params: (string | number)[]) => {
    const actionsMap = {
      assign_team: resolveTeamIds(teams, params as number[]),
      add_label: resolveLabels(labels, params as string[]),
      remove_label: resolveLabels(labels, params as string[]),
      assign_agent: resolveAgents(agents as Agent[], params as number[]),
      mute_conversation: null,
      snooze_conversation: null,
      resolve_conversation: null,
      remove_assigned_team: null,
      send_webhook_event: params[0],
      send_message: params[0],
      send_email_transcript: params[0],
      add_private_note: params[0],
    };
    return actionsMap[key as keyof typeof actionsMap] || '';
  };

  const resolvedMacro = () => {
    return macro.actions.map(action => ({
      actionName: resolveActionName(action.actionName),
      actionValue: getActionValue(action.actionName, action.actionParams),
    }));
  };

  const onPress = useCallback(() => {
    setMacroRunning(true);
    hapticSelection?.();
    setTimeout(() => {
      setMacroRunning(false);
      onClose();
    }, 1500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <Animated.View entering={FadeIn.duration(300).springify()} style={tailwind.style('flex-1')}>
      <View style={tailwind.style('flex-row items-center p-4')}>
        <Pressable onPress={onBack} style={tailwind.style('mr-1')}>
          <Icon icon={<ChevronLeft />} size={18} />
        </Pressable>
        <Animated.Text style={tailwind.style('flex-1 text-base')} numberOfLines={1}>
          {macro.name}
        </Animated.Text>
        <Animated.View style={animatedStyle}>
          <Pressable
            style={tailwind.style(
              'px-3 py-[7px] rounded-lg bg-gray-100 flex flex-row items-center justify-center',
            )}
            onPress={onPress}
            {...handlers}>
            {isRunning ? (
              <Spinner size={12} />
            ) : (
              <Animated.Text
                style={tailwind.style(
                  'text-sm font-inter-580-24 leading-[16px] tracking-[0.24px] pr-1 capitalize text-gray-900',
                )}>
                {i18n.t('MACRO.ACTIONS.RUN')}
              </Animated.Text>
            )}
          </Pressable>
        </Animated.View>
      </View>
      {macro.actions && (
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={tailwind.style('px-4')}>
          {resolvedMacro().map((action, index) => (
            <View key={index} style={tailwind.style('relative pl-6 pb-4')}>
              {macro.actions && index !== macro.actions.length - 1 && (
                <View
                  style={tailwind.style(
                    'absolute top-[14px] bottom-0 left-[5px] w-[1px] bg-gray-200',
                  )}
                />
              )}
              <View
                style={tailwind.style(
                  'absolute left-0 top-[2px] w-3 h-3 rounded-full bg-gray-300 border-2 border-gray-300',
                )}
              />
              <Animated.Text style={tailwind.style('mb-1')}>{action.actionName}</Animated.Text>
              <Animated.Text style={tailwind.style('text-sm text-gray-900')}>
                {action.actionValue}
              </Animated.Text>
            </View>
          ))}
        </BottomSheetScrollView>
      )}
    </Animated.View>
  );
};

type ListItemProps = {
  listItem: Macro;
  index: number;
  handleMacroPress: (macro: Macro) => void;
  isInsideBottomSheet: boolean;
  isLastItem: boolean;
};

const MacroListItem = (props: ListItemProps) => {
  const { listItem, index, handleMacroPress, isInsideBottomSheet, isLastItem } = props;

  const handleOnPress = useCallback(() => {
    handleMacroPress(listItem);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Pressable
      onPress={handleOnPress}
      key={index}
      style={({ pressed }) => [
        tailwind.style(index === 0 && !isInsideBottomSheet ? 'rounded-t-[13px]' : ''),
      ]}>
      <Animated.View style={tailwind.style('flex flex-row items-center pl-1')}>
        <Animated.View>
          <Icon icon={<MacroIcon />} size={20} />
          {/* <Spinner size={14} /> */}
        </Animated.View>

        <Animated.View
          style={tailwind.style(
            'flex-1 ml-3 flex-row items-center justify-between py-[11px]',
            !isLastItem ? ' border-b-[1px] border-b-blackA-A3' : '',
          )}>
          <Animated.View>
            <Animated.Text
              style={tailwind.style('font-inter-420-20 leading-[22px] tracking-[0.16px] ')}>
              {listItem.name}
            </Animated.Text>
          </Animated.View>
          <Animated.View style={tailwind.style('flex flex-row items-center pr-3')}>
            {listItem.hasChevron ? (
              <Icon icon={<CaretRight />} size={20} />
            ) : (
              <Icon icon={<InfoIcon />} size={22} />
            )}
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

type MacroStackProps = {
  macrosList: Macro[];
  isInsideBottomSheet?: boolean;
  handleMacroPress: (macro: Macro) => void;
};

const MacroStack = (props: MacroStackProps) => {
  const { macrosList, handleMacroPress, isInsideBottomSheet = false } = props;

  return (
    <Animated.View style={tailwind.style(isInsideBottomSheet ? 'py-1' : '')}>
      {macrosList.map((listItem, index) => (
        <MacroListItem
          handleMacroPress={handleMacroPress}
          key={index}
          {...{ index, listItem, isInsideBottomSheet }}
          isLastItem={isInsideBottomSheet ? macrosList.length - 1 === index : false}
        />
      ))}
    </Animated.View>
  );
};

export const MacrosList = ({ conversationId }: { conversationId: number }) => {
  const macros = useAppSelector(selectAllMacros);
  const [selectedMacro, setSelectedMacro] = useState<Macro | null>(null);

  const handleMacroPress = (macro: Macro) => {
    setSelectedMacro(macro);
    macrosListSheetRef.current?.present();
  };

  const handleBack = () => {
    setSelectedMacro(null);
  };

  const onClose = () => {
    setSelectedMacro(null);
    macrosListSheetRef.current?.dismiss({ overshootClamping: true });
  };

  const { macrosListSheetRef } = useRefsContext();

  const handleChange = () => {};

  return (
    <Animated.View>
      <BottomSheetModal
        ref={macrosListSheetRef}
        backdropComponent={BottomSheetBackdrop}
        handleIndicatorStyle={tailwind.style('overflow-hidden bg-blackA-A6 w-8 h-1 rounded-[11px]')}
        handleStyle={tailwind.style('p-0 h-4 pt-[5px]')}
        style={tailwind.style('rounded-t-[26px] overflow-hidden')}
        enablePanDownToClose
        snapPoints={['75%']}
        enableDynamicSizing={false}
        onChange={handleChange}>
        <Animated.View style={tailwind.style('flex-1')}>
          {selectedMacro ? (
            <MacroDetails
              macro={selectedMacro}
              onBack={handleBack}
              onClose={onClose}
              conversationId={conversationId}
            />
          ) : (
            <Animated.View style={tailwind.style('flex-1')}>
              <View style={tailwind.style('px-4 pt-1 pb-4  items-center')}>
                <Animated.Text
                  style={tailwind.style(
                    'text-gray-700 font-inter-580-24 leading-[17px] tracking-[0.32px]',
                  )}>
                  {i18n.t('MACRO.SELECT_MACRO')}
                </Animated.Text>
              </View>
              <BottomSheetScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={tailwind.style('px-3 pb-6')}>
                <MacroStack
                  handleMacroPress={handleMacroPress}
                  macrosList={macros}
                  isInsideBottomSheet
                />
              </BottomSheetScrollView>
            </Animated.View>
          )}
        </Animated.View>
      </BottomSheetModal>
    </Animated.View>
  );
};
