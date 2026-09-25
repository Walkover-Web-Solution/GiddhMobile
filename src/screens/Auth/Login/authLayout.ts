import { Dimensions } from 'react-native';

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');

/** Design reference: common phone ~390×844 */
const BASE_W = 390;
const BASE_H = 844;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/**
 * Auth screens share one layout scale so Login/Signup look the same
 * across phone sizes. Uses window size (visible area), not full screen,
 * so Android nav/status bars do not hide the footer.
 */
export const AUTH_LAYOUT = {
  screenWidth: WINDOW_WIDTH,
  screenHeight: WINDOW_HEIGHT,
  /** Cap content width on tablets / large phones */
  contentMaxWidth: clamp(WINDOW_WIDTH - 32, 320, 420),
  horizontalPadding: clamp(WINDOW_WIDTH * 0.045, 16, 24),
  topPadding: clamp(WINDOW_HEIGHT * 0.06, 32, 56),
  /** Space between logo and "Create account" / "Welcome back" */
  titleSpacing: clamp(WINDOW_HEIGHT * 0.075, 56, 88),
  /** Space between subtitle and the button stack */
  stackMarginTop: clamp(WINDOW_HEIGHT * 0.055, 40, 64),
  stackGap: clamp(WINDOW_HEIGHT * 0.02, 14, 20),
  buttonHeight: clamp(WINDOW_HEIGHT * 0.065, 52, 56),
  bottomSafe: 12,
  scaleW: (size: number) =>
    clamp(size * (WINDOW_WIDTH / BASE_W), size * 0.9, size * 1.08),
  scaleH: (size: number) =>
    clamp(size * (WINDOW_HEIGHT / BASE_H), size * 0.88, size * 1.06)
};
