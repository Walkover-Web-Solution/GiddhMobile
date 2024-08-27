import { useCallback } from "react"
import { useDispatch, useSelector } from "react-redux";
import { getCountryStates as _getCountryStates, setFormData as _setFormData } from "@/redux/subscription/subscription.action";
import { REDUX_STATE, SubscriptionStateType } from "@/redux/types";

const selectFormData = (state: REDUX_STATE) => state.subscriptionReducer.formData

const useForm = () => {
    const formData = useSelector(selectFormData);
    const dispatch = useDispatch();

    const setFormData = useCallback((value: any, key: string) => dispatch(_setFormData({ key, value })), [dispatch]);

    return { formData, setFormData }
}

export default useForm;