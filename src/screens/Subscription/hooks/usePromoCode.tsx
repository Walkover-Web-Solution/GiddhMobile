import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPromoCode as _setPromoCode, applyPromoCode, setAppliedPromoCode } from "@/redux/subscription/subscription.action";
import { REDUX_STATE } from "@/redux/types";

const usePromoCode = () => {
    const dispatch = useDispatch();
    const { promoCode, selectedPlan, isMonthlyPlan, appliedPromoCode } = useSelector((state: REDUX_STATE) => ({
        promoCode: state.subscriptionReducer.promoCode,
        selectedPlan: state.subscriptionReducer.selectedPlan,
        isMonthlyPlan: state.subscriptionReducer.isMonthlyPlan,
        appliedPromoCode: state.subscriptionReducer.appliedPromoCode
    }));

    const setPromoCode = useCallback((promoCode: string) => dispatch(_setPromoCode(promoCode)), [dispatch]);

    const onApplyPromoCode = () => {

        if (appliedPromoCode?.uniqueName) {
            dispatch(setAppliedPromoCode({}));
            setPromoCode('');
        }
        else {
            dispatch(applyPromoCode({
                duration: isMonthlyPlan ? 'MONTHLY' : 'YEARLY',
                planUniqueName: selectedPlan?.uniqueName,
                promoCode: promoCode?.trim()
            }));
        }
    }

    return { promoCode, setPromoCode, appliedPromoCode, onApplyPromoCode }
}

export default usePromoCode;