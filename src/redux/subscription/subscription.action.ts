import * as ActionConstants from '../ActionConstants';

export const getSubscriptionPlans = (regionCode: string) => ({
    type: ActionConstants.GET_SUBSCRIPTION_PLANS,
    payload: regionCode
})

export const setSubscriptionPlans = (regionCode: string) => ({
    type: ActionConstants.SET_SUBSCRIPTION_PLANS,
    payload: regionCode
})

export const getCountryList = () => ({
    type: ActionConstants.GET_COUNTRY_LIST
})

export const setCountryList = (payload: Array<any>) => ({
    type: ActionConstants.SET_COUNTRY_LIST,
    payload
})

export const setSelectedPlan = (plan: any) => ({
    type: ActionConstants.SET_SELECTED_PLAN,
    payload: plan
})

export const setSelectedCountry = (country: any) => ({
    type: ActionConstants.SET_SELECTED_COUNTRY,
    payload: country
})

export const setPromoCode = (promoCode: string) => ({
    type: ActionConstants.SET_PROMO_CODE,
    payload: promoCode
})

export const applyPromoCode = (payload: any) => ({
    type: ActionConstants.APPLY_PROMO_CODE,
    payload
})

export const setAppliedPromoCode = (payload: any) => ({
    type: ActionConstants.SET_APPLIED_PROMO_CODE,
    payload
})

export const setIsMonthlyPlan = (isMonthlyPlan: boolean) => ({
    type: ActionConstants.SET_IS_MONTHLY_PLAN,
    payload: isMonthlyPlan
})

export const getAllCountries = () => ({
    type: ActionConstants.GET_ALL_COUNTRIES,
})

export const setAllCountries = (payload: any) => ({
    type: ActionConstants.SET_ALL_COUNTRIES,
    payload
})

export const getCountryStates = (countryCode: string) => ({
    type: ActionConstants.GET_COUNTRY_STATES,
    payload: countryCode
})

export const setCountryStates = (payload: any) => ({
    type: ActionConstants.SET_COUNTRY_STATES,
    payload
})

export const setFormData = (payload: any) => ({
    type: ActionConstants.SET_FORM_DATA,
    payload
})

export const getPlanSummaryAmount = (payload: any) => ({
    type: ActionConstants.GET_PLAN_SUMMARY_AMOUNT,
    payload
})

export const setPlanSummaryAmount = (payload: any) => ({
    type: ActionConstants.GET_PLAN_SUMMARY_AMOUNT,
    payload
})

export const setSubscriptionData = (payload: any) => ({
    type: ActionConstants.SET_SUBSCRIPTION_DATA,
    payload
})

export const startTrial = () => ({
    type: ActionConstants.START_TRIAL
})

export const setIsLoading = (isLoading: boolean) => ({
    type: ActionConstants.SET_IS_LOADING,
    payload: isLoading
})