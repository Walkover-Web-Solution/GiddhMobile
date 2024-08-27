import { REDUX_STATE } from "@/redux/types";
import { useSelector } from "react-redux";

const useGetPlanDetails = () => {
    const { plan, isMonthlyPlan, selectedCountry } = useSelector((state: REDUX_STATE) => ({
        plan: state.subscriptionReducer.selectedPlan,
        isMonthlyPlan: state.subscriptionReducer.isMonthlyPlan,
        selectedCountry: state.subscriptionReducer.selectedCountry
    }));
    
    let currencySymbol = plan?.currency?.symbol;
    let planName = plan.name;
    let planAmount = 0;
    let planAmountAfterDiscount = 0;
    let discountAmount = 0;
    let durationAmount = 0;
    let subTotal = 0;
    let finalAmount = 0;
    let description = plan?.description;
    let discountDuration = '';
    let isFeatureTextVisible = false;
    let featureNotAvailable = false;

    if (isMonthlyPlan) {
        planAmount = plan?.monthlyAmount;
        planAmountAfterDiscount = plan?.monthlyAmountAfterDiscount;
        finalAmount = plan?.monthlyAmountAfterDiscount;
        discountAmount = plan?.monthlyDiscountAmount;
        discountDuration = plan?.monthlyDiscount?.duration + ' month';
        isFeatureTextVisible = plan?.monthlyDiscountAmount > 0
        featureNotAvailable = plan?.monthlyAmount === 0
    }
    else {
        planAmount = plan?.yearlyAmount;

        planAmountAfterDiscount = plan?.yearlyAmountAfterDiscount;
        finalAmount = plan?.yearlyAmountAfterDiscount;

        discountAmount = plan?.yearlyDiscountAmount;
        discountDuration = plan?.yearlyDiscount?.duration + ' year';
        isFeatureTextVisible = plan?.yearlyDiscountAmount > 0
        featureNotAvailable = plan?.yearlyAmount === 0
    }

    return {
        currencySymbol,
        planName,
        planAmount,
        planAmountAfterDiscount, 
        discountAmount, 
        durationAmount, 
        subTotal, 
        finalAmount, 
        description,
        discountDuration,
        featureNotAvailable,
        isFeatureTextVisible,
        isMonthlyPlan,
        selectedCountry
    }
}

export default useGetPlanDetails;