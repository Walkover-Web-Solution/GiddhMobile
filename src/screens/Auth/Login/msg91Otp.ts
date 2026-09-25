import { CountryCode } from 'react-native-country-picker-modal';
import PhoneNumber from 'awesome-phonenumber';

export type OtpRetryChannel = 'sms' | 'call' | 'whatsapp' | 'email';
export type OtpContactMode = 'email' | 'mobile';

/** MSG91 widget credentials (email + mobile enabled) */
export const MSG91_WIDGET_ID = '36616e6b5936333532323134';
export const MSG91_TOKEN_AUTH = '205968TmXguUAwoD633af103P1';

export type Msg91WidgetConfig = {
  otpLength: 4 | 6 | 8;
  retryAfterSeconds: number;
  maxRetryAttempts: number;
  retryChannels: OtpRetryChannel[];
  invisible: boolean;
  defaultCountryCode: CountryCode;
  defaultCallingCode: string;
};

export type ParsedPhone = {
  mobileNumber: string;
  countryCode: CountryCode;
  callingCode: string;
  /** Country code + national number, no + (MSG91 identifier) */
  identifier: string;
};

const CHANNEL_NAME_TO_RETRY: Record<string, OtpRetryChannel> = {
  SMS: 'sms',
  WHATSAPP: 'whatsapp',
  VOICE: 'call',
  CALL: 'call',
  EMAIL: 'email'
};

