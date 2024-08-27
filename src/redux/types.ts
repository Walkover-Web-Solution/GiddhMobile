type SubscriptionStateType = {
    isLoading: false,
    plans: any[],
    countries: any[],
    selectedCountry: { [key: string]: any },
    selectedPlan: { [key: string]: any },
    promoCode: string,
    isMonthlyPlan: false,
    allCountries: any[],
    allStates:  any[],
    planSummaryAmount: { [key: string]: any },
    appliedPromoCode: { [key: string]: any },
    formData: {
        billingName: string,
        companyName: string,
        email: string,
        pinCode: string,
        mobile: {
            mobileCode: string,
            countryCode: string,
            mobileNumber: string
        },
        country: {
            code: string,
            name: string
        },
        state: {
            code: string,
            name: string,
            stateGstCode: string
        },
        taxNumber: string,
        address: string
    },
    subscriptionData: { [key: string]: any }
}

type REDUX_STATE = {
    commonReducer: any
    subscriptionReducer: SubscriptionStateType
}

export type { REDUX_STATE, SubscriptionStateType }