import { NativeModules, Platform } from 'react-native';

export type SmsConsentResult = {
  receivedOtpMessage: string;
};

type SmsUserConsentNativeModule = {
  listenOTP: () => Promise<SmsConsentResult>;
  removeOTPListener: () => void;
};

const nativeModule = NativeModules
  .RNReactNativeSMSUserConsent as SmsUserConsentNativeModule | undefined;

const isAvailable = () =>
  Platform.OS === 'android' &&
  Boolean(nativeModule?.listenOTP && nativeModule?.removeOTPListener);

const listenForOtp = async (): Promise<SmsConsentResult | null> => {
  if (!isAvailable()) {
    return null;
  }
  return nativeModule!.listenOTP();
};

const stopListening = () => {
  if (isAvailable()) {
    nativeModule!.removeOTPListener();
  }
};

export const SmsUserConsent = {
  isAvailable,
  listenForOtp,
  stopListening
};
