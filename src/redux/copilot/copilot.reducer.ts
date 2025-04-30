import * as ActionConstants from '../ActionConstants';
const initialState : any = {
    biometricTourEnabled: false
} as const;


export default (state = initialState, action: any): typeof initialState => {
    switch (action.type) {
        case ActionConstants.SET_BIOMETRIC_TOUR_ENABLED:
            console.log("action.payload", action.payload);
            
            return {
                ...state,
                biometricTourEnabled: action.payload
            }
        
        case ActionConstants.LOGOUT:
            return {
                ...initialState
            }
        default: 
            return state;
    }
}