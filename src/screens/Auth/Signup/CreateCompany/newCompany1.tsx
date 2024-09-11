import React, { createRef } from 'react';
import { connect } from 'react-redux';

import { View, TouchableOpacity, StatusBar, ScrollView, Platform, Dimensions, Alert, FlatList } from 'react-native';
import style from './style';
import { Text } from '@ui-kitten/components';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Fontisto from 'react-native-vector-icons/Fontisto';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Foundation from 'react-native-vector-icons/Foundation';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { TextInput } from 'react-native-gesture-handler';
import Dropdown from 'react-native-modal-dropdown';
import colors from '@/utils/colors';
import { STORAGE_KEYS } from '@/utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as CommonActions from '@/redux/CommonAction';
import { Flag } from 'react-native-country-picker-modal'
import Modal from 'react-native-modal';
import { getRegionCodeForCountryCode } from '@/core/services/storage/storage.service';
import Icon from '@/core/components/custom-icon/custom-icon';
import { CompanyService } from '@/core/services/company/company.service';
import BottomSheet from '@/components/BottomSheet';

const { height } = Dimensions.get('window');

var PhoneNumber = require('awesome-phonenumber');
class NewCompany extends React.Component<any, any> {
    private countryPickerBottomSheetRef: React.Ref<null>;
    constructor(props: any) {
        super(props);
        this.countryPickerBottomSheetRef = createRef();
        this.state = {
            userName: "",
            companyName: '',
            companyNamePlaceholder: '',
            countryName: {
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
            currency: {
                "code": "INR",
                "symbol": "₹"
            },
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
            filteredCurrencyData: [{ "code": "AMD", "symbol": "֏" }, { "code": "AZN", "symbol": "₼" }, { "code": "BAM", "symbol": "KM" }, { "code": "KZT", "symbol": "₸" }, { "code": "LTL", "symbol": "Lt" }, { "code": "LVL", "symbol": "Ls" }, { "code": "EEK", "symbol": "kr" }, { "code": "STD", "symbol": "Db" }, { "code": "SCR", "symbol": "SRe" }, { "code": "SLL", "symbol": "Le" }, { "code": "SBD", "symbol": "$" }, { "code": "SZL", "symbol": "L" }, { "code": "TJS", "symbol": "ЅМ" }, { "code": "FKP", "symbol": "£" }, { "code": "LAK", "symbol": "₭" }, { "code": "KPW", "symbol": "₩" }, { "code": "SHP", "symbol": "£" }, { "code": "XCD", "symbol": "$" }, { "code": "USD", "symbol": "$" }, { "code": "CAD", "symbol": "$" }, { "code": "EUR", "symbol": "€" }, { "code": "AED", "symbol": "د.إ" }, { "code": "AFN", "symbol": "؋" }, { "code": "ALL", "symbol": "L" }, { "code": "ARS", "symbol": "$" }, { "code": "AUD", "symbol": "$" }, { "code": "BDT", "symbol": "৳" }, { "code": "BGN", "symbol": "лв" }, { "code": "BHD", "symbol": ".د.ب" }, { "code": "BIF", "symbol": "Fr" }, { "code": "BND", "symbol": "$" }, { "code": "BOB", "symbol": "Bs." }, { "code": "BRL", "symbol": "R$" }, { "code": "BWP", "symbol": "P" }, { "code": "BYR", "symbol": "Br" }, { "code": "BZD", "symbol": "$" }, { "code": "CDF", "symbol": "Fr" }, { "code": "CHF", "symbol": "Fr" }, { "code": "CLP", "symbol": "$" }, { "code": "CNY", "symbol": "¥" }, { "code": "COP", "symbol": "$" }, { "code": "CRC", "symbol": "₡" }, { "code": "CVE", "symbol": "Esc" }, { "code": "CZK", "symbol": "Kč" }, { "code": "DJF", "symbol": "Fr" }, { "code": "DKK", "symbol": "kr" }, { "code": "DOP", "symbol": "$" }, { "code": "DZD", "symbol": "د.ج" }, { "code": "EGP", "symbol": "£" }, { "code": "SRD", "symbol": "$" }, { "code": "FJD", "symbol": "$" }, { "code": "XPF", "symbol": "₣" }, { "code": "GMD", "symbol": "D" }, { "code": "GIP", "symbol": "£" }, { "code": "GYD", "symbol": "$" }, { "code": "HTG", "symbol": "G" }, { "code": "KGS", "symbol": "Лв" }, { "code": "LSL", "symbol": "M" }, { "code": "LRD", "symbol": "$" }, { "code": "MWK", "symbol": "MK" }, { "code": "MVR", "symbol": ".ރ" }, { "code": "MRO", "symbol": "UM" }, { "code": "MNT", "symbol": "₮" }, { "code": "PGK", "symbol": "K" }, { "code": "WST", "symbol": "T" }, { "code": "AOA", "symbol": "Kz" }, { "code": "AWG", "symbol": "ƒ" }, { "code": "BSD", "symbol": "$" }, { "code": "BBD", "symbol": "$" }, { "code": "BYN", "symbol": "Br" }, { "code": "BMD", "symbol": "$" }, { "code": "BTN", "symbol": "Nu." }, { "code": "KYD", "symbol": "$" }, { "code": "CUC", "symbol": "$" }, { "code": "CUP", "symbol": "$" }, { "code": "TMT", "symbol": "m" }, { "code": "VUV", "symbol": "Vt" }, { "code": "ERN", "symbol": "Nfk" }, { "code": "ETB", "symbol": "Br" }, { "code": "GBP", "symbol": "£" }, { "code": "GEL", "symbol": "ლ" }, { "code": "GHS", "symbol": "₵" }, { "code": "GNF", "symbol": "Fr" }, { "code": "GTQ", "symbol": "Q" }, { "code": "HKD", "symbol": "$" }, { "code": "HNL", "symbol": "L" }, { "code": "HRK", "symbol": "kn" }, { "code": "HUF", "symbol": "Ft" }, { "code": "IDR", "symbol": "Rp" }, { "code": "ILS", "symbol": "₪" }, { "code": "INR", "symbol": "₹" }, { "code": "IQD", "symbol": "ع.د" }, { "code": "IRR", "symbol": "﷼" }, { "code": "ISK", "symbol": "kr" }, { "code": "JMD", "symbol": "$" }, { "code": "JOD", "symbol": "د.ا" }, { "code": "JPY", "symbol": "¥" }, { "code": "KES", "symbol": "Sh" }, { "code": "KHR", "symbol": "៛" }, { "code": "KMF", "symbol": "Fr" }, { "code": "KRW", "symbol": "₩" }, { "code": "KWD", "symbol": "د.ك" }, { "code": "LBP", "symbol": "ل.ل" }, { "code": "LKR", "symbol": "Rs" }, { "code": "LYD", "symbol": "ل.د" }, { "code": "MAD", "symbol": "د.م." }, { "code": "MDL", "symbol": "L" }, { "code": "MGA", "symbol": "Ar" }, { "code": "MKD", "symbol": "ден" }, { "code": "MMK", "symbol": "Ks" }, { "code": "MOP", "symbol": "P" }, { "code": "MUR", "symbol": "₨" }, { "code": "MXN", "symbol": "$" }, { "code": "MYR", "symbol": "RM" }, { "code": "MZN", "symbol": "MT" }, { "code": "NAD", "symbol": "$" }, { "code": "NGN", "symbol": "₦" }, { "code": "NIO", "symbol": "C$" }, { "code": "NOK", "symbol": "kr" }, { "code": "NPR", "symbol": "₨" }, { "code": "NZD", "symbol": "$" }, { "code": "OMR", "symbol": "ر.ع." }, { "code": "PAB", "symbol": "B/." }, { "code": "PEN", "symbol": "S/." }, { "code": "PHP", "symbol": "₱" }, { "code": "PKR", "symbol": "₨" }, { "code": "PLN", "symbol": "zł" }, { "code": "PYG", "symbol": "₲" }, { "code": "QAR", "symbol": "ر.ق" }, { "code": "RON", "symbol": "lei" }, { "code": "RSD", "symbol": "дин." }, { "code": "RUB", "symbol": "₽" }, { "code": "RWF", "symbol": "Fr" }, { "code": "SAR", "symbol": "ر.س" }, { "code": "SDG", "symbol": "ج.س." }, { "code": "SEK", "symbol": "kr" }, { "code": "SGD", "symbol": "$" }, { "code": "SOS", "symbol": "Sh" }, { "code": "SYP", "symbol": "£" }, { "code": "THB", "symbol": "฿" }, { "code": "TND", "symbol": "د.ت" }, { "code": "TOP", "symbol": "T$" }, { "code": "TTD", "symbol": "$" }, { "code": "TWD", "symbol": "$" }, { "code": "TZS", "symbol": "Sh" }, { "code": "UAH", "symbol": "₴" }, { "code": "UGX", "symbol": "Sh" }, { "code": "UYU", "symbol": "$" }, { "code": "VEF", "symbol": "Bs F" }, { "code": "VND", "symbol": "₫" }, { "code": "XAF", "symbol": "Fr" }, { "code": "XOF", "symbol": "Fr" }, { "code": "YER", "symbol": "﷼" }, { "code": "ZAR", "symbol": "Rs" }, { "code": "TRY", "symbol": "₺" }, { "code": "UZS", "symbol": "so'm" }, { "code": "ZMW", "symbol": "ZK" }],
            allCallingCode: ["590", "591", "350", "592", "230", "351", "593", "352", "231", "353", "595", "232", "354", "233", "234", "355", "597", "356", "235", "598", "236", "357", "237", "358", "359", "238", "239", "1473", "240", "241", "242", "1", "243", "244", "245", "246", "1345", "248", "249", "7", "20", "27", "1242", "370", "371", "250", "372", "251", "252", "373", "374", "253", "254", "375", "376", "255", "377", "256", "378", "257", "258", "379", "30", "31", "32", "33", "34", "36", "39", "1809", "380", "381", "260", "261", "382", "262", "263", "264", "385", "386", "265", "387", "266", "267", "1246", "389", "268", "269", "40", "41", "43", "44", "45", "46", "47", "48", "49", "1264", "51", "52", "53", "54", "55", "56", "57", "58", "960", "961", "1268", "962", "963", "964", "965", "966", "60", "967", "968", "61", "62", "63", "4779", "64", "65", "66", "290", "291", "1284", "297", "298", "299", "850", "971", "972", "852", "973", "974", "853", "975", "855", "976", "977", "856", "76", "500", "501", "502", "503", "504", "81", "505", "82", "506", "507", "84", "508", "86", "509", "992", "993", "994", "995", "996", "90", "91", "998", "92", "93", "94", "95", "98", "880", "886", "1869", "1868", "1 340", "1876", "1758", "1767", "420", "421", "423", "1649", "670", "672", "673", "674", "675", "676", "677", "678", "679", "1671", "1670", "680", "681", "682", "683", "1787", "685", "686", "1664", "1784", "687", "688", "689", "690", "691", "692", "212", "213", "216", "218", "220", "221", "222", "223", "224", "225", "1684", "226", "227", "1441", "228", "229"],
            filteredCallingCode: ["590", "591", "350", "592", "230", "351", "593", "352", "231", "353", "595", "232", "354", "233", "234", "355", "597", "356", "235", "598", "236", "357", "237", "358", "359", "238", "239", "1473", "240", "241", "242", "1", "243", "244", "245", "246", "1345", "248", "249", "7", "20", "27", "1242", "370", "371", "250", "372", "251", "252", "373", "374", "253", "254", "375", "376", "255", "377", "256", "378", "257", "258", "379", "30", "31", "32", "33", "34", "36", "39", "1809", "380", "381", "260", "261", "382", "262", "263", "264", "385", "386", "265", "387", "266", "267", "1246", "389", "268", "269", "40", "41", "43", "44", "45", "46", "47", "48", "49", "1264", "51", "52", "53", "54", "55", "56", "57", "58", "960", "961", "1268", "962", "963", "964", "965", "966", "60", "967", "968", "61", "62", "63", "4779", "64", "65", "66", "290", "291", "1284", "297", "298", "299", "850", "971", "972", "852", "973", "974", "853", "975", "855", "976", "977", "856", "76", "500", "501", "502", "503", "504", "81", "505", "82", "506", "507", "84", "508", "86", "509", "992", "993", "994", "995", "996", "90", "91", "998", "92", "93", "94", "95", "98", "880", "886", "1869", "1868", "1 340", "1876", "1758", "1767", "420", "421", "423", "1649", "670", "672", "673", "674", "675", "676", "677", "678", "679", "1671", "1670", "680", "681", "682", "683", "1787", "685", "686", "1664", "1784", "687", "688", "689", "690", "691", "692", "212", "213", "216", "218", "220", "221", "222", "223", "224", "225", "1684", "226", "227", "1441", "228", "229"],
            selectedCallingCode: "91",
            isMobileModalVisible: false,
            isCurrencyModalVisible: false,
            companyList: [],
            newCompany2ScreenData: {
                    selectedState: null,
                    stateData: [],
                    filteredStates: [],
                    bussinessType: null,
                    gstNumber: null,
                    Address: null,
                    stateName: null,
                    applicableTaxData: [],
                    applicableTax: [],
                    stateDropDown: Dropdown,
                    gstNumberWrong: false,
                    bussinessNature: null,
                    pinCode: null,
            }
        };
    }

    validateMobileNumberTextInput = (mobileNo: any) => {
        if (mobileNo == '') {
            return true
        }
        var PhoneNumber = require('awesome-phonenumber');
        //alert(PhoneNumber.getExample( 'SA', 'mobile' ).getNumber())
        var getRegionCode = getRegionCodeForCountryCode(this.state.selectedCallingCode);
        var pn = new PhoneNumber(mobileNo, getRegionCode);
        return pn.isValid()
    }

    getCountryList = async () => {
        try {
            const response =  await CompanyService.createCompanyCountryList(this.props.subscriptionData?.subscriptionId ?? 'SUB-20240816-2');
            if (response.status === 200) {
                this.setState({ countryList: response.data.body })
            }
        }
        catch (error) {
            console.error('----- Error in CreateCompanyCountryList -----', error?.data?.message);
        }
    }

    componentDidMount() {
        const getuserName = async () => {
            var userName = await AsyncStorage.getItem(STORAGE_KEYS.userName)
            await this.setState({ userName })
        }

        getuserName();
        this.getCountryList();
    }

    componentDidUpdate(prevProps) {

    }

    componentWillUnmount() {

    }

    handlePersistData = (payload: any) => {
        this.setState({
            newCompany2ScreenData: {
                selectedState: payload.selectedState,
                stateData: payload.stateData,
                filteredStates: payload.filteredStates,
                bussinessType: payload.bussinessType,
                gstNumber: payload.gstNumber,
                Address: payload.Address,
                stateName: payload.stateName,
                applicableTaxData: payload.applicableTaxData,
                applicableTax: payload.applicableTax,
                stateDropDown: payload.stateDropDown,
                gstNumberWrong: payload.gstNumberWrong,
                bussinessNature: payload.bussinessNature,
                pinCode: payload.pinCode,
            }
    });
    }

    validateDetails = () => {
        if (this.state.companyName != "" && this.state.countryName != null && this.state.currency != null && this.state.mobileNumber != null && this.state.mobileNumber != '') {
            return true
        }
        return false
    }

    onSelect = async (country: any) => {
        this.setState({
            countryName: country,
            currency: country?.currency,
            selectedCallingCode: country?.callingCode
        })
    }


    getMobilePlaceHolder = () => {
        var regionCode = getRegionCodeForCountryCode(this.state.selectedCallingCode)
        let placeholder = regionCode != null ? PhoneNumber.getExample(regionCode, 'mobile').getNumber('significant') : "Enter Contact number"
        return placeholder
    }

    searchCallingCode = (text: string) => {
        if (text == '') {
            this.setState({
                filteredCallingCode: this.state.allCallingCode,
            })
            return
        }
        let filteredCallingCode: any[] = [];
        for (let i = 0; i < this.state.allCallingCode.length; i++) {
            if (this.state.allCallingCode[i].includes(text)) {
                filteredCallingCode.push(this.state.allCallingCode[i]);
            }
        }
        this.setState({ filteredCallingCode })
    };

    searchCurrency = (text: string) => {
        if (text == '') {
            this.setState({
                filteredCurrencyData: this.state.currencyData,
            })
            return
        }
        let filteredCurrencyData: any[] = [];
        for (let i = 0; i < this.state.filteredCurrencyData.length; i++) {
            if (this.state.filteredCurrencyData[i].code.toLowerCase().includes(text.toLowerCase())) {
                filteredCurrencyData.push(this.state.filteredCurrencyData[i]);
            }
        }
        this.setState({ filteredCurrencyData })
    };

    renderItem(callingCode: any) {
        return (
            <TouchableOpacity style={{ paddingVertical: 15 }}
                onPress={async () => {
                    await this.setState({ isMobileModalVisible: false, selectedCallingCode: callingCode })
                    await this.setState({ isMobileNoValid: !this.validateMobileNumberTextInput(this.state.mobileNumber) })
                }}>
                <Text style={{ fontSize: 15, fontFamily: 'AvenirLTStd-Book', color: '#1c1c1c' }}>{callingCode}</Text>
            </TouchableOpacity>
        );
    }

    renderCurrencyItem(Currency: any) {
        return (
            <TouchableOpacity style={{ paddingVertical: 15, flexDirection: "row", justifyContent: "space-between", }}
                onPress={() => {
                    this.setState({ currency: Currency, isCurrencyModalVisible: false })
                }}>
                <Text style={{ fontSize: 15, fontFamily: 'AvenirLTStd-Book', color: '#1c1c1c' }}>{Currency.code}</Text>
                <Text style={{ fontSize: 15, fontFamily: 'AvenirLTStd-Book', color: '#1c1c1c' }}>{Currency.symbol}</Text>
            </TouchableOpacity>
        );
    }

    renderModalView = () => {
        return (
            <Modal isVisible={this.state.isMobileModalVisible} onBackdropPress={() => { this.setState({ isMobileModalVisible: !this.state.isMobileModalVisible }) }}
                onBackButtonPress={() => { this.setState({ isMobileModalVisible: !this.state.isMobileModalVisible }) }}
                style={style.modalMobileContainer}>
                <SafeAreaView style={style.modalViewContainer}>
                    <View style={style.cancelButtonModal} >
                        <TextInput
                            placeholderTextColor={'rgba(80,80,80,0.5)'}
                            placeholder="Enter Calling Code"
                            keyboardType={'number-pad'}
                            returnKeyType={"done"}
                            style={{ height: 50, borderRadius: 5, width: "80%", fontSize: 15, fontFamily: 'AvenirLTStd-Book', color: '#1c1c1c' }}
                            onChangeText={(text) => {
                                this.searchCallingCode(text);
                            }}
                        />
                        <TouchableOpacity onPress={() => { this.setState({ isMobileModalVisible: false }) }} style={style.cancelButtonTextModal}>
                            <Fontisto name="close-a" size={Platform.OS == "ios" ? 10 : 18} color={'black'} style={{ marginTop: 4 }} />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        contentContainerStyle={{paddingHorizontal: 15}}
                        scrollEnabled
                        data={this.state.filteredCallingCode}
                        renderItem={({ item }) => this.renderItem(item)}
                        keyExtractor={(item, index) => index.toString()}
                        ItemSeparatorComponent={()=> <View style={style.borderInModal}/>}
                    />
                </SafeAreaView>
            </Modal>
        )
    }

    renderCurrencyModalView = () => {
        return (
            <Modal isVisible={this.state.isCurrencyModalVisible} onBackdropPress={() => { this.setState({ isCurrencyModalVisible: !this.state.isCurrencyModalVisible }) }}
                onBackButtonPress={() => { this.setState({ isCurrencyModalVisible: !this.state.isCurrencyModalVisible }) }}
                style={style.modalMobileContainer}>
                <SafeAreaView style={style.modalViewContainer}>
                    <View style={style.cancelButtonModal} >
                        <TextInput
                            returnKeyType={"done"}
                            placeholderTextColor={'rgba(80,80,80,0.5)'}
                            placeholder="Enter Currency e.g. INR"
                            style={{ height: 50, borderRadius: 5, width: "80%", fontSize: 15, fontFamily: 'AvenirLTStd-Book', color: '#1c1c1c' }}
                            onChangeText={(text) => {
                                this.searchCurrency(text);
                            }}
                        />
                        <TouchableOpacity onPress={() => { this.setState({ isCurrencyModalVisible: false }) }} style={style.cancelButtonTextModal}>
                            <Fontisto name="close-a" size={Platform.OS == "ios" ? 10 : 18} color={'black'} style={{ marginTop: 4 }} />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        scrollEnabled
                        contentContainerStyle={{paddingHorizontal: 15}}
                        data={this.state.filteredCurrencyData}
                        renderItem={({ item }) => this.renderCurrencyItem(item)}
                        keyExtractor={(item, index) => index.toString()}
                        ItemSeparatorComponent={()=> <View style={style.borderInModal}/>}
                    />
                </SafeAreaView>
            </Modal>
        )
    }

    render() {
        return (
            <SafeAreaView style={style.container}>
                <ScrollView style={{ flex: 1 }}>
                    <StatusBar backgroundColor="#1A237E" barStyle={Platform.OS == "ios" ? "dark-content" : "light-content"} />
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}>
                        {this.props.route.params ?   
                            <TouchableOpacity 
                                hitSlop={{right: 20, left: 20, top: 10, bottom: 10}}
                                style={{ marginRight: 10 }}
                                onPress={() => {
                                    this.props.navigation.goBack();
                                }}
                            >
                                <Icon size={20} name={'Backward-arrow'}/>
                            </TouchableOpacity> 
                        : null}
                        <Text style={[style.Heading, { marginHorizontal: this.props.route.params ? 10 : 0 }]}>{"Welcome " + this.state.userName + ","}</Text>
                    </View>
                    <Text style={[style.text, { marginLeft: this.props.route.params ? 40 : 0 }]}>Enter the following details to start hassel free accounting with Giddh </Text>
                    <View style={{ marginTop: 30, flexDirection: "row", borderBottomWidth: 0.5, borderColor: 'rgba(80,80,80,0.5)' }}>
                        <FontAwesome5 name="building" size={18} color={'#5773FF'} style={{ marginTop: 4, paddingBottom: 3 }} />
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
                                this.setState({ companyName: text })
                            }
                            }
                            style={style.companyName}>
                            <Text style={{ color: this.state.companyNamePlaceholder == '' ? 'rgba(80,80,80,0.5)' : '#1c1c1c', fontFamily: 'AvenirLTStd-Book' }}>{this.state.companyNamePlaceholder == '' ? 'Company Name' : this.state.companyName}</Text>
                            <Text style={{ color: '#E04646', fontFamily: 'AvenirLTStd-Book' }}>{this.state.companyNamePlaceholder == '' ? '*' : ''}</Text>
                        </TextInput>
                    </View>
                    <View style={{ marginTop: 30, flexDirection: "row", }}>
                        <View style={{ width: "67%", flexDirection: "row", borderBottomWidth: 0.5, borderColor: 'rgba(80,80,80,0.5)' }}>
                            <Foundation name="flag" size={21} color={'#5773FF'} style={{ marginTop: 4 }} />
                            <View style={{ flex: 1, marginLeft: 15, marginTop: Platform.OS == "ios" ? 4 : 1 }}>
                                <TouchableOpacity
                                    onPress={() => this.countryPickerBottomSheetRef?.current?.open()}
                                    style={{ flexDirection: 'row', alignItems: 'center'}}
                                >
                                    <Flag
                                        countryCode={this.state.countryName.alpha2CountryCode}
                                        flagSize={16}
                                    />
                                    <Text style={style.regularText}>{this.state.countryName?.countryName}</Text>
                                </TouchableOpacity>
                            </View>
                            {/* <Dropdown
                                style={{ flex: 1, marginLeft: 20, marginTop: Platform.OS == "ios" ? 4 : 1 }}
                                textStyle={{ color: 'black', fontSize: 15, fontFamily: 'AvenirLTStd-Book' }}
                                options={this.state.countryData}
                                renderSeparator={() => {
                                    return (<View></View>);
                                }}
                                dropdownStyle={{ width: '40%', height: this.state.countryData.length > 0 ? 150 : 50, marginTop: 5, borderRadius: 5, marginLeft: -20 }}
                                dropdownTextStyle={{ color: '#1C1C1C', fontFamily: 'AvenirLTStd-Book' }}
                                renderRow={(options) => {
                                    return (
                                        <Text style={{ padding: 10, color: '#1C1C1C' }}>{(options.alpha3CountryCode + " - " + options.countryName)}</Text>)
                                }}
                                onSelect={async (index, value) => {
                                    await this.setState({
                                        countryName: value, currency: value.currency,
                                        selectedCallingCode: value.callingCode
                                    })
                                    await this.setState({ isMobileNoValid: !this.validateMobileNumberTextInput(this.state.mobileNumber) })
                                }}>
                                <View style={{ flexDirection: "row" }}>
                                    <Text style={{ color: this.state.countryName == null ? 'rgba(80,80,80,0.5)' : '#1c1c1c' }}>
                                        {this.state.countryName == null ? 'Country' : (this.state.countryName.alpha3CountryCode + " - " + this.state.countryName.countryName)}</Text>
                                    <Text style={{ color: '#E04646' }}>{this.state.countryName == null ? '*' : ''}</Text>
                                </View>
                            </Dropdown> */}
                        </View>
                        <View style={{ width: 10 }} />
                        <View style={{ width: "30%", flexDirection: "row", borderBottomWidth: 0.5, borderColor: 'rgba(80,80,80,0.5)' }}>
                            <View style={{ backgroundColor: '#5773FF', width: 20, height: 20, borderRadius: 15, alignItems: "center", justifyContent: "center", marginTop: 3 }}>
                                {/* <FontAwesome name={'dollar'} color="white" size={14} /> */}
                                <Text style={{ color: 'white', fontFamily: 'AvenirLTStd-Book', fontSize: this.state.currency.symbol.length > 1 ? (this.state.currency.symbol.length > 3 ? 8 : 10) : 14 }}>{this.state.currency.symbol}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => {
                                    this.setState({
                                        isCurrencyModalVisible: !this.state.isCurrencyModalVisible,
                                        filteredCurrencyData: this.state.currencyData,
                                    })
                                }} style={{ padding: 2 }}><Text
                                    style={{ color: '#1C1C1C', fontSize: 15, marginTop: 3, fontFamily: 'AvenirLTStd-Book', marginLeft: 10, paddingHorizontal: 5 }}
                                >{this.state.currency.code}</Text></TouchableOpacity>
                            {/* <Dropdown
                                style={{ flex: 1, marginLeft: 20, marginTop: Platform.OS == "ios" ? 4 : 5 }}
                                textStyle={{ color: 'black', fontSize: 15, fontFamily: 'AvenirLTStd-Book' }}
                                options={this.state.currencyData}
                                renderSeparator={() => {
                                    return (<View></View>);
                                }}
                                dropdownStyle={{ width: '40%', height: this.state.currencyData.length > 0 ? 150 : 50, marginTop: 5, borderRadius: 5 }}
                                dropdownTextStyle={{ color: '#1C1C1C', fontFamily: 'AvenirLTStd-Book' }}
                                renderRow={(options) => {
                                    return (
                                        <Text style={{ padding: 10, color: '#1C1C1C' }}>{options.code}</Text>)
                                }}
                                onSelect={(index, value) => {
                                    this.setState({ currency: value })
                                }}>
                                <View style={{ flexDirection: "row" }}>
                                    <Text style={{ color: this.state.currency == null ? 'rgba(80,80,80,0.5)' : '#1c1c1c' }}>
                                        {this.state.currency == null ? 'Currency' : this.state.currency.code}</Text>
                                    <Text style={{ color: '#E04646' }}>{this.state.currency == null ? '*' : ''}</Text>
                                </View>
                            </Dropdown> */}
                        </View>
                    </View>
                    <View style={{ marginTop: 30, flexDirection: "row", borderBottomWidth: 0.5, borderColor: 'rgba(80,80,80,0.5)' }}>
                        <MaterialCommunityIcons name="phone-in-talk" size={17.5} color={'#5773FF'} style={{ marginTop: 4 }} />
                        <TouchableOpacity onPress={() => {
                            this.setState({
                                isMobileModalVisible: !this.state.isMobileModalVisible, filteredCallingCode: this.state.allCallingCode,
                            })
                        }} style={{ padding: 2 }}><Text
                            style={{ color: '#1C1C1C', fontSize: 15, marginTop: Platform.OS == "ios" ? 1 : 2.5, fontFamily: 'AvenirLTStd-Book', marginLeft: 10, paddingHorizontal: 5 }}
                        >{this.state.selectedCallingCode}</Text></TouchableOpacity>
                        {/* <Dropdown
                            textStyle={{ color: '#1C1C1C', fontSize: 15, marginTop: Platform.OS == "ios" ? 3 : 5, fontFamily: 'AvenirLTStd-Book', marginLeft: 10, paddingHorizontal: 5 }}
                            defaultValue={this.state.selectedCallingCode}
                            renderButtonText={(text) => {
                                return text;
                            }}
                            options={this.state.allCallingCode}
                            renderSeparator={() => {
                                return (<View></View>);
                            }}
                            onSelect={async (idx, value) => {
                                await this.setState({ selectedCallingCode: value })
                                await this.setState({ isMobileNoValid: !this.validateMobileNumberTextInput(this.state.mobileNumber) })
                            }}

                            dropdownStyle={{ width: '17%', marginTop: 6 }}
                            dropdownTextStyle={{ color: '#1C1C1C', fontFamily: 'AvenirLTStd-Book' }}
                            renderRow={(options) => {
                                return (<Text style={{ padding: 13, color: '#1C1C1C' }}>{options}</Text>);
                            }}
                        /> */}
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
                                this.setState({
                                    mobileNumber: text.replace(/[^0-9]/g, ''),
                                    isMobileNoValid: !this.validateMobileNumberTextInput(text)
                                })
                            }
                            }
                            style={[style.companyName, { marginLeft: 10 }]}>
                            <Text style={{ color: this.state.mobileNumberPlaceHolder == '' ? 'rgba(80,80,80,0.5)' : '#1c1c1c', fontFamily: 'AvenirLTStd-Book' }}>
                                {this.state.mobileNumberPlaceHolder == '' ?
                                    this.getMobilePlaceHolder()
                                    : this.state.mobileNumber}</Text>
                            <Text style={{ color: '#E04646', fontFamily: 'AvenirLTStd-Book' }}>{this.state.mobileNumberPlaceHolder == '' ? '*' : ''}</Text>
                        </TextInput>
                    </View>
                    {this.state.isMobileNoValid && <Text style={{ fontSize: 10, color: 'red', paddingLeft: 30 }}>Sorry!Invalid Number</Text>}
                    {this.renderModalView()}
                    {this.renderCurrencyModalView()}
                </ScrollView>
                <View style={{ flexDirection: "row", justifyContent: "space-between", position: "absolute", bottom: 20, marginHorizontal: 15, width: "100%" }}>
                    <TouchableOpacity
                        style={{
                            height: Dimensions.get('screen').height * 0.06,
                            width: !this.props.route.params ? "60%" : "100%",
                            borderRadius: 25,
                            backgroundColor: this.validateDetails() ? '#5773FF' : colors.PRIMARY_DISABLED,
                            justifyContent: 'center',
                            alignItems: 'center',
                            alignSelf: 'center',
                        }}
                        onPress={() => {
                            if (this.validateDetails()) {
                                var PhoneNumber = require('awesome-phonenumber');
                                var getRegionCode = getRegionCodeForCountryCode(this.state.selectedCallingCode);
                                var pn = new PhoneNumber(this.state.mobileNumber, getRegionCode);
                                if (!pn.isValid()) {
                                    alert("Invalid Contact Number")
                                    return
                                }
                                this.props.navigation.navigate("createCompanyDetails", {
                                    companyName: this.state.companyName,
                                    country: this.state.countryName,
                                    currency: this.state.currency,
                                    mobileNumber: this.state.mobileNumber,
                                    callingCode: this.state.selectedCallingCode,
                                    oldUser: this.props.route.params ? this.props.route.params.oldUser : false,
                                    ...this.state.newCompany2ScreenData,
                                    handlePersistData: this.handlePersistData,
                                })
                            } else {
                                Alert.alert("Missing Fields", "Enter all the mandatory fields",
                                    [{ text: "OK", onPress: () => { console.log("Alert cancelled") } }])
                            }
                        }}>
                        <Text style={{ color: '#fff', fontFamily: 'AvenirLTStd-Black' }}>Next</Text>
                    </TouchableOpacity>
                    {!this.props.route.params && <TouchableOpacity style={{
                        justifyContent: 'center',
                        alignItems: 'center', width: "40%",
                    }}
                        onPress={() => {
                            Alert.alert("Are you sure you want to cancel and logout?",
                                "It will be deleted permanently and will no longer be accessible from any other module.",
                                [{ text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                                { text: "OK", onPress: () => { this.props.logout() } }])
                        }}
                    >
                        <Text style={{ color: '#5773FF', fontFamily: 'AvenirLTStd-Book', padding: 5, fontSize: 16 }}>Exit</Text>
                    </TouchableOpacity>}
                </View>
                <BottomSheet
                    bottomSheetRef={this.countryPickerBottomSheetRef}
                    modalHeight={height * 0.9}
                    headerText='Select Country'
                    headerTextColor={'#084EAD'}
                    adjustToContentHeight={false}
                    flatListProps={{
                        data: this.state.countryList,
                        renderItem: ({ item }) => (
                            <TouchableOpacity
                                activeOpacity={0.7}
                                style={style.listButton}
                                onPress={() => {
                                    this.countryPickerBottomSheetRef?.current?.close()
                                }}
                            >
                                <Flag
                                    countryCode={item?.alpha2CountryCode}
                                    flagSize={16}
                                />
                                <Text style={style.regularText}>{item?.alpha2CountryCode} - {item?.countryName}</Text>
                            </TouchableOpacity>
                        )
                    }}
                />
            </SafeAreaView>
        );
        // }
    }
}

const mapStateToProps = (state: RootState) => {
    return {
        subscriptionData: state.subscriptionReducer?.subscriptionData
    }
};

function mapDispatchToProps(dispatch) {
    return {
        logout: () => {
            dispatch(CommonActions.logout());
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(NewCompany);
