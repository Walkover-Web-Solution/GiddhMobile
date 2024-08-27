import { useCallback, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux";
import { getAllCountries, getCountryStates as _getCountryStates } from "@/redux/subscription/subscription.action";
import { REDUX_STATE } from "@/redux/types";

const selectAllCountries= (state: REDUX_STATE) => state.subscriptionReducer.allCountries;
const selectAllStates = (state: REDUX_STATE) => state.subscriptionReducer.allStates

const useGetCountriesStates = () => {
    const allCountries = useSelector(selectAllCountries);
    const allStates = useSelector(selectAllStates);
    const dispatch = useDispatch();

    const getCountryStates = useCallback((countryCode: string) => dispatch(_getCountryStates(countryCode)), [dispatch]);

    useEffect(() => {
        dispatch(getAllCountries());
    }, [])

    return { allCountries, allStates, getCountryStates }
}

export default useGetCountriesStates;