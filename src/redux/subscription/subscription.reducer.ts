import * as ActionConstants from '../ActionConstants';
import { REHYDRATE } from 'redux-persist';
import { SubscriptionStateType } from '../types';

const initialState : SubscriptionStateType = {
    isLoading: false,
    plans: [],
    countries: [],
    selectedCountry: {},
    selectedPlan: {},
    promoCode: '',
    isMonthlyPlan: false,
    allCountries: [],
    allStates: [],
    planSummaryAmount: {},
    appliedPromoCode: {},
    formData: {
        billingName: '',
        companyName: '',
        email: '',
        pinCode: '',
        mobile: {
            mobileCode: '91',
            countryCode: 'IN',
            mobileNumber: ''
        },
        country: {
            code: '',
            name: ''
        },
        state: {
            code: '',
            name: '',
            stateGstCode: ''
        },
        taxNumber: '',
        address: ''
    },
    subscriptionData: {}
} as const;


export default (state = initialState, action: any): typeof initialState => {
    switch (action.type) {
        case REHYDRATE:
            return { ...initialState };

        case ActionConstants.LOGOUT:
            return { ...initialState };

        case ActionConstants.SET_IS_LOADING:
            console.log(action.payload)
            return {
                ...state,
                isLoading: action.payload
            };

        case ActionConstants.SET_SUBSCRIPTION_PLANS:
            return {
                ...state,
                plans: action.payload
            }

        case ActionConstants.SET_SELECTED_PLAN:
            return {
                ...state,
                selectedPlan: action.payload,
                ...(!!state.appliedPromoCode?.uniqueName && { appliedPromoCode: {} })
            }

        case ActionConstants.SET_COUNTRY_LIST:
            return {
                ...state,
                countries: action.payload,
                selectedCountry: action.payload.find((country: any) => country.alpha3CountryCode === "IND")
            }

        case ActionConstants.SET_SELECTED_COUNTRY:
            return {
                ...state,
                selectedCountry: action.payload
            }

        case ActionConstants.SET_PROMO_CODE:
            return {
                ...state,
                promoCode: action.payload
            }

        case ActionConstants.SET_APPLIED_PROMO_CODE:
            return {
                ...state,
                appliedPromoCode: action.payload
            }

        case ActionConstants.SET_PLAN_SUMMARY_AMOUNT:
            return {
                ...state,
                planSummaryAmount: action.payload
            }

        case ActionConstants.SET_IS_MONTHLY_PLAN:
            return {
                ...state,
                isMonthlyPlan: action.payload
            }

        case ActionConstants.SET_ALL_COUNTRIES:
            return {
                ...state,
                allCountries: action.payload
            }

        case ActionConstants.SET_COUNTRY_STATES:
            if (action?.payload?.length === 1) {
                return {
                    ...state,
                    allStates: action.payload,
                    formData: {
                        ...state.formData,
                        state: {
                            code: action.payload[0].code,
                            name: action.payload[0].name,
                            stateGstCode: action.payload[0].stateGstCode
                        }
                    }
                }
            }

            return {
                ...state,
                allStates: action.payload?.sort((a: any, b: any) => a?.name > b?.name ? 1 : -1),
            }

        case ActionConstants.SET_FORM_DATA:
            const { key, value } = action.payload

            console.log(key, value)
            return {
                ...state,
                formData: {
                    ...state.formData,
                    [key]: value
                }
            }

        case ActionConstants.SET_SUBSCRIPTION_DATA:
            return {
                ...state,
                subscriptionData: action.payload
            }

        default: 
            return state;
    }
}