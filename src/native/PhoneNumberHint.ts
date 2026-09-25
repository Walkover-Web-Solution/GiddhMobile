import { NativeModules, Platform } from 'react-native';

type PhoneNumberHintNativeModule = {
  showPhoneNumberHint: () => Promise<string>;
};

export const PhoneNumberHintErrorCodes = {
  USER_CANCELLED: 'USER_CANCELLED',
  RESOLUTION_REQUIRED: 'RESOLUTION_REQUIRED',
  API_NOT_CONNECTED: 'API_NOT_CONNECTED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  SIGN_IN_REQUIRED: 'SIGN_IN_REQUIRED',
  DEVELOPER_ERROR: 'DEVELOPER_ERROR',
  NO_ACTIVITY: 'NO_ACTIVITY',
  ALREADY_IN_PROGRESS: 'ALREADY_IN_PROGRESS',
  INTENT_ERROR: 'INTENT_ERROR',
  GET_PHONE_ERROR: 'GET_PHONE_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  UNSUPPORTED: 'UNSUPPORTED'
} as const;

export type PhoneNumberHintErrorCode =
  (typeof PhoneNumberHintErrorCodes)[keyof typeof PhoneNumberHintErrorCodes];

const NativePhoneNumberHint =
  Platform.OS === 'android'
    ? (NativeModules.PhoneNumberHint as PhoneNumberHintNativeModule | undefined)
    : undefined;

/**
 * Shows Google Phone Number Hint picker (Android only).
 * Resolves with the selected E.164 / local phone number string.
 */
export async function showPhoneNumberHint(): Promise<string> {
  if (Platform.OS !== 'android') {
    const error = new Error('Phone Number Hint is only available on Android') as Error & {
      code?: string;
    };
    error.code = PhoneNumberHintErrorCodes.UNSUPPORTED;
    throw error;
  }

  if (!NativePhoneNumberHint?.showPhoneNumberHint) {
    const error = new Error(
      'PhoneNumberHint native module is not linked. Rebuild the Android app.'
    ) as Error & { code?: string };
    error.code = PhoneNumberHintErrorCodes.DEVELOPER_ERROR;
    throw error;
  }

  return NativePhoneNumberHint.showPhoneNumberHint();
}
