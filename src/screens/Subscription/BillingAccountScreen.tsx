import { Dimensions, StyleSheet, Text, TouchableOpacity } from 'react-native'
import React, { useRef } from 'react'
import useCustomTheme, { ThemeProps } from '@/utils/theme';
import { Container, ScrollContainer } from '@/components/Container';
import Header from '@/components/Header';
import InputField from '@/components/InputField';
import PlanSummarySection from './components/PlanSummarySection';
import { useNavigation } from '@react-navigation/native';
import CountryPicker, { CountryCode, Flag } from 'react-native-country-picker-modal'
import OutlinedButton from '@/components/OutlinedButton';
import useGetCountriesStates from './hooks/useGetCountriesStates';
import useForm from './hooks/useForm';
import BottomSheet from '@/components/BottomSheet';
import { validateEmail, validateGST, validatePhoneNumber } from '@/utils/helper';

const { height } = Dimensions.get('window');

const BillingAccountScreen = () => {
    const navigation = useNavigation();
    const countryPickerBottomSheetRef = useRef<any>(null);
    const statePickerBottomSheetRef = useRef<any>(null);
    const { theme, styles, statusBar, voucherBackground } = useCustomTheme(getStyles, 'Payment');
    const {formData, setFormData} = useForm();
    const { allCountries, allStates, getCountryStates } = useGetCountriesStates();

    const isContinueToReviewDisabled = () => {
        return formData.billingName.trim().length === 0
        || formData.companyName.trim().length === 0
        || formData.country.name.trim().length === 0
        || formData.state.name.trim().length === 0
        || !validatePhoneNumber(formData.mobile.mobileNumber)
        || !validateEmail(formData.email)
    }
    
    return (
        <Container>
            <Header
                header='Select Billing Account'
                statusBarColor={statusBar}
                backgroundColor={voucherBackground}
                isBackButtonVisible
            />
            <ScrollContainer>
                    <Text style={styles.headingText}>Create a new billing account</Text>

                    <InputField
                        value={formData.billingName}
                        lable='Billing Name'
                        placeholder='Enter Billing Name'
                        containerStyle={styles.inputContainerStyle}
                        onChangeText={(text: string) => setFormData(text, 'billingName')}
                    />

                    <InputField
                        value={formData.companyName}
                        lable='Company Name'
                        placeholder='Enter Company Name'
                        containerStyle={styles.inputContainerStyle}
                        onChangeText={(text: string) => setFormData(text, 'companyName')}
                    />
                    <InputField
                        value={formData.email}
                        lable='Email'
                        placeholder='Enter Email'
                        customErrorMessage='Enter valid email address'
                        validate={validateEmail}
                        errorStyle={styles.errorStyle}
                        containerStyle={styles.inputContainerStyle}
                        onChangeText={(text: string) => setFormData(text, 'email')}
                    />
                    <InputField
                        value={formData.pinCode}
                        lable='Pincode'
                        placeholder='Enter Pincode'
                        keyboardType={'numeric'}
                        containerStyle={styles.inputContainerStyle}
                        onChangeText={(text: string) => setFormData(text, 'pinCode')}
                        isRequired={false}
                    />

                    <InputField
                        value={formData.mobile.mobileNumber}
                        lable='Mobile Number'
                        placeholder='Enter Mobile Number'
                        validate={validatePhoneNumber}
                        customErrorMessage='Enter valid mobile number'
                        errorStyle={styles.errorStyle}
                        leftIcon={
                            <CountryPicker
                                onSelect={(country) => {
                                    setFormData({
                                        mobleNumber: formData.mobile.mobileNumber,
                                        countryCode: country?.cca2,
                                        mobileCode: country?.callingCode
                                    }, 'mobile')
                                }}
                                countryCode={formData.mobile.countryCode as CountryCode}
                                withFilter
                                withFlag
                                withEmoji
                                containerButtonStyle={{ paddingTop: 6, paddingLeft: 6 }}
                                withCloseButton={false}
                                // @ts-ignore
                                flatListProps={{style: {paddingHorizontal: 15}}}
                                filterProps={{style: styles.pickerFilterStyle}}
                                theme={{
                                    backgroundColor: theme.colors.background,
                                    fontSize: theme.typography.fontSize.regular.size,
                                    fontFamily: theme.typography.fontFamily.regular,
                                    primaryColor: theme.colors.primary,
                                    onBackgroundTextColor: theme.colors.primary,
                                    filterPlaceholderTextColor: theme.colors.secondaryText,
                                }}
                            />
                        }
                        keyboardType={'numeric'}
                        containerStyle={styles.inputContainerStyle}
                        onChangeText={(text: string) => {
                            setFormData({
                                ...formData.mobile,
                                mobileNumber: text,
                            }, 'mobile')
                        }}
                        isRequired
                    />

                    <OutlinedButton
                        value={formData.country.name}
                        lable='Country'
                        onPress={() => countryPickerBottomSheetRef?.current?.open()}
                        containerStyle={styles.inputContainerStyle}
                        outlineStyle={styles.outlineStyle}
                        isRequired
                    />

                    <OutlinedButton
                        disabled={!!!formData.country.name || (formData.country.name == 'India' && formData.taxNumber.length > 0 && validateGST(formData.taxNumber)?.isValid)}
                        value={formData.state.name}
                        lable='State'
                        onPress={() => statePickerBottomSheetRef?.current?.open()}
                        containerStyle={styles.inputContainerStyle}
                        outlineStyle={styles.outlineStyle}
                        isRequired
                    />

                    <InputField
                        value={formData.taxNumber}
                        lable={formData.country.name !== 'India' ? 'Tax Number' : 'GSTIN'}
                        placeholder={`Enter ${formData.country.name !== 'India' ? 'Tax Number' : 'GSTIN'}`}
                        containerStyle={styles.inputContainerStyle}
                        onChangeText={(text: string) => {
                            setFormData(text, 'taxNumber');
                            if ( formData.country.name === 'India' && text.length > 0 ) {
                                const { isValid, stateCode } = validateGST(text);
                                if ( isValid && formData.state.stateGstCode !== stateCode ) {
                                    setFormData(allStates.find((state: any) => state.stateGstCode === stateCode), 'state');
                                }
                            }
                        }}
                        isRequired={false}
                        {...(formData.country.name === 'India' && {
                            validate: (text) => text === '' ? true : validateGST(text)?.isValid,
                            customErrorMessage: 'Invalid GST Number',
                            errorStyle: styles.errorStyle
                        })}
                    />

                    <InputField
                        value={formData.address}
                        lable='Address'
                        placeholder='Enter Address'
                        containerStyle={styles.inputContainerStyle}
                        onChangeText={(text: string) => setFormData(text, 'address')}
                        isRequired={false}
                    />

                <PlanSummarySection>
                    <PlanSummarySection.Button
                        onPress={() => navigation.navigate('ReviewAndPayScreen')}
                        textStyle={{ color: theme.colors.vouchers.payment.background, fontFamily: theme.typography.fontFamily.extraBold}}
                        buttonBackgroundColor={theme.colors.solids.blue.light}
                        disabled={isContinueToReviewDisabled()}
                    >
                        Continue to Review
                    </PlanSummarySection.Button>
                    <PlanSummarySection.Button
                        onPress={() => navigation.goBack()}
                    >
                        Back to Plan
                    </PlanSummarySection.Button>
                </PlanSummarySection>
            </ScrollContainer>

            <BottomSheet
                bottomSheetRef={countryPickerBottomSheetRef}
                modalHeight={height * 0.9}
                headerText='Select Country'
                headerTextColor={theme.colors.vouchers.payment.background}
                adjustToContentHeight={false}
                flatListProps={{
                    data: allCountries,
                    renderItem: ({ item }) => (
                        <ListItem
                            isCountrySelector
                            code={item?.alpha2CountryCode}
                            name={item?.countryName}
                            buttonStyle={styles.listButton}
                            textStyle={styles.regularText}
                            onPress={() => {
                                countryPickerBottomSheetRef?.current?.close()
                                setFormData({name: item.countryName, code: item?.alpha2CountryCode}, 'country');
                                setFormData({ code: '', name: ''}, 'state');
                                getCountryStates(item?.alpha2CountryCode);
                            }}
                        />
                    )
                }}
            />

            <BottomSheet
                bottomSheetRef={statePickerBottomSheetRef}
                modalHeight={height * 0.9}
                headerText='Select State'
                headerTextColor={theme.colors.vouchers.payment.background}
                adjustToContentHeight={false}
                flatListProps={{
                    data: allStates,
                    renderItem: ({ item }) => {
                        console.log(item)
                        return (
                        <ListItem
                            code={item?.code}
                            name={item?.name}
                            buttonStyle={styles.listButton}
                            textStyle={styles.regularText}
                            onPress={() => {
                                statePickerBottomSheetRef?.current?.close()
                                setFormData({name: item?.name, code: item?.code, stateGstCode: item?.stateGstCode }, 'state');
                            }}
                        />
                    )}
                }}
            />
        </Container>
    )
}

