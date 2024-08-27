import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { memo } from 'react'
import useCustomTheme, { ThemeProps } from '@/utils/theme';
import { formatAmount } from '@/utils/helper';

type Props = { 
    plan: any
    setSelectedPlan: (plan: any) => void
    index: number
    isMonthlyPlan: boolean
}

const getPlanDetails = (plan: any, isMonthlyPlan: boolean) => {
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
    let featureNotAvailable = plan?.monthlyAmount === 0 && plan?.yearlyAmount === 0;

    if (isMonthlyPlan) {
        planAmount = plan?.monthlyAmount;
        planAmountAfterDiscount = plan?.monthlyAmountAfterDiscount;
        discountAmount = plan?.monthlyDiscountAmount;
        discountDuration = plan?.monthlyDiscount?.duration + ' month';
        isFeatureTextVisible = plan?.monthlyDiscountAmount > 0
    }
    else {
        planAmount = plan?.yearlyAmount;
        planAmountAfterDiscount = plan?.yearlyAmountAfterDiscount;
        discountAmount = plan?.yearlyDiscountAmount;
        discountDuration = plan?.yearlyDiscount?.duration + ' year';
        isFeatureTextVisible = plan?.yearlyDiscountAmount > 0
    }

    return { 
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
    }
}

const _PlanCard: React.FC<Props> = ({ plan, setSelectedPlan, index, isMonthlyPlan }) => {
    const { theme, styles } = useCustomTheme(getStyles, 'Payment');
    const planDuration = isMonthlyPlan ? 'Month' : 'Year';
    const planDescription = plan.description;
    const currencySymbol = plan?.currency?.symbol;

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
    } = getPlanDetails(plan, isMonthlyPlan);

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
        }
    ]

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            style={styles.card}
            onPress={() => setSelectedPlan(plan)}
        >
            <View style={styles.headerSection}>
                <Text style={styles.planName}>{planName}</Text>

                { planDescription &&
                    <>
                        <Text style={styles.smallText}>{planDescription}</Text>
                        { isFeatureTextVisible && <Text style={styles.crossedAmount}> {currencySymbol}{formatAmount(planAmount, false)} </Text> }
                    </>
                }
                <Text style={styles.amountText}>{currencySymbol}{formatAmount(planAmountAfterDiscount, false)}<Text style={styles.regularText}> /{planDuration}</Text></Text>

                { isFeatureTextVisible &&
                    <Text style={[styles.itemText, { marginTop: 6 }]}>Save {formatAmount(discountAmount, false)} for {discountDuration}</Text>
                }
            </View>

            <View>
                {
                    features.map(({ featureName, value }) => (
                        <View style={styles.itemRow}>
                            <Text style={styles.itemText}>{featureName}</Text>
                            <Text style={styles.itemText}>{value}</Text>
                        </View>
                    ))
                }
            </View>
        </TouchableOpacity>
    )
}

const getStyles = (theme: ThemeProps) => StyleSheet.create({
    card: {
        padding: 14,
        borderColor: theme.colors.solids.grey.light,
        borderWidth: 1.4,
        borderRadius: 8,
        marginVertical: 4,
        marginHorizontal: 12     
    },
    headerSection: {
        alignItems: 'center',
        marginBottom: 8
    },
    planName: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.fontSize.xLarge.size,
        color: theme.colors.text,
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
    smallText: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.small.size,
        color: theme.colors.text
    },
    crossedAmount: {
        textDecorationLine: 'line-through',
        color: theme.colors.secondaryText,
        marginTop: 4 
    },
    semiBoldText:{
        fontFamily: theme.typography.fontFamily.extraBold,
        fontSize: theme.typography.fontSize.regular.size,
        color: theme.colors.text
    },
    amountText: {
        fontFamily: theme.typography.fontFamily.extraBold,
        fontSize: theme.typography.fontSize.xLarge.size,
        color: theme.colors.text
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 14,
    },
    selectPlanButton: {
        borderColor: theme.colors.solids.grey.light,
        borderWidth: 1.4,
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 28,
        alignItems: 'center'
    },
    globalIcon: {
        paddingLeft: 6,
        paddingRight: 16 
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        paddingVertical: 4
    }
})

const PlanCard = memo(_PlanCard);

export default PlanCard;