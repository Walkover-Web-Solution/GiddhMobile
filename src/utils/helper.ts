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
export const isNetworkConnected = (): any => NetInfo.fetch().then((info) => info.isInternetReachable);

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
};

export const calculateDataLoadedTime = (storedDateData: any) => {
  const storedDate: Date = new Date(storedDateData);
  const time = 'Last updated ';
  const period = storedDate.getHours() > 12 ? 'PM' : 'AM';
  const hour = storedDate.getHours() > 12 ? storedDate.getHours() - 12 : storedDate.getHours();
  let minutes = storedDate.getMinutes().toString();
  minutes = minutes.length == 1 ? '0' + minutes : minutes;
  const currentDate: Date = new Date();
  if (storedDate.getDate() == currentDate.getDate()) {
    return time + 'today, ' + hour + ':' + minutes + ' ' + period;
  } else {
    const month = getMonthString(storedDate.getMonth());
    return time + month + ' ' + storedDate.getDate() + ', ' + hour + ':' + minutes + ' ' + period;
  }
};
