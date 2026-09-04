import React from 'react';
import { Platform, Pressable as RNPressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import { Pressable as GHPressable } from 'react-native-gesture-handler';

/**
 * Pressable that works reliably inside Modalize bottom sheets.
 * iOS uses RN Pressable; Android uses RNGH Pressable (same pattern as AddButton).
 */
const BasePressable = Platform.OS === 'ios' ? RNPressable : GHPressable;

type Props = PressableProps & {
  style?: StyleProp<ViewStyle> | ((state: { pressed: boolean }) => StyleProp<ViewStyle>);
};

const ModalPressable: React.FC<Props> = (props) => <BasePressable {...props} />;

export default ModalPressable;

/** Shared Modalize props for icon/action picker sheets. */
export const ACTION_SHEET_MODALIZE_PROPS = {
  adjustToContentHeight: true,
  tapGestureEnabled: false,
  closeOnOverlayTap: true,
  noBottomSheetGesture: true,
  scrollViewProps: {
    scrollEnabled: false,
    keyboardShouldPersistTaps: 'always' as const,
  },
};