export const RETRY_CHANNEL_TO_MSG91_CODE: Record<OtpRetryChannel, number> = {
  sms: 11,
  call: 4,
  whatsapp: 12,
  email: 3
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeOtpLength = (length?: number): 4 | 6 | 8 => {
  if (length === 4 || length === 6 || length === 8) {
    return length;
  }
  return 8;
};

/**
 * Parse getWidgetProcess API response into UI config.
 */
export const parseMsg91WidgetProcess = (response: any): Msg91WidgetConfig => {
  const data = response?.data ?? response ?? {};
  const defaultCountry = data.defaultCountry ?? {};
  const processes: any[] = Array.isArray(data.processes) ? data.processes : [];

  const retryChannels: OtpRetryChannel[] = [];
  processes.forEach((process) => {
    const via = String(process?.processVia?.name ?? '').toUpperCase();
    if (via !== 'RETRY') {
      return;
    }
    const channelName = String(process?.channel?.name ?? '').toUpperCase();
    const mapped = CHANNEL_NAME_TO_RETRY[channelName];
    if (mapped && retryChannels.indexOf(mapped) === -1) {
      retryChannels.push(mapped);
    }
  });

  const iso2 = String(defaultCountry.iso2 ?? 'in').toUpperCase() as CountryCode;
  const dialCode = String(defaultCountry.dialCode ?? '91').replace(/\D/g, '') || '91';

  return {
    otpLength: normalizeOtpLength(Number(data.otpLength)),
    retryAfterSeconds: Math.max(0, Number(data.retryTime) || 30),
    maxRetryAttempts: Math.max(0, Number(data.retryCount) || 0),
    retryChannels: retryChannels.length ? retryChannels : ['sms'],
    invisible: Number(data.invisible) === 1,
    defaultCountryCode: iso2,
    defaultCallingCode: dialCode
  };
};

/**
 * Build MSG91 identifier: country calling code + national number (no +).
 */
export const buildMsg91Identifier = (
  callingCode: string,
  mobileNumber: string
): string => `${String(callingCode).replace(/\D/g, '')}${String(mobileNumber).replace(/\D/g, '')}`;

export const isValidMsg91Email = (email: string): boolean =>
  EMAIL_REGEX.test(String(email ?? '').trim());

export const normalizeMsg91Email = (email: string): string =>
  String(email ?? '').trim();

/**
 * Parse a hint / E.164 style phone into country + national number.
 */
export const parsePhoneHintValue = (
  raw: string,
  fallbackCountry: CountryCode = 'IN',
  fallbackCallingCode: string = '91'
): ParsedPhone | null => {
  const cleaned = String(raw ?? '').trim();
  if (!cleaned) {
    return null;
  }

  try {
    const withPlus = cleaned.startsWith('+') ? cleaned : `+${cleaned.replace(/\D/g, '')}`;
    const pn = new PhoneNumber(withPlus);
    if (!pn.isValid() && !pn.isPossible()) {
      // Fallback: strip fallback calling code prefix if present
      const digits = cleaned.replace(/\D/g, '');
      const cc = fallbackCallingCode.replace(/\D/g, '');
      const national =
        digits.startsWith(cc) && digits.length > cc.length
          ? digits.slice(cc.length)
          : digits;
      if (!national) {
        return null;
      }
      return {
        mobileNumber: national,
        countryCode: fallbackCountry,
        callingCode: cc,
        identifier: buildMsg91Identifier(cc, national)
      };
    }

    const region = (pn.getRegionCode?.() || fallbackCountry).toUpperCase() as CountryCode;
    const national = String(pn.getNumber('significant') ?? '').replace(/\D/g, '');
    const calling = String(pn.getCountryCode?.() ?? fallbackCallingCode).replace(/\D/g, '');
    if (!national) {
      return null;
    }
    return {
      mobileNumber: national,
      countryCode: region || fallbackCountry,
      callingCode: calling || fallbackCallingCode,
      identifier: buildMsg91Identifier(calling || fallbackCallingCode, national)
    };
  } catch {
    return null;
  }
};

/**
 * Invisible OTP success (MSG91 docs):
 * { type: 'success', 'access-token': '<token>', invisibleVerified: true, message: <reqId> }
 * Prefer access-token — message is reqId in that case, not the JWT.
 */
export const getInvisibleAccessToken = (response: any): string | null => {
  if (!response || response.type === 'error') {
    return null;
  }
  const token = response['access-token'] || response.accessToken;
  if (token) {
    return String(token);
  }
  // Rare fallback: flag set but token only in message
  const invisibleOk =
    response.invisibleVerified === true ||
    response.invisibleVerified === 1 ||
    response.invisibleVerified === 'true';
  if (invisibleOk && typeof response.message === 'string' && response.message) {
    return String(response.message);
  }
  return null;
};

export const getAccessTokenFromMsg91Response = (response: any): string | null => {
  return getInvisibleAccessToken(response);
};

/**
 * Normal / fallback OTP flow (MSG91 docs):
 * { type: 'success', message: '<reqId>' }
 * Use message as reqId for verifyOTP / retryOTP.
 * Do not use message as reqId when access-token is present (invisible already done).
 */
export const getReqIdFromMsg91Response = (response: any): string | null => {
  if (!response || response.type === 'error') {
    return null;
  }
  if (response['access-token'] || response.accessToken || response.invisibleVerified) {
    return null;
  }
  if (response.type === 'success' || response.type === undefined) {
    const reqId = response.reqId || response.message;
    return reqId ? String(reqId) : null;
  }
  return null;
};

export const isMsg91VerifySuccessToken = (response: any): string | null => {
  if (!response || response.type === 'error') {
    return null;
  }
  const token = response['access-token'] || response.accessToken;
  if (token) {
    return String(token);
  }
  // verifyOTP success typically returns JWT in `message`
  if (response.type === 'success' && typeof response.message === 'string' && response.message) {
    return String(response.message);
  }
  return null;
};

export const getMsg91ErrorMessage = (response: any, fallback = 'Something went wrong') => {
  if (!response) {
    return fallback;
  }
  if (typeof response.message === 'string' && response.type === 'error') {
    return response.message;
  }
  if (Array.isArray(response.errors) && response.errors[0]) {
    return String(response.errors[0]);
  }
  return fallback;
};

/**
 * Shared sendOTP outcome handler per MSG91 docs.
 * 1) invisibleVerified + access-token → login (no verifyOTP)
 * 2) message = reqId → continue with verifyOTP / retryOTP
 */
export type SendOtpOutcome =
  | { kind: 'invisible_success'; accessToken: string }
  | { kind: 'otp_required'; reqId: string }
  | { kind: 'error'; message: string };

export const resolveSendOtpResponse = (response: any): SendOtpOutcome => {
  if (!response || response.type === 'error') {
    return {
      kind: 'error',
      message: getMsg91ErrorMessage(response, 'Failed to send OTP')
    };
  }

  const invisibleToken = getInvisibleAccessToken(response);
  if (invisibleToken) {
    return { kind: 'invisible_success', accessToken: invisibleToken };
  }

  const reqId = getReqIdFromMsg91Response(response);
  if (reqId) {
    return { kind: 'otp_required', reqId };
  }

  return {
    kind: 'error',
    message: getMsg91ErrorMessage(response, 'Failed to send OTP')
  };
};
