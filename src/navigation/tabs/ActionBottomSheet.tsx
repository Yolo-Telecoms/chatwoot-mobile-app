// File: src/navigation/tabs/ActionBottomSheet.tsx

import { useMemo } from 'react';
import { BottomSheetModal, useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet';
import tw from 'twrnc';

import { BottomSheetBackdrop } from '@/components-next';
import { useAppDispatch, useAppSelector } from '@/hooks';
import {
  resetActionState,
  selectCurrentActionState,
} from '@/store/conversation/conversationActionSlice';
import {
  UpdateAssignee,
  UpdateStatus,
  UpdateLabels,
  UpdateTeam,
  UpdatePriority,
} from '@/screens/conversations/components/conversation-actions';
import { useRefsContext } from '@/context';

const ActionBottomSheet = () => {
  const dispatch = useAppDispatch();
  const currentActionState = useAppSelector(selectCurrentActionState);

  const animationConfigs = useBottomSheetSpringConfigs({
    mass: 1,
    stiffness: 420,
    damping: 30,
  });

  const { actionsModalSheetRef } = useRefsContext();

  const actionSnapPoints = useMemo(() => {
    switch (currentActionState) {
      case 'Assign':
        return ['50%'];
      case 'Status':
        return [250];
      case 'Label':
        return [368];
      case 'Priority':
        return [300];
      case 'TeamAssign':
        return ['50%'];
      default:
        return [250];
    }
  }, [currentActionState]);

  const handleOnDismiss = () => {
    dispatch(resetActionState());
  };

  return (
    <BottomSheetModal
      ref={actionsModalSheetRef}
      backdropComponent={BottomSheetBackdrop}
      handleIndicatorStyle={tw`overflow-hidden w-8 h-1 rounded-[11px]`}
      handleStyle={tw`p-0 h-4 pt-[5px]`}
      style={tw`rounded-[26px] overflow-hidden`}
      animationConfigs={animationConfigs}
      enablePanDownToClose
      snapPoints={actionSnapPoints}
      onDismiss={handleOnDismiss}>
      {currentActionState === 'Assign' && <UpdateAssignee />}
      {currentActionState === 'TeamAssign' && <UpdateTeam />}
      {currentActionState === 'Status' && <UpdateStatus />}
      {currentActionState === 'Label' && <UpdateLabels />}
      {currentActionState === 'Priority' && <UpdatePriority />}
    </BottomSheetModal>
  );
};

export default ActionBottomSheet;
