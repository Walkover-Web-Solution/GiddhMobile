import { Platform, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import useCustomTheme, { ThemeProps } from '@/utils/theme';
import Feather from 'react-native-vector-icons/Feather'
import { formatAmount } from '@/utils/helper';
import { Modalize } from 'react-native-modalize';
import PlanSummarySection from './PlanSummarySection';
import useGetPlanDetails from '../hooks/useGetPlanDetails';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Portal } from 'react-native-portalize';

type Props = { 
    bottomSheetRef: React.MutableRefObject<null>
    plan: any
    isMonthlyPlan: boolean
}

const PlanDetailsBottomSheet: React.FC<Props> = ({ bottomSheetRef, plan, isMonthlyPlan }) => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { theme, styles } = useCustomTheme(getStyles, 'Payment');
    const planDuration = isMonthlyPlan ? 'Month' : 'Year';
    const currencySymbol = plan?.currency?.symbol;

    const planDescription = plan.description;

    const {
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
        isFeatureTextVisible
    } = useGetPlanDetails();

    const features = [
        {
            featureName: 'Invoice Count',
            value: formatAmount(plan?.invoicesAllowed, false)
        },
        {
            featureName: 'Bill Count',
            value: formatAmount(plan?.billsAllowed, false)
        },
        {
            featureName: 'Companies allowed',
            value: formatAmount(plan?.companiesLimit, false)
        },
        {
            featureName: 'Accountant consultant',
            value: <Feather name={featureNotAvailable ? "x" : "check"} size={20} color={featureNotAvailable ? theme.colors.primary : theme.colors.solids.green.dark} />
        },
        {
            featureName: 'Desktop/Mobile App',
            value: <Feather name="check" size={20} color={theme.colors.solids.green.dark} />
        },
        {
            featureName: 'Unlimited Users',
            value: <Feather name={featureNotAvailable ? "x" : "check"} size={20} color={featureNotAvailable ? theme.colors.primary : theme.colors.solids.green.dark} />
        },
        {
            featureName: 'Import Previous Data',
            value: <Feather name="check" size={20} color={theme.colors.solids.green.dark} />
        },
        {
            featureName: 'Security',
            value: <Feather name="check" size={20} color={theme.colors.solids.green.dark} />
        },
        {
            featureName: 'Support',
            value: featureNotAvailable ? <Feather name={"x"} size={20} color={featureNotAvailable ? theme.colors.primary : theme.colors.solids.green.dark} /> : 'Chat/Voice'
        },
        {
            featureName: 'E-invoice',
            value: <Feather name={featureNotAvailable ? "x" : "check"} size={20} color={featureNotAvailable ? theme.colors.primary : theme.colors.solids.green.dark} />
        },
        {
            featureName: 'GST Direct Filling',
            value: <Feather name={featureNotAvailable ? "x" : "check"} size={20} color={featureNotAvailable ? theme.colors.primary : theme.colors.solids.green.dark} />
        },
    ]

    return (
        <Portal>
        <Modalize
            ref={bottomSheetRef}
            adjustToContentHeight={Platform.OS === "ios" ? false: true}
            handlePosition='inside'
            modalStyle={{ minHeight: '25%', marginTop: insets.top}}
            keyboardAvoidingBehavior="padding"
        >
            <View style={styles.card}>
                <View style={styles.headerSection}>
                    <Text style={styles.planName}>{planName}</Text>

                    { planDescription &&
                        <>
                            <Text style={styles.itemText}>{planDescription}</Text>
                            { isFeatureTextVisible && <Text style={styles.crossedAmount}> {currencySymbol}{formatAmount(planAmount, false)} </Text> }
                        </>
                    }
                    <Text style={styles.amountText}>{currencySymbol}{formatAmount(planAmountAfterDiscount, false)}<Text style={styles.regularText}> /{planDuration}</Text></Text>

                    { isFeatureTextVisible &&
                        <Text style={[styles.itemText, { marginTop: 6 }]}>Save {formatAmount(discountAmount, false)} for {discountDuration}</Text>
                    }
                </View>

                <View style={{paddingVertical: 16}}>
                    {
                        features.map(({ featureName, value }) => (
                            <View style={styles.itemRow}>
                                <Text style={styles.itemText}>{featureName}</Text>
                                <Text style={styles.itemText}>{value}</Text>
                            </View>
                        ))
                    }
                </View>

                <PlanSummarySection>
                    <PlanSummarySection.Button
                        onPress={() => {
                            setBottomSheetVisible(bottomSheetRef, false);
                            navigation.navigate('BillingAccountScreen');
                        }}
                        textStyle={{ color: theme.colors.vouchers.payment.background, fontFamily: theme.typography.fontFamily.extraBold}}
                        buttonBackgroundColor={theme.colors.solids.blue.light}
                    >
                        Continue to Billing Account
                    </PlanSummarySection.Button>
                </PlanSummarySection>

            </View>
        </Modalize>
        </Portal>
    )
}

export default PlanDetailsBottomSheet

const getStyles = (theme: ThemeProps) => StyleSheet.create({
    card: {
        paddingVertical: 20,
        justifyContent: 'space-around',   
    },
    headerSection: {
        alignItems: 'center',
        marginVertical: 12
    },
    planName: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.fontSize.xLarge.size,
        color: theme.colors.text,
        marginBottom: 12
    },
    regularText: {
        fontFamily: theme.typography.fontFamily.semiBold,
        fontSize: theme.typography.fontSize.small.size,
        color: theme.colors.text
    },
    itemText: {
        fontFamily: theme.typography.fontFamily.semiBold,
        fontSize: theme.typography.fontSize.regular.size,
        color: theme.colors.text
    },
    amountText: {
        fontFamily: theme.typography.fontFamily.extraBold,
        fontSize: theme.typography.fontSize.xLarge.size,
        color: theme.colors.text,
        marginTop: 6
    },
    crossedAmount: {
        textDecorationLine: 'line-through',
        color: theme.colors.secondaryText,
        marginTop: 4 
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 8
    }
})