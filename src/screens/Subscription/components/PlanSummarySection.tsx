import { Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React from 'react'
import useCustomTheme, { ThemeProps } from '@/utils/theme';
import { formatAmount } from '@/utils/helper';
import useGetPlanDetails from '../hooks/useGetPlanDetails';
import usePromoCode from '../hooks/usePromoCode';

const { width } = Dimensions.get('window');

const TAX_PERCENTAGE = 0.18;

// --------- Plan Summary Section ---------

type PlanSummarySectionType = React.FC<{ children?: React.ReactNode }> & {
    Button: typeof PlanSummarySectionButton;
};

const PlanSummarySection: PlanSummarySectionType = ({ children }) => {
    const { theme, styles, voucherBackground } = useCustomTheme(getStyles, 'Payment');
    const { promoCode, setPromoCode, appliedPromoCode, onApplyPromoCode } = usePromoCode();
    const {
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
    } = useGetPlanDetails();

    const planDuration = isMonthlyPlan ? 'Month' : 'Year';
    const isPromoCodeApplied = !!appliedPromoCode?.uniqueName;

    let _finalAmount = appliedPromoCode?.finalAmount ?? finalAmount;

    if (selectedCountry?.alpha3CountryCode === 'IND') {
        _finalAmount = _finalAmount + (_finalAmount * TAX_PERCENTAGE)
    }

    const listItems = [
        {
            key: planName,
            value: planAmount
        },
        {
            key: planDuration + ' Amount',
            value: planAmount
        },
        {
            key: 'Discount Amount',
            value: appliedPromoCode?.discountValue ?? discountAmount
        },
        {
            key: 'Sub Total',
            value: planAmountAfterDiscount
        },
        {
            key: 'Final Amount',
            value: _finalAmount
        },
    ]

    return (
        <>
            <Text style={styles.headingText}>Plan Summary</Text>
            <View style={styles.card}>

                <View>
                    {
                        listItems.map(({ key, value }) => {
                            if (key === 'Discount Amount' && value <= 0) return;
                            return(
                                <View key={key} style={styles.itemRow}>
                                    <Text style={styles.itemText}>{key}</Text>
                                    <Text style={styles.itemText}>{currencySymbol} {formatAmount(value)}</Text>
                                </View>
                            )
                        })
                    }
                </View>
                { selectedCountry?.alpha3CountryCode === 'IND' && <Text style={styles.taxText}>Including Tax (18% GST)</Text>}

                <View style={styles.promoCodeWrapper}>
                    <TextInput
                        editable={!isPromoCodeApplied}
                        value={promoCode}
                        placeholder='Promo Code'
                        placeholderTextColor={theme.colors.secondary}
                        style={[styles.promoCodeInput, isPromoCodeApplied && styles.appliedPromoCode]}
                        onChangeText={(text) => setPromoCode(text)}
                    />
                    <TouchableOpacity
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        onPress={onApplyPromoCode}
                    >
                        <Text style={[styles.itemText, { color: theme.colors.solids.blue.darkest }]}>{isPromoCodeApplied ? 'Remove' : 'Apply' }</Text>
                    </TouchableOpacity>
                </View>

                <>{children}</>
            </View>
        </>
    )
}

const getStyles = (theme: ThemeProps) => StyleSheet.create({
    card: {
        justifyContent: 'space-around',
        borderColor: theme.colors.solids.grey.light,
        borderWidth: 1.4,
        borderRadius: 8,
        paddingVertical: 8,
        margin: 14,
        marginTop: 0
    },
    headingText: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.fontSize.large.size,
        color: theme.colors.text,
        marginLeft: 16,
        marginTop: 14,
        marginBottom: 10
    },
    planName: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.fontSize.xLarge.size,
        color: theme.colors.text,
        marginBottom: 18
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
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        paddingVertical: 12
    },
    taxText: {
        paddingRight: 14,
        alignSelf: 'flex-end'
    },
    promoCodeWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 12,
        paddingHorizontal: 14,
        borderWidth: 1.4,
        borderRadius: 8,
        borderColor: theme.colors.solids.grey.light
    },
    promoCodeInput: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.regular.size,
        color: theme.colors.text,
        flex: 1,
        height: 48
    },
    appliedPromoCode: { 
        color: theme.colors.solids.green.dark,
        fontFamily: theme.typography.fontFamily.extraBold
    }
})

// --------- Plan Summary Section Button ---------

type PlanSummarySectionButtonProps = {
    onPress: () => void;
    children: React.ReactNode;
    textStyle?: any;
    buttonBackgroundColor?: string;
    disabled?: boolean
};

const PlanSummarySectionButton: React.FC<PlanSummarySectionButtonProps> = ({ onPress, children, textStyle, buttonBackgroundColor, disabled = false }) => {
    const { theme, styles, voucherBackground } = useCustomTheme(getSectionButtonStyle, 'Payment');
    return (
        <TouchableOpacity
            disabled={disabled}
            activeOpacity={0.7}
            style={[styles.buttonWrapper, buttonBackgroundColor && !disabled ? { backgroundColor: buttonBackgroundColor } : null]}
            onPress={onPress}
        >
            <Text style={[styles.regularText, textStyle ? textStyle : null, disabled ? { color: theme.colors.secondary } : null ]}>{children}</Text>
            <View style={disabled ? styles.buttonDisabled : undefined} />
        </TouchableOpacity>
    )
}

const getSectionButtonStyle = (theme: ThemeProps) => StyleSheet.create({
    buttonWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 12,
        marginTop: 0,
        padding: 14,
        borderWidth: 1.4,
        borderRadius: 8,
        borderColor: theme.colors.solids.grey.light,
        overflow: 'hidden'
    },
    regularText: {
        fontFamily: theme.typography.fontFamily.semiBold,
        fontSize: theme.typography.fontSize.regular.size,
        color: theme.colors.text
    },
    buttonDisabled: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        overflow: 'hidden',
        backgroundColor: theme.colors.solids.grey.medium
    }
})

PlanSummarySection.Button = PlanSummarySectionButton;

export default PlanSummarySection;
