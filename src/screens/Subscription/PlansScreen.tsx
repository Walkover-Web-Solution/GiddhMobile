import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useMemo, useRef } from 'react'
import useCustomTheme, { ThemeProps } from '@/utils/theme';
import Header from '@/components/Header';
import usePlans from './hooks/usePlans';
import RegionSelector from './components/RegionSelector';
import PlanCard from './components/PlanCard';
import PlanDetailsBottomSheet from './components/PlanDetailsBottomSheet';
import Loader from '@/components/Loader';
import ConfirmationBottomSheet from '@/components/ConfirmationBottomSheet';
import { useDispatch } from 'react-redux';
import { logout } from '@/redux/CommonAction';

const PlansScreen = () => {
    const { theme, styles, statusBar, voucherBackground } = useCustomTheme(getStyles, 'Payment');
    const dispatch = useDispatch();
    const {
        isLoading,
        plans,
        countries,
        getPlanSummaryAmount,
        isMonthlyPlan, setIsMonthlyPlan,
        selectedPlan, setSelectedPlan,
        selectedCountry, setSelectedCountry
    } = usePlans();
    const planDetailsBottomSheetRef = useRef<any>(null);
    const confirmationBottomSheetRef = useRef<any>(null);

    const showDurationSwitchButton = useMemo(() => {
        const isMonthlyPlanPresent = plans.some((plan: any) => plan.hasOwnProperty('monthlyAmount') && plan?.monthlyAmount !== null);
        const isYearlyPlanPresent = plans.some((plan: any) => plan.hasOwnProperty('yearlyAmount') && plan?.yearlyAmount!== null);

        if (isYearlyPlanPresent && isMonthlyPlanPresent) {
            return true;
        }
        else {
            setIsMonthlyPlan(!isYearlyPlanPresent);
            return false;
        }
    }, [plans, setIsMonthlyPlan])

    const onSelectPlan = useCallback((plan: any) => {
        setSelectedPlan(plan);
        // getPlanSummaryAmount({
        //     duration: isMonthlyPlan ? 'MONTHLY' : 'YEARLY',
        //     planUniqueName: plan.uniqueName,
        //     promoCode: ''
        // })
        planDetailsBottomSheetRef?.current?.open()
    }, [planDetailsBottomSheetRef])

    return (
        <SafeAreaView style={styles.container}>
            {isLoading && <Loader isLoading={isLoading}/>}
            <Header
                header='Plans'
                statusBarColor={statusBar}
                backgroundColor={voucherBackground}
                isBackButtonVisible
                onBackButtonPress={() => confirmationBottomSheetRef?.current?.open()}
                headerRightContent={
                    <RegionSelector
                        countries={countries}
                        selectedCountry={selectedCountry}
                        setSelectedCountry={setSelectedCountry}
                    />
                }
            />

            {   showDurationSwitchButton &&
                <View style={styles.toggleWrapper}>
                    <TouchableOpacity 
                        style={[styles.durationWrapper, { backgroundColor: isMonthlyPlan ? voucherBackground : undefined, overflow: 'hidden' }]}
                        onPress={() => setIsMonthlyPlan(true)}
                    >
                        <Text style={[styles.regularText, isMonthlyPlan && { color: theme.colors.solids.white }]}>Month</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.durationWrapper, { backgroundColor: !isMonthlyPlan ? voucherBackground : undefined, overflow: 'hidden' }]}
                        onPress={() => setIsMonthlyPlan(false)}
                    >
                            <Text style={[styles.regularText, !isMonthlyPlan && { color: theme.colors.solids.white }]}>Year</Text>
                        </TouchableOpacity>
                </View>
            }
            
            {   !isLoading && 
                <ScrollView
                    style={{ marginTop: 8}}
                    showsHorizontalScrollIndicator={false}                
                >
                    {   
                        // plans.slice().reverse()
                        plans.sort((a: any, b: any) => a?.[isMonthlyPlan ? 'monthlyAmount' : 'yearlyAmount'] - b?.[isMonthlyPlan ? 'monthlyAmount' : 'yearlyAmount']).map((plan: any, index: number) => {
                            if (isMonthlyPlan && plan?.monthlyAmount === undefined || !isMonthlyPlan && plan?.yearlyAmount === undefined) return;
                            return (
                                <PlanCard
                                    key={index}
                                    index={index}
                                    isMonthlyPlan={isMonthlyPlan}
                                    plan={plan}
                                    setSelectedPlan={onSelectPlan}
                                />
                            )
                        })
                    }          
                </ScrollView>
            }

            <PlanDetailsBottomSheet
                bottomSheetRef={planDetailsBottomSheetRef}
                isMonthlyPlan={isMonthlyPlan}
                plan={selectedPlan}
            />
            <ConfirmationBottomSheet
                bottomSheetRef={confirmationBottomSheetRef}
                message={ConfirmationBottomSheet.ConfirmationMessages.LOGOUT.message}
                description={ConfirmationBottomSheet.ConfirmationMessages.LOGOUT.description}
                onReject={confirmationBottomSheetRef?.current?.close}
                onConfirm={() => {
                    confirmationBottomSheetRef?.current?.close();
                    dispatch(logout());
                }}
            />
        </SafeAreaView>
    )
}

export default PlansScreen

const getStyles = (theme: ThemeProps) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    regularText: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.regular.size,
        color: theme.colors.text
    },
    durationWrapper: {
        paddingVertical: 8,
        paddingHorizontal: 14
    },
    toggleWrapper: { 
        alignSelf: 'flex-end', borderColor: theme.colors.solids.grey.light,
        borderWidth: 1.6,
        borderRadius: 8, overflow: 'hidden',
        margin: 8,
        marginBottom: 0,
        flexDirection: 'row'
    }
})