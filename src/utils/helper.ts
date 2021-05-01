import {Dimensions} from 'react-native';
import moment from 'moment';
import NetInfo from '@react-native-community/netinfo';
import {API_URL} from '@/env.json';

const DEVICE_WIDTH = Dimensions.get('window').width;
const DEVICE_HEIGHT = Dimensions.get('window').height;

/**
 * create endpoint helper
 * creates api endpoint for current environment
 * @param endpoint
 */
export const createEndpoint = (endpoint: string): string => {
  return `${API_URL}${endpoint}`;
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
export const Noop = () => {};

/**
 * is network connected
 * check whether internet is connected or not
 */
// eslint-disable-next-line react-hooks/rules-of-hooks
export const isNetworkConnected = (): boolean => NetInfo.useNetInfo().isConnected;
