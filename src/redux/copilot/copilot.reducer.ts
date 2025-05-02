import * as ActionConstants from '../ActionConstants';

interface TourState {
    pendingScreens: string[];
}

const initialState : TourState = {
    pendingScreens: ["MoreScreen"]
} as const;


export default (state = initialState, action: any): typeof initialState => {
    switch (action.type) {
        case ActionConstants.MARK_TOUR_FOR_SCREEN:
            console.log("action.payload", action.payload);
            
            return {
                ...state,
                pendingScreens: !state.pendingScreens.includes(action.payload) 
                    ? [...state.pendingScreens, action.payload]
                    : state.pendingScreens
            }
        
        case ActionConstants.CLEAR_TOUR_FOR_SCREEN:
            return {
                ...state,
                pendingScreens: state.pendingScreens.filter(screen => screen !== action.payload)
            }
        default: 
            return state;
    }
}