const ListItem = ({ code, name, isCountrySelector = false, onPress, buttonStyle, textStyle } : { code: CountryCode, name: string, isCountrySelector?: boolean, onPress: any, buttonStyle: any, textStyle: any }) => (
    <TouchableOpacity
        activeOpacity={0.7}
        style={buttonStyle}
        onPress={onPress}
    >
        { isCountrySelector &&
            <Flag
                countryCode={code}
                flagSize={16}
            />
        }
        <Text style={textStyle}>{code} - {name}</Text>
    </TouchableOpacity>
)

export default BillingAccountScreen

const getStyles = (theme: ThemeProps) => StyleSheet.create({
    headingText: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.fontSize.large.size,
        color: theme.colors.text,
        padding: 16,
        paddingBottom: 0
    },
    regularText: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.regular.size,
        color: theme.colors.text
    },
    inputContainerStyle: {
        marginHorizontal: 14,
        marginVertical: 4
    },
    errorStyle: {
        marginLeft: 15,
        left: 15,
        bottom: 5
    },
    mobileInput: {
        flex: 1,
        height: 50,
        paddingHorizontal: 15,
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.regular.size,
        color: theme.colors.text,
    },
    mobileInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.solids.grey.light
    },
    pickerFilterStyle: {
        flex: 1,
        height: 50,
        margin: 5, 
        paddingHorizontal: 20,
        borderRadius: 50, 
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.regular.size,
        lineHeight: theme.typography.fontSize.regular.lineHeight,
        backgroundColor: theme.colors.lightPalette, 
    },
    outlineStyle: {
        borderWidth: 1.4
    },
    listButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center'
    }
})