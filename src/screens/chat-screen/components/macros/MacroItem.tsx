import React, { useCallback } from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { Icon, Spinner } from '@/components-next';
import { CaretRight, InfoIcon, MacroIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { Macro } from '@/types';

type MacroItemProps = {
  macro: Macro;
  index: number;
  handleMacroPress: (macro: Macro) => void;
  isInsideBottomSheet: boolean;
  isLastItem: boolean;
  handleExecuteMacro: (macro: Macro) => void;
};

const MacroItem = (props: MacroItemProps) => {
  const { macro, index, handleMacroPress, isInsideBottomSheet, isLastItem, handleExecuteMacro } =
    props;
  const [isExecuting, setIsExecuting] = React.useState(false);

  const handleOnPress = useCallback(() => {
    handleMacroPress(macro);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const executeMacro = useCallback(() => {
    setIsExecuting(true);
    // Simulate execution time
    setTimeout(() => {
      setIsExecuting(false);
      handleExecuteMacro(macro);
    }, 1000); // Show spinner for 2 seconds
  }, []);

  return (
    <Pressable
      onPress={executeMacro}
      key={index}
      style={({ pressed }) => [
        tailwind.style(index === 0 && !isInsideBottomSheet ? 'rounded-t-[13px]' : ''),
      ]}>
      <Animated.View style={tailwind.style('flex flex-row items-center pl-1')}>
        <Animated.View style={tailwind.style('w-[20px] h-[20px] flex items-center justify-center')}>
          {isExecuting ? <Spinner size={14} /> : <Icon icon={<MacroIcon />} size={20} />}
        </Animated.View>

        <Animated.View
          style={tailwind.style(
            'flex-1 ml-3 flex-row items-center justify-between py-[11px]',
            !isLastItem ? ' border-b-[1px] border-b-blackA-A3' : '',
          )}>
          <Animated.View>
            <Animated.Text
              style={tailwind.style('font-inter-420-20 leading-[22px] tracking-[0.16px] ')}>
              {macro.name}
            </Animated.Text>
          </Animated.View>
          <Pressable
            onPress={handleOnPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={tailwind.style('flex flex-row items-center pr-3')}>
            {macro.hasChevron ? (
              <Icon icon={<CaretRight />} size={20} />
            ) : (
              <Icon icon={<InfoIcon />} size={22} />
            )}
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};
export default MacroItem;
