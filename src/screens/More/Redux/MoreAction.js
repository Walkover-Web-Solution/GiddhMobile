import * as Actions from './ActionConstants';

export function turnOnOfflineMode() {
  return {
    type: Actions.TURN_ON_OFFLINE_MODE,
  };
}
export function turnOffOfflineMode() {
  return {
    type: Actions.TURN_OFF_OFFLINE_MODE,
  };
}
