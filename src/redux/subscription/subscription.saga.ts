import { takeLatest, call, put, select } from 'redux-saga/effects';
import * as ActionConstants from '../ActionConstants';
import { CompanyService } from '@/core/services/company/company.service';
import { setAllCountries, setCountryList, setCountryStates, setAppliedPromoCode, setPlanSummaryAmount, setSubscriptionPlans, setSubscriptionData, setIsLoading } from './subscription.action';
import Toast from '@/components/Toast';

export default function* watcherSubscriptionSaga() {
    yield takeLatest(ActionConstants.GET_SUBSCRIPTION_PLANS, getSubscriptionPlans);
    yield takeLatest(ActionConstants.GET_COUNTRY_LIST, getCountryList);
    yield takeLatest(ActionConstants.GET_ALL_COUNTRIES, getAllCountries);
    yield takeLatest(ActionConstants.GET_COUNTRY_STATES, getCountryStates);
    yield takeLatest(ActionConstants.GET_PLAN_SUMMARY_AMOUNT, getPlanSummaryAmount);
    yield takeLatest(ActionConstants.APPLY_PROMO_CODE, applyPromoCode);
    yield takeLatest(ActionConstants.START_TRIAL, subscribePlan);
}

function* getSubscriptionPlans(action) {
    yield put(setIsLoading(true));
    try {
        const response =  yield call(CompanyService.getSubscriptionPlans, action.payload);

        if (response.status === 200) {
            yield put(setSubscriptionPlans(response.data.body))
        }
    }
    catch (error) {
        console.error('----- Error in getSubscriptionPlans -----', error?.data?.message);
    }
    finally {
        yield put(setIsLoading(false));
    }
}

function* getCountryList() {
    try {
        const response =  yield call(CompanyService.getCountryList);

        if (response.status === 200) {
            yield put(setCountryList(response.data.body))
        }
    }
    catch (error) {
        console.error('----- Error in getCountryList -----', error?.data?.message);
    }
}

function* getAllCountries() {
    try {
        const response =  yield call(CompanyService.getAllCountries);

        if (response.status === 200) {
            yield put(setAllCountries(response.data.body))
        }
    }
    catch (error) {
        console.error('----- Error in getAllCountries -----', error?.data?.message);
    }
}

function* getCountryStates(action: any) {
    try {
        const response =  yield call(CompanyService.getCountryStates, action.payload);

        if (response.status === 201) {
            yield put(setCountryStates(response.data.body.stateList))
        }
    }
    catch (error) {
        console.error('----- Error in getCountryStates -----', error?.data?.message);
    }
}

function* getPlanSummaryAmount(action: any) {
    try {
        const response =  yield call(CompanyService.getAmount, action.payload);

        if (response.status === 200) {
            yield put(setPlanSummaryAmount(response.data.body))
        }
    }
    catch (error) {
        console.error('----- Error in getPlanSummaryAmount -----', error?.data?.message);
    }
}

function* applyPromoCode(action: any) {
    try {
        const response = yield call(CompanyService.applyPromocode, action.payload);
        
        if(response.status === 200) {
            yield put(setAppliedPromoCode(response.data.body));
            Toast({ message: 'Promo Code Applied!' });
        }
    }
    catch (error: any) {
        console.error('----- Error in ApplyPromoCode -----', error?.data?.message);
        Toast({ message: error?.data?.message });
    }
}

function* subscribePlan(action: any) {
    yield put(setIsLoading(true));
    try {
        const state = yield select();
        const payload = {
            duration: state.subscriptionReducer.isMonthlyPlan ? 'MONTHLY' : 'YEARLY',
            payNow: false,
            paymentProvider: 'RAZORPAY',
            planUniqueName: state.subscriptionReducer.selectedPlan?.uniqueName,
            promoCode: !!state.subscriptionReducer?.appliedPromoCode?.uniqueName ? state.subscriptionReducer.promoCode.trim() : null,
            subscriptionId: null,
            userUniqueName: null,
            billingAccount: {
                billingName: state.subscriptionReducer.formData.billingName,
                companyName: state.subscriptionReducer.formData.companyName,
                country: state.subscriptionReducer.formData.country,
                state: state.subscriptionReducer.formData.state,
                email: state.subscriptionReducer.formData.email,
                mobileNumber: state.subscriptionReducer.formData.mobile?.mobileCode + state.subscriptionReducer.formData.mobile?.mobileNumber,
                pincode: state.subscriptionReducer.formData.pinCode,
                taxNumber: state.subscriptionReducer.formData.taxNumber,
                address: state.subscriptionReducer.formData.address
            }
        }

        const response = yield call(CompanyService.planSubscribe, payload);
        
        if(response.status === 200) {
            yield put(setSubscriptionData(response.data.body));
        }
    }
    catch (error: any) {
        console.error('----- Error in subscribePlan -----', error?.data?.message);
        Toast({ message: error?.data?.message });
    }
    finally {
        yield put(setIsLoading(false));
    }
}
