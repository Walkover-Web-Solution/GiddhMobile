import { getCountryList, getPlanSummaryAmount as _getPlanSummaryAmount, getSubscriptionPlans, setSelectedCountry, setSelectedPlan, setIsMonthlyPlan as _setIsMonthlyPlan, setFormData } from '@/redux/subscription/subscription.action';
import { REDUX_STATE } from '@/redux/types';
import { STORAGE_KEYS } from '@/utils/constants';
import AsyncStorage from '@react-native-community/async-storage';
import { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';

const selectPlansContries = (state: REDUX_STATE) => ({
    isLoading: state.subscriptionReducer.isLoading,
    plans: state.subscriptionReducer.plans,
    countries: state.subscriptionReducer.countries,
    selectedPlan: state.subscriptionReducer.selectedPlan,
    selectedCountry: state.subscriptionReducer.selectedCountry,
    companyDetails: state.commonReducer.companyDetails,
    isMonthlyPlan: state.subscriptionReducer.isMonthlyPlan
})

const usePlans = () => {
    const props = useSelector(selectPlansContries);
    const dispatch = useDispatch();

    useEffect(() => {
        const setDefaultEmail = async () => {
            const userEmail = await AsyncStorage.getItem(STORAGE_KEYS.googleEmail);
            dispatch(setFormData({ key: 'email', value: userEmail ?? '' }));
        }
        
        dispatch(getCountryList());
        dispatch(getSubscriptionPlans('IND'));
        setDefaultEmail();
    }, [dispatch])

    const setCountry = useCallback((country: any) => {
        dispatch(setSelectedCountry(country));
        dispatch(getSubscriptionPlans(country.alpha3CountryCode));
    }, [dispatch])


    const setPlan = useCallback((plan: any) => dispatch(setSelectedPlan(plan)), [dispatch]);
    
    const setIsMonthlyPlan = useCallback((isMonthlyPlan: boolean) => dispatch(_setIsMonthlyPlan(isMonthlyPlan)), [dispatch]);

    const getPlanSummaryAmount = useCallback((payload: any) => dispatch(_getPlanSummaryAmount(payload)), [dispatch])

    return { ...props, setSelectedCountry: setCountry, setSelectedPlan: setPlan, getPlanSummaryAmount, setIsMonthlyPlan }
}

export default usePlans;