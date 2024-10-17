import { Dimensions } from 'react-native';
import moment from 'moment';
import NetInfo from '@react-native-community/netinfo';
import { API_URL } from '@/env.json';

const DEVICE_WIDTH = Dimensions.get('window').width;
const DEVICE_HEIGHT = Dimensions.get('window').height;

/**
 * create endpoint helper
 * creates api endpoint for current environment
 * @param endpoint
 */
export const createEndpoint = (endpoint: string): string => {
  return `:countryURL${endpoint}`;
};

/**
 * get relative width
 * @param num
 */
export const relativeWidth = (num: number): number => (DEVICE_WIDTH * num) / 100;

/**
 * get relative height
 * @param num
 */
export const relativeHeight = (num: number): number => (DEVICE_HEIGHT * num) / 100;

/**
 * parse date to string
 * @param date
 * @param format
 */
export const parseDateToString = (date: Date | moment.Moment, format: string): string => moment(date).format(format);

/**
 * parse string to date
 * @param dateString
 */
export const parseStringToDate = (dateString: string): Date => moment(dateString).toDate();

/**
 * parse string to moment date
 * @param dateString
 * @param format
 */
export const parseStringToMomentDate = (dateString: string, format?: string) => {
  if (format) {
    return moment(dateString, format);
  }
  return moment(dateString);
};

/**
 * Noop
 * @constructor
 */
export const Noop = () => { };

/**
 * is network connected
 * check whether internet is connected or not
 */
// eslint-disable-next-line react-hooks/rules-of-hooks
export const isNetworkConnected = (): boolean => NetInfo.useNetInfo().isConnected;


const getMonthString = (number: any) => {
  if (number == 0) {
    return 'Jan';
  } else if (number == 1) {
    return 'Feb';
  } else if (number == 2) {
    return 'Mar';
  } else if (number == 3) {
    return 'Apr';
  } else if (number == 4) {
    return 'May';
  } else if (number == 5) {
    return 'Jun';
  } else if (number == 6) {
    return 'Jul';
  } else if (number == 7) {
    return 'Aug';
  } else if (number == 8) {
    return 'Sep';
  } else if (number == 9) {
    return 'Oct';
  } else if (number == 10) {
    return 'Nov';
  } else if (number == 11) {
    return 'Dec';
  }
}

export const calculateDataLoadedTime = (storedDateData: any) => {
  const storedDate: Date = new Date(storedDateData);
  const time = 'Last updated ';
  const period = storedDate.getHours() > 12 ? 'PM' : 'AM';
  const hour = storedDate.getHours() > 12 ? storedDate.getHours() - 12 : storedDate.getHours();
  let minutes = storedDate.getMinutes().toString();
  minutes = minutes.length == 1 ? '0' + minutes : minutes;
  const currentDate: Date = new Date();
  if (storedDate.getDate() == currentDate.getDate()) {
    return time + "today, " + hour + ":" + minutes + " " + period;
  } else {
    const month = getMonthString(storedDate.getMonth());
    return time + month + ' ' + storedDate.getDate() + ', ' + hour + ":" + minutes + " " + period;
  }
}

export const getExpireInTime = (expiresAt: string) => {
  var expireDate = new Date((moment(expiresAt, "DD-MM-YYYY hh:mm:ss").toString()));
  console.log("Expiration Date from response " + expiresAt) 
  return expireDate
}

export let store;  // Redux store for non-component, non-saga uses.

export const injectStore = _store => {
  store = _store
}

enum BalanceDisplayFormats {
  INT_COMMA_SEPARATED = 'INT_COMMA_SEPARATED',
  IND_COMMA_SEPARATED = 'IND_COMMA_SEPARATED',
  INT_SPACE_SEPARATED = 'INT_SPACE_SEPARATED',
  INT_APOSTROPHE_SEPARATED = 'INT_APOSTROPHE_SEPARATED'
}

export const formatAmount = (amount: number, fractionDigits = true) => {
  const {balanceDecimalPlaces, balanceDisplayFormat} = store.getState().commonReducer?.companyDetails;

  const options = {
    minimumFractionDigits: fractionDigits ? balanceDecimalPlaces : 0,
    maximumFractionDigits: fractionDigits ? balanceDecimalPlaces : 0,
  }

  let INT_COMMA_SEPARATED = new Intl.NumberFormat('en-US', options);
  let INT_SPACE_SEPARATED = new Intl.NumberFormat('mfe', options);
  let IND_COMMA_SEPARATED = new Intl.NumberFormat('en-IN', options);
  let INT_APOSTROPHE_SEPARATED = new Intl.NumberFormat('en-CH', options);

  if(balanceDisplayFormat == BalanceDisplayFormats.INT_COMMA_SEPARATED){
    return INT_COMMA_SEPARATED.format(amount);
  } else if(balanceDisplayFormat == BalanceDisplayFormats.INT_SPACE_SEPARATED){
    return INT_SPACE_SEPARATED.format(amount);
  } else if(balanceDisplayFormat == BalanceDisplayFormats.INT_APOSTROPHE_SEPARATED){
    return INT_APOSTROPHE_SEPARATED.format(amount);
  } else{
    return IND_COMMA_SEPARATED.format(amount);
  }
}

export const deformatNumber = (input: string) : number => {
    // Remove commas, spaces, and apostrophes
    const cleanedInput = input.replace(/[$€₹, ']/g, '');
    const deformattedNumber = input.replace(/[$€₹, ']|\.0*$|(\.\d*?[1-9])0*$/g, '$1') //Done 
    return parseFloat(deformattedNumber);
}
export const giddhRoundOff = (number: any) => {
  const {balanceDecimalPlaces} = store.getState().commonReducer?.companyDetails;

  if (!("" + number).includes("e")) {
      return +(Math.round(Number(number + "e+" + balanceDecimalPlaces)) + "e-" + balanceDecimalPlaces);
  } else {
      var arr = ("" + number).split("e");
      var sig = ""
      if (+arr[1] + balanceDecimalPlaces > 0) {
          sig = "+";
      }
      return +(Math.round(Number(+arr[0] + "e" + sig + (+arr[1] + balanceDecimalPlaces))) + "e-" + balanceDecimalPlaces);
  }
};

export const capitalizeName = (_name: string | null | undefined) => {
  if (!_name) return null;

  const name = _name.toLocaleLowerCase();
  // If the name contains a hyphen, capitalize each part separated by hyphen
  if (name.includes('-')) {
    const parts = name.split('-');
    const capitalizedParts = parts.map(part => {
      if (part.length > 0) {
        return part.charAt(0).toUpperCase() + part.slice(1);
      }
      return '';
    });
    return capitalizedParts.join('-');
  }

  // Otherwise, treat as usual by splitting into words and capitalizing each word
  const words = name.split(' ');
  const capitalizedWords = words.map(word => {
    if (word.length > 0) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }
    return '';
  });
  return capitalizedWords.join(' ');
};

export const validateEmail = (email: string) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

export const validatePhoneNumber = (phoneNumber: string) => {
  const re = /^[1-9]\d{9,11}$/;
  return re.test(String(phoneNumber));
}

export const validateGST = (gstNumber: string) => {
  // Regular expression to validate the GST number format
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;

  // Check if GST number matches the regex pattern
  if (!gstRegex.test(gstNumber)) {
    return { isValid: false, stateCode: null };
  }

  // Extract the state code (first two digits)
  const stateCode = gstNumber.substring(0, 2);

  return { isValid: true, stateCode };
}