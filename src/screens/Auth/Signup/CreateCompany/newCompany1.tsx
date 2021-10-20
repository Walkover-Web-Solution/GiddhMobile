import React from 'react';
import { connect } from 'react-redux';

import { View, TouchableOpacity, ScrollView, ToastAndroid, Platform, Dimensions, Alert } from 'react-native';
import style from './style';
import { Text } from '@ui-kitten/components';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Foundation from 'react-native-vector-icons/Foundation';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { TextInput } from 'react-native-gesture-handler';
import Dropdown from 'react-native-modal-dropdown';
import colors from '@/utils/colors';
class NewCompany extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            companyName: '',
            companyNamePlaceholder: '',
            countryName: null,
            currency: null,
            mobileNumber: '',
            mobileNumberPlaceHolder: '',
            isMobileNoValid: false,
            countryData: [
                {
                    "alpha3CountryCode": "IND",
                    "alpha2CountryCode": "IN",
                    "countryName": "India",
                    "callingCode": "91",
                    "currency": {
                        "code": "INR",
                        "symbol": "₹"
                    },
                    "countryIndia": true
                },
                {
                    "alpha3CountryCode": "KWT",
                    "alpha2CountryCode": "KW",
                    "countryName": "Kuwait",
                    "callingCode": "965",
                    "currency": {
                        "code": "KWD",
                        "symbol": "د.ك"
                    },
                    "countryIndia": false
                },
                {
                    "alpha3CountryCode": "NPL",
                    "alpha2CountryCode": "NP",
                    "countryName": "Nepal",
                    "callingCode": "977",
                    "currency": {
                        "code": "NPR",
                        "symbol": "₨"
                    },
                    "countryIndia": false
                },
                {
                    "alpha3CountryCode": "OMN",
                    "alpha2CountryCode": "OM",
                    "countryName": "Oman",
                    "callingCode": "968",
                    "currency": {
                        "code": "OMR",
                        "symbol": "ر.ع."
                    },
                    "countryIndia": false
                },
                {
                    "alpha3CountryCode": "QAT",
                    "alpha2CountryCode": "QA",
                    "countryName": "Qatar",
                    "callingCode": "974",
                    "currency": {
                        "code": "QAR",
                        "symbol": "ر.ق"
                    },
                    "countryIndia": false
                },
                {
                    "alpha3CountryCode": "SAU",
                    "alpha2CountryCode": "SA",
                    "countryName": "Saudi Arabia",
                    "callingCode": "966",
                    "currency": {
                        "code": "SAR",
                        "symbol": "ر.س"
                    },
                    "countryIndia": false
                },
                {
                    "alpha3CountryCode": "AUS",
                    "alpha2CountryCode": "AU",
                    "countryName": "Australia",
                    "callingCode": "61",
                    "currency": {
                        "code": "AUD",
                        "symbol": "$"
                    },
                    "countryIndia": false
                },
                {
                    "alpha3CountryCode": "BHR",
                    "alpha2CountryCode": "BH",
                    "countryName": "Bahrain",
                    "callingCode": "973",
                    "currency": {
                        "code": "BHD",
                        "symbol": ".د.ب"
                    },
                    "countryIndia": false
                },
                {
                    "alpha3CountryCode": "GBR",
                    "alpha2CountryCode": "GB",
                    "countryName": "United Kingdom",
                    "callingCode": "44",
                    "currency": {
                        "code": "GBP",
                        "symbol": "£"
                    },
                    "countryIndia": false
                },
                {
                    "alpha3CountryCode": "ARE",
                    "alpha2CountryCode": "AE",
                    "countryName": "United Arab Emirates",
                    "callingCode": "971",
                    "currency": {
                        "code": "AED",
                        "symbol": "د.إ"
                    },
                    "countryIndia": false
                },
                {
                    "alpha3CountryCode": "USA",
                    "alpha2CountryCode": "US",
                    "countryName": "United States of America",
                    "callingCode": "1",
                    "currency": {
                        "code": "USD",
                        "symbol": "$"
                    },
                    "countryIndia": false
                }
            ],
            currencyData: [{ "code": "AMD", "symbol": "֏" }, { "code": "AZN", "symbol": "₼" }, { "code": "BAM", "symbol": "KM" }, { "code": "KZT", "symbol": "₸" }, { "code": "LTL", "symbol": "Lt" }, { "code": "LVL", "symbol": "Ls" }, { "code": "EEK", "symbol": "kr" }, { "code": "STD", "symbol": "Db" }, { "code": "SCR", "symbol": "SRe" }, { "code": "SLL", "symbol": "Le" }, { "code": "SBD", "symbol": "$" }, { "code": "SZL", "symbol": "L" }, { "code": "TJS", "symbol": "ЅМ" }, { "code": "FKP", "symbol": "£" }, { "code": "LAK", "symbol": "₭" }, { "code": "KPW", "symbol": "₩" }, { "code": "SHP", "symbol": "£" }, { "code": "XCD", "symbol": "$" }, { "code": "USD", "symbol": "$" }, { "code": "CAD", "symbol": "$" }, { "code": "EUR", "symbol": "€" }, { "code": "AED", "symbol": "د.إ" }, { "code": "AFN", "symbol": "؋" }, { "code": "ALL", "symbol": "L" }, { "code": "ARS", "symbol": "$" }, { "code": "AUD", "symbol": "$" }, { "code": "BDT", "symbol": "৳" }, { "code": "BGN", "symbol": "лв" }, { "code": "BHD", "symbol": ".د.ب" }, { "code": "BIF", "symbol": "Fr" }, { "code": "BND", "symbol": "$" }, { "code": "BOB", "symbol": "Bs." }, { "code": "BRL", "symbol": "R$" }, { "code": "BWP", "symbol": "P" }, { "code": "BYR", "symbol": "Br" }, { "code": "BZD", "symbol": "$" }, { "code": "CDF", "symbol": "Fr" }, { "code": "CHF", "symbol": "Fr" }, { "code": "CLP", "symbol": "$" }, { "code": "CNY", "symbol": "¥" }, { "code": "COP", "symbol": "$" }, { "code": "CRC", "symbol": "₡" }, { "code": "CVE", "symbol": "Esc" }, { "code": "CZK", "symbol": "Kč" }, { "code": "DJF", "symbol": "Fr" }, { "code": "DKK", "symbol": "kr" }, { "code": "DOP", "symbol": "$" }, { "code": "DZD", "symbol": "د.ج" }, { "code": "EGP", "symbol": "£" }, { "code": "SRD", "symbol": "$" }, { "code": "FJD", "symbol": "$" }, { "code": "XPF", "symbol": "₣" }, { "code": "GMD", "symbol": "D" }, { "code": "GIP", "symbol": "£" }, { "code": "GYD", "symbol": "$" }, { "code": "HTG", "symbol": "G" }, { "code": "KGS", "symbol": "Лв" }, { "code": "LSL", "symbol": "M" }, { "code": "LRD", "symbol": "$" }, { "code": "MWK", "symbol": "MK" }, { "code": "MVR", "symbol": ".ރ" }, { "code": "MRO", "symbol": "UM" }, { "code": "MNT", "symbol": "₮" }, { "code": "PGK", "symbol": "K" }, { "code": "WST", "symbol": "T" }, { "code": "AOA", "symbol": "Kz" }, { "code": "AWG", "symbol": "ƒ" }, { "code": "BSD", "symbol": "$" }, { "code": "BBD", "symbol": "$" }, { "code": "BYN", "symbol": "Br" }, { "code": "BMD", "symbol": "$" }, { "code": "BTN", "symbol": "Nu." }, { "code": "KYD", "symbol": "$" }, { "code": "CUC", "symbol": "$" }, { "code": "CUP", "symbol": "$" }, { "code": "TMT", "symbol": "m" }, { "code": "VUV", "symbol": "Vt" }, { "code": "ERN", "symbol": "Nfk" }, { "code": "ETB", "symbol": "Br" }, { "code": "GBP", "symbol": "£" }, { "code": "GEL", "symbol": "ლ" }, { "code": "GHS", "symbol": "₵" }, { "code": "GNF", "symbol": "Fr" }, { "code": "GTQ", "symbol": "Q" }, { "code": "HKD", "symbol": "$" }, { "code": "HNL", "symbol": "L" }, { "code": "HRK", "symbol": "kn" }, { "code": "HUF", "symbol": "Ft" }, { "code": "IDR", "symbol": "Rp" }, { "code": "ILS", "symbol": "₪" }, { "code": "INR", "symbol": "₹" }, { "code": "IQD", "symbol": "ع.د" }, { "code": "IRR", "symbol": "﷼" }, { "code": "ISK", "symbol": "kr" }, { "code": "JMD", "symbol": "$" }, { "code": "JOD", "symbol": "د.ا" }, { "code": "JPY", "symbol": "¥" }, { "code": "KES", "symbol": "Sh" }, { "code": "KHR", "symbol": "៛" }, { "code": "KMF", "symbol": "Fr" }, { "code": "KRW", "symbol": "₩" }, { "code": "KWD", "symbol": "د.ك" }, { "code": "LBP", "symbol": "ل.ل" }, { "code": "LKR", "symbol": "Rs" }, { "code": "LYD", "symbol": "ل.د" }, { "code": "MAD", "symbol": "د.م." }, { "code": "MDL", "symbol": "L" }, { "code": "MGA", "symbol": "Ar" }, { "code": "MKD", "symbol": "ден" }, { "code": "MMK", "symbol": "Ks" }, { "code": "MOP", "symbol": "P" }, { "code": "MUR", "symbol": "₨" }, { "code": "MXN", "symbol": "$" }, { "code": "MYR", "symbol": "RM" }, { "code": "MZN", "symbol": "MT" }, { "code": "NAD", "symbol": "$" }, { "code": "NGN", "symbol": "₦" }, { "code": "NIO", "symbol": "C$" }, { "code": "NOK", "symbol": "kr" }, { "code": "NPR", "symbol": "₨" }, { "code": "NZD", "symbol": "$" }, { "code": "OMR", "symbol": "ر.ع." }, { "code": "PAB", "symbol": "B/." }, { "code": "PEN", "symbol": "S/." }, { "code": "PHP", "symbol": "₱" }, { "code": "PKR", "symbol": "₨" }, { "code": "PLN", "symbol": "zł" }, { "code": "PYG", "symbol": "₲" }, { "code": "QAR", "symbol": "ر.ق" }, { "code": "RON", "symbol": "lei" }, { "code": "RSD", "symbol": "дин." }, { "code": "RUB", "symbol": "₽" }, { "code": "RWF", "symbol": "Fr" }, { "code": "SAR", "symbol": "ر.س" }, { "code": "SDG", "symbol": "ج.س." }, { "code": "SEK", "symbol": "kr" }, { "code": "SGD", "symbol": "$" }, { "code": "SOS", "symbol": "Sh" }, { "code": "SYP", "symbol": "£" }, { "code": "THB", "symbol": "฿" }, { "code": "TND", "symbol": "د.ت" }, { "code": "TOP", "symbol": "T$" }, { "code": "TTD", "symbol": "$" }, { "code": "TWD", "symbol": "$" }, { "code": "TZS", "symbol": "Sh" }, { "code": "UAH", "symbol": "₴" }, { "code": "UGX", "symbol": "Sh" }, { "code": "UYU", "symbol": "$" }, { "code": "VEF", "symbol": "Bs F" }, { "code": "VND", "symbol": "₫" }, { "code": "XAF", "symbol": "Fr" }, { "code": "XOF", "symbol": "Fr" }, { "code": "YER", "symbol": "﷼" }, { "code": "ZAR", "symbol": "Rs" }, { "code": "TRY", "symbol": "₺" }, { "code": "UZS", "symbol": "so'm" }, { "code": "ZMW", "symbol": "ZK" }],

        };
    }

    validateMobileNumberTextInput = (mobileNo: any) => {
        if (mobileNo == '') {
            return true
        }
        const pattern = new RegExp(/^[0-9\b]+$/);
        if (!pattern.test(mobileNo)) {
            return false;
        } else if (mobileNo.length != 10) {
            return false;
        }
        return true
    }

    componentDidMount() {

    }

    componentDidUpdate(prevProps) {

    }

    componentWillUnmount() {

    }

    validateDetails = () => {
        let isMobileNoValid = true
        const pattern = new RegExp(/^[0-9\b]+$/);
        if (!pattern.test(this.state.mobileNumber)) {
            isMobileNoValid = false
        } else if (this.state.mobileNumber.length != 10) {
            isMobileNoValid = false
        }
        if (this.state.companyName != "" && this.state.countryName != null && this.state.currency != null && isMobileNoValid) {
            return true
        }
        return false
    }



    render() {
        return (
            <SafeAreaView style={style.container}>
                <Text style={style.Heading}>Welcome Shubhendra!</Text>
                <Text style={style.text}>Enter the following deatils to start hassel free accounting with Giddh </Text>
                <View style={{ marginTop: 30, flexDirection: "row", borderBottomWidth: 0.5, borderColor: 'rgba(80,80,80,0.5)' }}>
                    <FontAwesome5 name="building" size={18} color={'#5773FF'} style={{ marginTop: 4 }} />
                    <TextInput
                        onBlur={() => {
                            if (this.state.companyName == '') {
                                this.setState({ companyNamePlaceholder: '' })
                            }
                        }}
                        onFocus={() => {
                            this.setState({ companyNamePlaceholder: 'a' })
                        }}
                        onChangeText={(text) => {
                            console.log(text)
                            this.setState({ companyName: text })
                        }
                        }
                        style={style.companyName}>
                        <Text style={{ color: this.state.companyNamePlaceholder == '' ? 'rgba(80,80,80,0.5)' : '#1c1c1c', fontFamily: 'AvenirLTStd-Book' }}>{this.state.companyNamePlaceholder == '' ? 'Company Name' : this.state.companyName}</Text>
                        <Text style={{ color: '#E04646', fontFamily: 'AvenirLTStd-Book' }}>{this.state.companyNamePlaceholder == '' ? '*' : ''}</Text>
                    </TextInput>
                </View>
                <View style={{ marginTop: 30, flexDirection: "row", }}>
                    <View style={{ width: "48%", flexDirection: "row", borderBottomWidth: 0.5, borderColor: 'rgba(80,80,80,0.5)' }}>
                        <Foundation name="flag" size={21} color={'#5773FF'} style={{ marginTop: 4 }} />
                        <Dropdown
                            style={{ flex: 1, marginLeft: 20 }}
                            textStyle={{ color: 'black', fontSize: 15, fontFamily: 'AvenirLTStd-Book' }}
                            options={this.state.countryData.length > 0 ? this.state.countryData : ["No results found"]}
                            renderSeparator={() => {
                                return (<View></View>);
                            }}
                            dropdownStyle={{ width: '40%', height: this.state.countryData.length > 0 ? 150 : 50, marginTop: 5, borderRadius: 5 }}
                            dropdownTextStyle={{ color: '#1C1C1C', fontFamily: 'AvenirLTStd-Book' }}
                            renderRow={(options) => {
                                return (
                                    <Text style={{ padding: 10, color: '#1C1C1C' }}>{options == "No results found" ? options : options.alpha3CountryCode}</Text>)
                            }}
                            onSelect={(index, value) => {
                                if (value != "No results found") {
                                    this.setState({ countryName: value, currency: value.currency })
                                }
                            }}>
                            <View style={{ flexDirection: "row" }}>
                                <Text style={{ color: this.state.countryName == null ? 'rgba(80,80,80,0.5)' : '#1c1c1c' }}>
                                    {this.state.countryName == null ? 'Country' : this.state.countryName.alpha3CountryCode}</Text>
                                <Text style={{ color: '#E04646' }}>{this.state.countryName == null ? '*' : ''}</Text>
                            </View>
                        </Dropdown>
                    </View>
                    <View style={{ width: 10 }} />
                    <View style={{ width: "48%", flexDirection: "row", borderBottomWidth: 0.5, borderColor: 'rgba(80,80,80,0.5)' }}>
                        <View style={{ backgroundColor: '#5773FF', width: 20, height: 20, borderRadius: 15, alignItems: "center", justifyContent: "center", marginTop: 3 }}>
                            <FontAwesome name={'dollar'} color="white" size={14} />
                        </View>
                        <Dropdown
                            style={{ flex: 1, marginLeft: 20 }}
                            textStyle={{ color: 'black', fontSize: 15, fontFamily: 'AvenirLTStd-Book' }}
                            options={this.state.currencyData.length > 0 ? this.state.currencyData : ["No results found"]}
                            renderSeparator={() => {
                                return (<View></View>);
                            }}
                            dropdownStyle={{ width: '40%', height: this.state.currencyData.length > 0 ? 150 : 50, marginTop: 5, borderRadius: 5 }}
                            dropdownTextStyle={{ color: '#1C1C1C', fontFamily: 'AvenirLTStd-Book' }}
                            renderRow={(options) => {
                                return (
                                    <Text style={{ padding: 10, color: '#1C1C1C' }}>{options == "No results found" ? options : options.code}</Text>)
                            }}
                            onSelect={(index, value) => {
                                if (value != "No results found") {
                                    this.setState({ currency: value })
                                }
                            }}>
                            <View style={{ flexDirection: "row" }}>
                                <Text style={{ color: this.state.currency == null ? 'rgba(80,80,80,0.5)' : '#1c1c1c' }}>
                                    {this.state.currency == null ? 'Currency' : this.state.currency.code}</Text>
                                <Text style={{ color: '#E04646' }}>{this.state.currency == null ? '*' : ''}</Text>
                            </View>
                        </Dropdown>
                    </View>
                </View>
                <View style={{ marginTop: 30, flexDirection: "row", borderBottomWidth: 0.5, borderColor: 'rgba(80,80,80,0.5)' }}>
                    <MaterialCommunityIcons name="phone-in-talk" size={17.5} color={'#5773FF'} style={{ marginTop: 4 }} />
                    <TextInput
                        keyboardType={'number-pad'}
                        returnKeyType={'done'}
                        onBlur={() => {
                            if (this.state.mobileNumber == '') {
                                this.setState({ mobileNumberPlaceHolder: '' })
                            }
                        }}
                        onFocus={() => {
                            this.setState({ mobileNumberPlaceHolder: 'a' })
                        }}
                        onChangeText={(text) => {
                            console.log(text)
                            this.setState({ mobileNumber: text, isMobileNoValid: !this.validateMobileNumberTextInput(text) })
                        }
                        }
                        style={style.companyName}>
                        <Text style={{ color: this.state.mobileNumberPlaceHolder == '' ? 'rgba(80,80,80,0.5)' : '#1c1c1c', fontFamily: 'AvenirLTStd-Book' }}>{this.state.mobileNumberPlaceHolder == '' ? 'Mobile Number' : this.state.mobileNumber}</Text>
                        <Text style={{ color: '#E04646', fontFamily: 'AvenirLTStd-Book' }}>{this.state.mobileNumberPlaceHolder == '' ? '*' : ''}</Text>
                    </TextInput>
                </View>
                {this.state.isMobileNoValid && <Text style={{ fontSize: 10, color: 'red', paddingLeft: 35 }}>Sorry! Invalid Number</Text>}
                <TouchableOpacity
                    style={{
                        height: Dimensions.get('screen').height * 0.06,
                        width: Dimensions.get('screen').width * 0.9,
                        borderRadius: 25,
                        backgroundColor: this.validateDetails() ? '#5773FF' : colors.PRIMARY_DISABLED,
                        justifyContent: 'center',
                        alignItems: 'center',
                        alignSelf: 'center',
                        position: "absolute",
                        bottom: 20
                    }}
                    onPress={() => {
                        if (this.validateDetails()) {
                            this.props.navigation.navigate("createCompanyDetails",{
                                companyName:this.state.companyName,
                                country :this.state.countryName,
                                currency:this.state.currency,
                                mobileNumber:this.state.mobileNumber
                            })
                        } else {
                            Alert.alert("Missing Fields", "Enter all the mandatory fields",
                                [{ text: "OK", onPress: () => { console.log("Alert cancelled") } }])
                        }
                    }}>
                    <Text style={{ color: '#fff', fontFamily: 'AvenirLTStd-Black' }}>Next</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
        // }
    }
}

const mapStateToProps = (state: RootState) => {
};

function mapDispatchToProps(dispatch) {
}

export default connect(mapStateToProps, mapDispatchToProps)(NewCompany);
