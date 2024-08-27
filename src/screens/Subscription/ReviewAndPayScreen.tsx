import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import useCustomTheme, { ThemeProps } from '@/utils/theme';
import { ScrollContainer } from '@/components/Container';
import Header from '@/components/Header';
import PlanSummarySection from './components/PlanSummarySection';
import { useNavigation } from '@react-navigation/native';
import useForm from './hooks/useForm';
import { useDispatch } from 'react-redux';
import { startTrial } from '@/redux/subscription/subscription.action';
import { NoActionLoader } from '@/components/Loader';
import { useSelector } from 'react-redux';

const ReviewAndPayScreen = () => {
    const navigation = useNavigation();
    const { theme, styles, statusBar } = useCustomTheme(getStyles);
    const { formData } = useForm();
    const isLoading = useSelector((state: any) => state.subscriptionReducer.isLoading);

    const dispatch = useDispatch();

    return (
        <>
            <NoActionLoader isLoading={isLoading}/>
            <Header
                header='Review and Pay'
                statusBarColor={statusBar}
                backgroundColor={theme.colors.vouchers.payment.background}
                isBackButtonVisible
            />
            <ScrollContainer>
                <Text style={styles.headingText}>Payment Details</Text>
                <View style={styles.card}>
                    <Text style={styles.mediumText}>Bill To:</Text>
                    { 
                        (['billingName', 'email', 'mobile', 'address'] as const).map((key) => formData?.[key] && (
                            <Text key={key} style={styles.regularText}>{key === 'mobile' ? formData?.[key]?.mobileNumber : formData?.[key]}</Text>
                        ))
                    }
                </View>

                <PlanSummarySection>
                    <PlanSummarySection.Button
                        onPress={() => dispatch(startTrial())}
                        textStyle={{ color: theme.colors.vouchers.payment.background, fontFamily: theme.typography.fontFamily.extraBold}}
                        buttonBackgroundColor={theme.colors.solids.blue.light}
                    >
                        Start Trial
                    </PlanSummarySection.Button>
                    <PlanSummarySection.Button
                        onPress={() => navigation.goBack()}
                    >
                        Back to Billing Account
                    </PlanSummarySection.Button>
                </PlanSummarySection>
            </ScrollContainer>
        </>
    )
}

export default ReviewAndPayScreen

const getStyles = (theme: ThemeProps) => StyleSheet.create({
    headingText: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.fontSize.large.size,
        color: theme.colors.text,
        padding: 16,
        paddingBottom: 8
    },
    mediumText: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.fontSize.regular.size,
        color: theme.colors.text,
        paddingBottom: 8
    },
    regularText: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.regular.size,
        color: theme.colors.text,
        paddingVertical: 1
    },
    card: {
        borderColor: theme.colors.solids.grey.light,
        borderWidth: 1.4,
        borderRadius: 8,
        marginHorizontal: 14,
        paddingHorizontal: 14,
        paddingVertical: 12
    }
})