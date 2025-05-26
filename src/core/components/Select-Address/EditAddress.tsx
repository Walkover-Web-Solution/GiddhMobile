import React from 'react';
import { View, Text, TouchableOpacity, StatusBar, FlatList, Platform, SafeAreaView, ScrollViewBase } from 'react-native';
import style from './style';
import Icon from '@/core/components/custom-icon/custom-icon';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import LoaderKit  from 'react-native-loader-kit';
import Dropdown from 'react-native-modal-dropdown';
import color from '@/utils/colors';
import { CustomerVendorService } from '@/core/services/customer-vendor/customer-vendor.service';
import { FONT_FAMILY, STORAGE_KEYS } from '@/utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CountryPicker from 'react-native-country-picker-modal'
import { InvoiceService } from '@/core/services/invoice/invoice.service';
import Modal1 from 'react-native-modal';
import Fontisto from 'react-native-vector-icons/Fontisto';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const allCountry = [
   {
      "alpha3CountryCode": "GTM",
      "alpha2CountryCode": "GT",
      "countryName": "Guatemala",
      "callingCode": "502",
      "currency": {
         "code": "GTQ",
         "symbol": "Q"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "GIN",
      "alpha2CountryCode": "GN",
      "countryName": "Guinea",
      "callingCode": "224",
      "currency": {
         "code": "GNF",
         "symbol": "Fr"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "GNB",
      "alpha2CountryCode": "GW",
      "countryName": "Guinea-Bissau",
      "callingCode": "245",
      "currency": {
         "code": "XOF",
         "symbol": "Fr"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "HND",
      "alpha2CountryCode": "HN",
      "countryName": "Honduras",
      "callingCode": "504",
      "currency": {
         "code": "HNL",
         "symbol": "L"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "HKG",
      "alpha2CountryCode": "HK",
      "countryName": "Hong Kong",
      "callingCode": "852",
      "currency": {
         "code": "HKD",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "HUN",
      "alpha2CountryCode": "HU",
      "countryName": "Hungary",
      "callingCode": "36",
      "currency": {
         "code": "HUF",
         "symbol": "Ft"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "ISL",
      "alpha2CountryCode": "IS",
      "countryName": "Iceland",
      "callingCode": "354",
      "currency": {
         "code": "ISK",
         "symbol": "kr"
      },
      "countryIndia": false
   },
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
      "alpha3CountryCode": "IDN",
      "alpha2CountryCode": "ID",
      "countryName": "Indonesia",
      "callingCode": "62",
      "currency": {
         "code": "IDR",
         "symbol": "Rp"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "IRQ",
      "alpha2CountryCode": "IQ",
      "countryName": "Iraq",
      "callingCode": "964",
      "currency": {
         "code": "IQD",
         "symbol": "ع.د"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "IRL",
      "alpha2CountryCode": "IE",
      "countryName": "Ireland",
      "callingCode": "353",
      "currency": {
         "code": "EUR",
         "symbol": "€"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "IMN",
      "alpha2CountryCode": "IM",
      "countryName": "Isle of Man",
      "callingCode": "44",
      "currency": {
         "code": "GBP",
         "symbol": "£"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "ISR",
      "alpha2CountryCode": "IL",
      "countryName": "Israel",
      "callingCode": "972",
      "currency": {
         "code": "ILS",
         "symbol": "₪"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "ITA",
      "alpha2CountryCode": "IT",
      "countryName": "Italy",
      "callingCode": "39",
      "currency": {
         "code": "EUR",
         "symbol": "€"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "JAM",
      "alpha2CountryCode": "JM",
      "countryName": "Jamaica",
      "callingCode": "1876",
      "currency": {
         "code": "JMD",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "JPN",
      "alpha2CountryCode": "JP",
      "countryName": "Japan",
      "callingCode": "81",
      "currency": {
         "code": "JPY",
         "symbol": "¥"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "JEY",
      "alpha2CountryCode": "JE",
      "countryName": "Jersey",
      "callingCode": "44",
      "currency": {
         "code": "GBP",
         "symbol": "£"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "JOR",
      "alpha2CountryCode": "JO",
      "countryName": "Jordan",
      "callingCode": "962",
      "currency": {
         "code": "JOD",
         "symbol": "د.ا"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "KAZ",
      "alpha2CountryCode": "KZ",
      "countryName": "Kazakhstan",
      "callingCode": "76",
      "currency": {
         "code": "KZT",
         "symbol": "₸"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "KEN",
      "alpha2CountryCode": "KE",
      "countryName": "Kenya",
      "callingCode": "254",
      "currency": {
         "code": "KES",
         "symbol": "Sh"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "KIR",
      "alpha2CountryCode": "KI",
      "countryName": "Kiribati",
      "callingCode": "686",
      "currency": {
         "code": "AUD",
         "symbol": "$"
      },
      "countryIndia": false
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
      "alpha3CountryCode": "LVA",
      "alpha2CountryCode": "LV",
      "countryName": "Latvia",
      "callingCode": "371",
      "currency": {
         "code": "EUR",
         "symbol": "€"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "LBN",
      "alpha2CountryCode": "LB",
      "countryName": "Lebanon",
      "callingCode": "961",
      "currency": {
         "code": "LBP",
         "symbol": "ل.ل"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "LBY",
      "alpha2CountryCode": "LY",
      "countryName": "Libya",
      "callingCode": "218",
      "currency": {
         "code": "LYD",
         "symbol": "ل.د"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "LIE",
      "alpha2CountryCode": "LI",
      "countryName": "Liechtenstein",
      "callingCode": "423",
      "currency": {
         "code": "CHF",
         "symbol": "Fr"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "LTU",
      "alpha2CountryCode": "LT",
      "countryName": "Lithuania",
      "callingCode": "370",
      "currency": {
         "code": "EUR",
         "symbol": "€"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "LUX",
      "alpha2CountryCode": "LU",
      "countryName": "Luxembourg",
      "callingCode": "352",
      "currency": {
         "code": "EUR",
         "symbol": "€"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "MDG",
      "alpha2CountryCode": "MG",
      "countryName": "Madagascar",
      "callingCode": "261",
      "currency": {
         "code": "MGA",
         "symbol": "Ar"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "MYS",
      "alpha2CountryCode": "MY",
      "countryName": "Malaysia",
      "callingCode": "60",
      "currency": {
         "code": "MYR",
         "symbol": "RM"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "MLI",
      "alpha2CountryCode": "ML",
      "countryName": "Mali",
      "callingCode": "223",
      "currency": {
         "code": "XOF",
         "symbol": "Fr"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "MLT",
      "alpha2CountryCode": "MT",
      "countryName": "Malta",
      "callingCode": "356",
      "currency": {
         "code": "EUR",
         "symbol": "€"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "MHL",
      "alpha2CountryCode": "MH",
      "countryName": "Marshall Islands",
      "callingCode": "692",
      "currency": {
         "code": "USD",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "MUS",
      "alpha2CountryCode": "MU",
      "countryName": "Mauritius",
      "callingCode": "230",
      "currency": {
         "code": "MUR",
         "symbol": "₨"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "MYT",
      "alpha2CountryCode": "YT",
      "countryName": "Mayotte",
      "callingCode": "262",
      "currency": {
         "code": "EUR",
         "symbol": "€"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "MEX",
      "alpha2CountryCode": "MX",
      "countryName": "Mexico",
      "callingCode": "52",
      "currency": {
         "code": "MXN",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "MCO",
      "alpha2CountryCode": "MC",
      "countryName": "Monaco",
      "callingCode": "377",
      "currency": {
         "code": "EUR",
         "symbol": "€"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "MNE",
      "alpha2CountryCode": "ME",
      "countryName": "Montenegro",
      "callingCode": "382",
      "currency": {
         "code": "EUR",
         "symbol": "€"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "MSR",
      "alpha2CountryCode": "MS",
      "countryName": "Montserrat",
      "callingCode": "1664",
      "currency": {
         "code": "XCD",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "MAR",
      "alpha2CountryCode": "MA",
      "countryName": "Morocco",
      "callingCode": "212",
      "currency": {
         "code": "MAD",
         "symbol": "د.م."
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "MOZ",
      "alpha2CountryCode": "MZ",
      "countryName": "Mozambique",
      "callingCode": "258",
      "currency": {
         "code": "MZN",
         "symbol": "MT"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "MMR",
      "alpha2CountryCode": "MM",
      "countryName": "Myanmar",
      "callingCode": "95",
      "currency": {
         "code": "MMK",
         "symbol": "Ks"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "NAM",
      "alpha2CountryCode": "NA",
      "countryName": "Namibia",
      "callingCode": "264",
      "currency": {
         "code": "NAD",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "NRU",
      "alpha2CountryCode": "NR",
      "countryName": "Nauru",
      "callingCode": "674",
      "currency": {
         "code": "AUD",
         "symbol": "$"
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
      "alpha3CountryCode": "NLD",
      "alpha2CountryCode": "NL",
      "countryName": "Netherlands",
      "callingCode": "31",
      "currency": {
         "code": "EUR",
         "symbol": "€"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "NZL",
      "alpha2CountryCode": "NZ",
      "countryName": "New Zealand",
      "callingCode": "64",
      "currency": {
         "code": "NZD",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "NIC",
      "alpha2CountryCode": "NI",
      "countryName": "Nicaragua",
      "callingCode": "505",
      "currency": {
         "code": "NIO",
         "symbol": "C$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "NER",
      "alpha2CountryCode": "NE",
      "countryName": "Niger",
      "callingCode": "227",
      "currency": {
         "code": "XOF",
         "symbol": "Fr"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "NGA",
      "alpha2CountryCode": "NG",
      "countryName": "Nigeria",
      "callingCode": "234",
      "currency": {
         "code": "NGN",
         "symbol": "₦"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "NIU",
      "alpha2CountryCode": "NU",
      "countryName": "Niue",
      "callingCode": "683",
      "currency": {
         "code": "NZD",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "MNP",
      "alpha2CountryCode": "MP",
      "countryName": "Northern Mariana Islands",
      "callingCode": "1670",
      "currency": {
         "code": "USD",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "NOR",
      "alpha2CountryCode": "NO",
      "countryName": "Norway",
      "callingCode": "47",
      "currency": {
         "code": "NOK",
         "symbol": "kr"
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
      "alpha3CountryCode": "PAK",
      "alpha2CountryCode": "PK",
      "countryName": "Pakistan",
      "callingCode": "92",
      "currency": {
         "code": "PKR",
         "symbol": "₨"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "PAN",
      "alpha2CountryCode": "PA",
      "countryName": "Panama",
      "callingCode": "507",
      "currency": {
         "code": "PAB",
         "symbol": "B/."
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "PRY",
      "alpha2CountryCode": "PY",
      "countryName": "Paraguay",
      "callingCode": "595",
      "currency": {
         "code": "PYG",
         "symbol": "₲"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "PER",
      "alpha2CountryCode": "PE",
      "countryName": "Peru",
      "callingCode": "51",
      "currency": {
         "code": "PEN",
         "symbol": "S/."
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "PHL",
      "alpha2CountryCode": "PH",
      "countryName": "Philippines",
      "callingCode": "63",
      "currency": {
         "code": "PHP",
         "symbol": "₱"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "POL",
      "alpha2CountryCode": "PL",
      "countryName": "Poland",
      "callingCode": "48",
      "currency": {
         "code": "PLN",
         "symbol": "zł"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "PRT",
      "alpha2CountryCode": "PT",
      "countryName": "Portugal",
      "callingCode": "351",
      "currency": {
         "code": "EUR",
         "symbol": "€"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "PRI",
      "alpha2CountryCode": "PR",
      "countryName": "Puerto Rico",
      "callingCode": "1787",
      "currency": {
         "code": "USD",
         "symbol": "$"
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
      "alpha3CountryCode": "ROU",
      "alpha2CountryCode": "RO",
      "countryName": "Romania",
      "callingCode": "40",
      "currency": {
         "code": "RON",
         "symbol": "lei"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "RWA",
      "alpha2CountryCode": "RW",
      "countryName": "Rwanda",
      "callingCode": "250",
      "currency": {
         "code": "RWF",
         "symbol": "Fr"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "SPM",
      "alpha2CountryCode": "PM",
      "countryName": "Saint Pierre and Miquelon",
      "callingCode": "508",
      "currency": {
         "code": "EUR",
         "symbol": "€"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "SMR",
      "alpha2CountryCode": "SM",
      "countryName": "San Marino",
      "callingCode": "378",
      "currency": {
         "code": "EUR",
         "symbol": "€"
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
      "alpha3CountryCode": "SEN",
      "alpha2CountryCode": "SN",
      "countryName": "Senegal",
      "callingCode": "221",
      "currency": {
         "code": "XOF",
         "symbol": "Fr"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "SRB",
      "alpha2CountryCode": "RS",
      "countryName": "Serbia",
      "callingCode": "381",
      "currency": {
         "code": "RSD",
         "symbol": "дин."
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "SGP",
      "alpha2CountryCode": "SG",
      "countryName": "Singapore",
      "callingCode": "65",
      "currency": {
         "code": "BND",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "SVK",
      "alpha2CountryCode": "SK",
      "countryName": "Slovakia",
      "callingCode": "421",
      "currency": {
         "code": "EUR",
         "symbol": "€"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "SVN",
      "alpha2CountryCode": "SI",
      "countryName": "Slovenia",
      "callingCode": "386",
      "currency": {
         "code": "EUR",
         "symbol": "€"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "SOM",
      "alpha2CountryCode": "SO",
      "countryName": "Somalia",
      "callingCode": "252",
      "currency": {
         "code": "SOS",
         "symbol": "Sh"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "ZAF",
      "alpha2CountryCode": "ZA",
      "countryName": "South Africa",
      "callingCode": "27",
      "currency": {
         "code": "ZAR",
         "symbol": "Rs"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "ESP",
      "alpha2CountryCode": "ES",
      "countryName": "Spain",
      "callingCode": "34",
      "currency": {
         "code": "EUR",
         "symbol": "€"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "LKA",
      "alpha2CountryCode": "LK",
      "countryName": "Sri Lanka",
      "callingCode": "94",
      "currency": {
         "code": "LKR",
         "symbol": "Rs"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "SDN",
      "alpha2CountryCode": "SD",
      "countryName": "Sudan",
      "callingCode": "249",
      "currency": {
         "code": "SDG",
         "symbol": "ج.س."
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "SWE",
      "alpha2CountryCode": "SE",
      "countryName": "Sweden",
      "callingCode": "46",
      "currency": {
         "code": "SEK",
         "symbol": "kr"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "CHE",
      "alpha2CountryCode": "CH",
      "countryName": "Switzerland",
      "callingCode": "41",
      "currency": {
         "code": "CHF",
         "symbol": "Fr"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "TWN",
      "alpha2CountryCode": "TW",
      "countryName": "Taiwan",
      "callingCode": "886",
      "currency": {
         "code": "TWD",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "AFG",
      "alpha2CountryCode": "AF",
      "countryName": "Afghanistan",
      "callingCode": "93",
      "currency": {
         "code": "AFN",
         "symbol": "؋"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "ALB",
      "alpha2CountryCode": "AL",
      "countryName": "Albania",
      "callingCode": "355",
      "currency": {
         "code": "ALL",
         "symbol": "L"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "DZA",
      "alpha2CountryCode": "DZ",
      "countryName": "Algeria",
      "callingCode": "213",
      "currency": {
         "code": "DZD",
         "symbol": "د.ج"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "ASM",
      "alpha2CountryCode": "AS",
      "countryName": "American Samoa",
      "callingCode": "1684",
      "currency": {
         "code": "USD",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "AND",
      "alpha2CountryCode": "AD",
      "countryName": "Andorra",
      "callingCode": "376",
      "currency": {
         "code": "EUR",
         "symbol": "€"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "AIA",
      "alpha2CountryCode": "AI",
      "countryName": "Anguilla",
      "callingCode": "1264",
      "currency": {
         "code": "XCD",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "ATA",
      "alpha2CountryCode": "AQ",
      "countryName": "Antarctica",
      "callingCode": "672",
      "currency": {
         "code": "AUD",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "ARG",
      "alpha2CountryCode": "AR",
      "countryName": "Argentina",
      "callingCode": "54",
      "currency": {
         "code": "ARS",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "ARM",
      "alpha2CountryCode": "AM",
      "countryName": "Armenia",
      "callingCode": "374",
      "currency": {
         "code": "AMD",
         "symbol": "֏"
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
      "alpha3CountryCode": "AUT",
      "alpha2CountryCode": "AT",
      "countryName": "Austria",
      "callingCode": "43",
      "currency": {
         "code": "EUR",
         "symbol": "€"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "AZE",
      "alpha2CountryCode": "AZ",
      "countryName": "Azerbaijan",
      "callingCode": "994",
      "currency": {
         "code": "AZN",
         "symbol": "₼"
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
      "alpha3CountryCode": "BGD",
      "alpha2CountryCode": "BD",
      "countryName": "Bangladesh",
      "callingCode": "880",
      "currency": {
         "code": "BDT",
         "symbol": "৳"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "BEL",
      "alpha2CountryCode": "BE",
      "countryName": "Belgium",
      "callingCode": "32",
      "currency": {
         "code": "EUR",
         "symbol": "€"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "BLZ",
      "alpha2CountryCode": "BZ",
      "countryName": "Belize",
      "callingCode": "501",
      "currency": {
         "code": "BZD",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "BEN",
      "alpha2CountryCode": "BJ",
      "countryName": "Benin",
      "callingCode": "229",
      "currency": {
         "code": "XOF",
         "symbol": "Fr"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "BIH",
      "alpha2CountryCode": "BA",
      "countryName": "Bosnia and Herzegovina",
      "callingCode": "387",
      "currency": {
         "code": "BAM",
         "symbol": "KM"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "BWA",
      "alpha2CountryCode": "BW",
      "countryName": "Botswana",
      "callingCode": "267",
      "currency": {
         "code": "BWP",
         "symbol": "P"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "BRA",
      "alpha2CountryCode": "BR",
      "countryName": "Brazil",
      "callingCode": "55",
      "currency": {
         "code": "BRL",
         "symbol": "R$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "IOT",
      "alpha2CountryCode": "IO",
      "countryName": "British Indian Ocean Territory",
      "callingCode": "246",
      "currency": {
         "code": "USD",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "BGR",
      "alpha2CountryCode": "BG",
      "countryName": "Bulgaria",
      "callingCode": "359",
      "currency": {
         "code": "BGN",
         "symbol": "лв"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "BFA",
      "alpha2CountryCode": "BF",
      "countryName": "Burkina Faso",
      "callingCode": "226",
      "currency": {
         "code": "XOF",
         "symbol": "Fr"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "BDI",
      "alpha2CountryCode": "BI",
      "countryName": "Burundi",
      "callingCode": "257",
      "currency": {
         "code": "BIF",
         "symbol": "Fr"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "KHM",
      "alpha2CountryCode": "KH",
      "countryName": "Cambodia",
      "callingCode": "855",
      "currency": {
         "code": "KHR",
         "symbol": "៛"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "CMR",
      "alpha2CountryCode": "CM",
      "countryName": "Cameroon",
      "callingCode": "237",
      "currency": {
         "code": "XAF",
         "symbol": "Fr"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "CAN",
      "alpha2CountryCode": "CA",
      "countryName": "Canada",
      "callingCode": "1",
      "currency": {
         "code": "CAD",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "CAF",
      "alpha2CountryCode": "CF",
      "countryName": "Central African Republic",
      "callingCode": "236",
      "currency": {
         "code": "XAF",
         "symbol": "Fr"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "TCD",
      "alpha2CountryCode": "TD",
      "countryName": "Chad",
      "callingCode": "235",
      "currency": {
         "code": "XAF",
         "symbol": "Fr"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "CHL",
      "alpha2CountryCode": "CL",
      "countryName": "Chile",
      "callingCode": "56",
      "currency": {
         "code": "CLP",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "CHN",
      "alpha2CountryCode": "CN",
      "countryName": "China",
      "callingCode": "86",
      "currency": {
         "code": "CNY",
         "symbol": "¥"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "CXR",
      "alpha2CountryCode": "CX",
      "countryName": "Christmas Island",
      "callingCode": "61",
      "currency": {
         "code": "AUD",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "CCK",
      "alpha2CountryCode": "CC",
      "countryName": "Cocos (Keeling) Islands",
      "callingCode": "61",
      "currency": {
         "code": "AUD",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "COL",
      "alpha2CountryCode": "CO",
      "countryName": "Colombia",
      "callingCode": "57",
      "currency": {
         "code": "COP",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "COM",
      "alpha2CountryCode": "KM",
      "countryName": "Comoros",
      "callingCode": "269",
      "currency": {
         "code": "KMF",
         "symbol": "Fr"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "COK",
      "alpha2CountryCode": "CK",
      "countryName": "Cook Islands",
      "callingCode": "682",
      "currency": {
         "code": "NZD",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "CRI",
      "alpha2CountryCode": "CR",
      "countryName": "Costa Rica",
      "callingCode": "506",
      "currency": {
         "code": "CRC",
         "symbol": "₡"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "HRV",
      "alpha2CountryCode": "HR",
      "countryName": "Croatia",
      "callingCode": "385",
      "currency": {
         "code": "HRK",
         "symbol": "kn"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "CYP",
      "alpha2CountryCode": "CY",
      "countryName": "Cyprus",
      "callingCode": "357",
      "currency": {
         "code": "EUR",
         "symbol": "€"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "CZE",
      "alpha2CountryCode": "CZ",
      "countryName": "Czech Republic",
      "callingCode": "420",
      "currency": {
         "code": "CZK",
         "symbol": "Kč"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "DNK",
      "alpha2CountryCode": "DK",
      "countryName": "Denmark",
      "callingCode": "45",
      "currency": {
         "code": "DKK",
         "symbol": "kr"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "DJI",
      "alpha2CountryCode": "DJ",
      "countryName": "Djibouti",
      "callingCode": "253",
      "currency": {
         "code": "DJF",
         "symbol": "Fr"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "DMA",
      "alpha2CountryCode": "DM",
      "countryName": "Dominica",
      "callingCode": "1767",
      "currency": {
         "code": "XCD",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "DOM",
      "alpha2CountryCode": "DO",
      "countryName": "Dominican Republic",
      "callingCode": "1809",
      "currency": {
         "code": "DOP",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "ECU",
      "alpha2CountryCode": "EC",
      "countryName": "Ecuador",
      "callingCode": "593",
      "currency": {
         "code": "USD",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "EGY",
      "alpha2CountryCode": "EG",
      "countryName": "Egypt",
      "callingCode": "20",
      "currency": {
         "code": "EGP",
         "symbol": "£"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "SLV",
      "alpha2CountryCode": "SV",
      "countryName": "El Salvador",
      "callingCode": "503",
      "currency": {
         "code": "USD",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "GNQ",
      "alpha2CountryCode": "GQ",
      "countryName": "Equatorial Guinea",
      "callingCode": "240",
      "currency": {
         "code": "XAF",
         "symbol": "Fr"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "ERI",
      "alpha2CountryCode": "ER",
      "countryName": "Eritrea",
      "callingCode": "291",
      "currency": {
         "code": "ERN",
         "symbol": "Nfk"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "AGO",
      "alpha2CountryCode": "AO",
      "countryName": "Angola",
      "callingCode": "244",
      "currency": {
         "code": "AOA",
         "symbol": "Kz"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "ABW",
      "alpha2CountryCode": "AW",
      "countryName": "Aruba",
      "callingCode": "297",
      "currency": {
         "code": "AWG",
         "symbol": "ƒ"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "BHS",
      "alpha2CountryCode": "BS",
      "countryName": "Bahamas",
      "callingCode": "1242",
      "currency": {
         "code": "BSD",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "BRB",
      "alpha2CountryCode": "BB",
      "countryName": "Barbados",
      "callingCode": "1246",
      "currency": {
         "code": "BBD",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "BLR",
      "alpha2CountryCode": "BY",
      "countryName": "Belarus",
      "callingCode": "375",
      "currency": {
         "code": "BYN",
         "symbol": "Br"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "BMU",
      "alpha2CountryCode": "BM",
      "countryName": "Bermuda",
      "callingCode": "1441",
      "currency": {
         "code": "BMD",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "BTN",
      "alpha2CountryCode": "BT",
      "countryName": "Bhutan",
      "callingCode": "975",
      "currency": {
         "code": "BTN",
         "symbol": "Nu."
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "CYM",
      "alpha2CountryCode": "KY",
      "countryName": "Cayman Islands",
      "callingCode": "1345",
      "currency": {
         "code": "KYD",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "CUB",
      "alpha2CountryCode": "CU",
      "countryName": "Cuba",
      "callingCode": "53",
      "currency": {
         "code": "CUC",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "ATG",
      "alpha2CountryCode": "AG",
      "countryName": "Antigua",
      "callingCode": "1268",
      "currency": {
         "code": "XCD",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "BOL",
      "alpha2CountryCode": "BO",
      "countryName": "Bolivia",
      "callingCode": "591",
      "currency": {
         "code": "BOB",
         "symbol": "Bs."
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "VGB",
      "alpha2CountryCode": "VG",
      "countryName": "British Virgin Islands",
      "callingCode": "1284",
      "currency": {
         "code": "USD",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "VIR",
      "alpha2CountryCode": "VI",
      "countryName": "US Virgin Islands",
      "callingCode": "1 340",
      "currency": {
         "code": "USD",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "BRN",
      "alpha2CountryCode": "BN",
      "countryName": "Brunei",
      "callingCode": "673",
      "currency": {
         "code": "BND",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "CPV",
      "alpha2CountryCode": "CV",
      "countryName": "Cape Verde",
      "callingCode": "238",
      "currency": {
         "code": "CVE",
         "symbol": "Esc"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "COG",
      "alpha2CountryCode": "CG",
      "countryName": "Republic of the Congo",
      "callingCode": "242",
      "currency": {
         "code": "XAF",
         "symbol": "Fr"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "COD",
      "alpha2CountryCode": "CD",
      "countryName": "Democratic Republic of the Congo",
      "callingCode": "243",
      "currency": {
         "code": "CDF",
         "symbol": "Fr"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "FLK",
      "alpha2CountryCode": "FK",
      "countryName": "Falkland Islands",
      "callingCode": "500",
      "currency": {
         "code": "FKP",
         "symbol": "£"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "VAT",
      "alpha2CountryCode": "VA",
      "countryName": "Holy See (Vatican, City)",
      "callingCode": "379",
      "currency": {
         "code": "EUR",
         "symbol": "€"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "CIV",
      "alpha2CountryCode": "CI",
      "countryName": "Ivory Coast",
      "callingCode": "225",
      "currency": {
         "code": "XOF",
         "symbol": "Fr"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "IRN",
      "alpha2CountryCode": "IR",
      "countryName": "Iran",
      "callingCode": "98",
      "currency": {
         "code": "IRR",
         "symbol": "﷼"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "LAO",
      "alpha2CountryCode": "LA",
      "countryName": "Laos",
      "callingCode": "856",
      "currency": {
         "code": "LAK",
         "symbol": "₭"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "MAC",
      "alpha2CountryCode": "MO",
      "countryName": "Macau",
      "callingCode": "853",
      "currency": {
         "code": "MOP",
         "symbol": "P"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "MKD",
      "alpha2CountryCode": "MK",
      "countryName": "Macedonia",
      "callingCode": "389",
      "currency": {
         "code": "MKD",
         "symbol": "ден"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "FSM",
      "alpha2CountryCode": "FM",
      "countryName": "Micronesia",
      "callingCode": "691",
      "currency": {
         "code": "USD",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "MDA",
      "alpha2CountryCode": "MD",
      "countryName": "Moldova",
      "callingCode": "373",
      "currency": {
         "code": "MDL",
         "symbol": "L"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "PRK",
      "alpha2CountryCode": "KP",
      "countryName": "North Korea",
      "callingCode": "850",
      "currency": {
         "code": "KPW",
         "symbol": "₩"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "PCN",
      "alpha2CountryCode": "PN",
      "countryName": "Pitcairn Islands",
      "callingCode": "64",
      "currency": {
         "code": "NZD",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "RUS",
      "alpha2CountryCode": "RU",
      "countryName": "Russia",
      "callingCode": "7",
      "currency": {
         "code": "RUB",
         "symbol": "₽"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "BLM",
      "alpha2CountryCode": "BL",
      "countryName": "Saint Barthelemy",
      "callingCode": "590",
      "currency": {
         "code": "EUR",
         "symbol": "€"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "SHN",
      "alpha2CountryCode": "SH",
      "countryName": "St. Helena",
      "callingCode": "290",
      "currency": {
         "code": "SHP",
         "symbol": "£"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "KNA",
      "alpha2CountryCode": "KN",
      "countryName": "St. Kitts",
      "callingCode": "1869",
      "currency": {
         "code": "XCD",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "LCA",
      "alpha2CountryCode": "LC",
      "countryName": "St. Lucia",
      "callingCode": "1758",
      "currency": {
         "code": "XCD",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "MAF",
      "alpha2CountryCode": "MF",
      "countryName": "St. Martin",
      "callingCode": "590",
      "currency": {
         "code": "EUR",
         "symbol": "€"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "VCT",
      "alpha2CountryCode": "VC",
      "countryName": "St. Vincent",
      "callingCode": "1784",
      "currency": {
         "code": "XCD",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "KOR",
      "alpha2CountryCode": "KR",
      "countryName": "South Korea",
      "callingCode": "82",
      "currency": {
         "code": "KRW",
         "symbol": "₩"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "SUR",
      "alpha2CountryCode": "SR",
      "countryName": "SuriName",
      "callingCode": "597",
      "currency": {
         "code": "SRD",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "SJM",
      "alpha2CountryCode": "SJ",
      "countryName": "Svalbard",
      "callingCode": "4779",
      "currency": {
         "code": "NOK",
         "symbol": "kr"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "SYR",
      "alpha2CountryCode": "SY",
      "countryName": "Syria",
      "callingCode": "963",
      "currency": {
         "code": "SYP",
         "symbol": "£"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "TZA",
      "alpha2CountryCode": "TZ",
      "countryName": "Tanzania",
      "callingCode": "255",
      "currency": {
         "code": "TZS",
         "symbol": "Sh"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "TTO",
      "alpha2CountryCode": "TT",
      "countryName": "Trinidad",
      "callingCode": "1868",
      "currency": {
         "code": "TTD",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "EST",
      "alpha2CountryCode": "EE",
      "countryName": "Estonia",
      "callingCode": "372",
      "currency": {
         "code": "EUR",
         "symbol": "€"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "ETH",
      "alpha2CountryCode": "ET",
      "countryName": "Ethiopia",
      "callingCode": "251",
      "currency": {
         "code": "ETB",
         "symbol": "Br"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "FRO",
      "alpha2CountryCode": "FO",
      "countryName": "Faroe Islands",
      "callingCode": "298",
      "currency": {
         "code": "DKK",
         "symbol": "kr"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "FIN",
      "alpha2CountryCode": "FI",
      "countryName": "Finland",
      "callingCode": "358",
      "currency": {
         "code": "EUR",
         "symbol": "€"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "FRA",
      "alpha2CountryCode": "FR",
      "countryName": "France",
      "callingCode": "33",
      "currency": {
         "code": "EUR",
         "symbol": "€"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "GAB",
      "alpha2CountryCode": "GA",
      "countryName": "Gabon",
      "callingCode": "241",
      "currency": {
         "code": "XAF",
         "symbol": "Fr"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "GEO",
      "alpha2CountryCode": "GE",
      "countryName": "Georgia",
      "callingCode": "995",
      "currency": {
         "code": "GEL",
         "symbol": "ლ"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "DEU",
      "alpha2CountryCode": "DE",
      "countryName": "Germany",
      "callingCode": "49",
      "currency": {
         "code": "EUR",
         "symbol": "€"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "GHA",
      "alpha2CountryCode": "GH",
      "countryName": "Ghana",
      "callingCode": "233",
      "currency": {
         "code": "GHS",
         "symbol": "₵"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "GRC",
      "alpha2CountryCode": "GR",
      "countryName": "Greece",
      "callingCode": "30",
      "currency": {
         "code": "EUR",
         "symbol": "€"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "GRL",
      "alpha2CountryCode": "GL",
      "countryName": "Greenland",
      "callingCode": "299",
      "currency": {
         "code": "DKK",
         "symbol": "kr"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "GRD",
      "alpha2CountryCode": "GD",
      "countryName": "Grenada",
      "callingCode": "1473",
      "currency": {
         "code": "XCD",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "GUM",
      "alpha2CountryCode": "GU",
      "countryName": "Guam",
      "callingCode": "1671",
      "currency": {
         "code": "USD",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "FJI",
      "alpha2CountryCode": "FJ",
      "countryName": "Fiji",
      "callingCode": "679",
      "currency": {
         "code": "FJD",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "PYF",
      "alpha2CountryCode": "PF",
      "countryName": "French Polynesia",
      "callingCode": "689",
      "currency": {
         "code": "XPF",
         "symbol": "₣"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "GMB",
      "alpha2CountryCode": "GM",
      "countryName": "Gambia",
      "callingCode": "220",
      "currency": {
         "code": "GMD",
         "symbol": "D"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "GIB",
      "alpha2CountryCode": "GI",
      "countryName": "Gibraltar",
      "callingCode": "350",
      "currency": {
         "code": "GIP",
         "symbol": "£"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "GUY",
      "alpha2CountryCode": "GY",
      "countryName": "Guyana",
      "callingCode": "592",
      "currency": {
         "code": "GYD",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "HTI",
      "alpha2CountryCode": "HT",
      "countryName": "Haiti",
      "callingCode": "509",
      "currency": {
         "code": "HTG",
         "symbol": "G"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "KGZ",
      "alpha2CountryCode": "KG",
      "countryName": "Kyrgyzstan",
      "callingCode": "996",
      "currency": {
         "code": "KGS",
         "symbol": "Лв"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "LSO",
      "alpha2CountryCode": "LS",
      "countryName": "Lesotho",
      "callingCode": "266",
      "currency": {
         "code": "LSL",
         "symbol": "M"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "LBR",
      "alpha2CountryCode": "LR",
      "countryName": "Liberia",
      "callingCode": "231",
      "currency": {
         "code": "LRD",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "MWI",
      "alpha2CountryCode": "MW",
      "countryName": "Malawi",
      "callingCode": "265",
      "currency": {
         "code": "MWK",
         "symbol": "MK"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "MDV",
      "alpha2CountryCode": "MV",
      "countryName": "Maldives",
      "callingCode": "960",
      "currency": {
         "code": "MVR",
         "symbol": ".ރ"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "MRT",
      "alpha2CountryCode": "MR",
      "countryName": "Mauritania",
      "callingCode": "222",
      "currency": {
         "code": "MRO",
         "symbol": "UM"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "MNG",
      "alpha2CountryCode": "MN",
      "countryName": "Mongolia",
      "callingCode": "976",
      "currency": {
         "code": "MNT",
         "symbol": "₮"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "NCL",
      "alpha2CountryCode": "NC",
      "countryName": "New Caledonia",
      "callingCode": "687",
      "currency": {
         "code": "XPF",
         "symbol": "₣"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "PLW",
      "alpha2CountryCode": "PW",
      "countryName": "Palau",
      "callingCode": "680",
      "currency": {
         "code": "USD",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "PNG",
      "alpha2CountryCode": "PG",
      "countryName": "Papua New Guinea",
      "callingCode": "675",
      "currency": {
         "code": "PGK",
         "symbol": "K"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "WSM",
      "alpha2CountryCode": "WS",
      "countryName": "Samoa",
      "callingCode": "685",
      "currency": {
         "code": "WST",
         "symbol": "T"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "STP",
      "alpha2CountryCode": "ST",
      "countryName": "Sao Tome and Principe",
      "callingCode": "239",
      "currency": {
         "code": "STD",
         "symbol": "Db"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "SYC",
      "alpha2CountryCode": "SC",
      "countryName": "Seychelles",
      "callingCode": "248",
      "currency": {
         "code": "SCR",
         "symbol": "SRe"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "SLE",
      "alpha2CountryCode": "SL",
      "countryName": "Sierra Leone",
      "callingCode": "232",
      "currency": {
         "code": "SLL",
         "symbol": "Le"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "SLB",
      "alpha2CountryCode": "SB",
      "countryName": "Solomon Islands",
      "callingCode": "677",
      "currency": {
         "code": "SBD",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "SWZ",
      "alpha2CountryCode": "SZ",
      "countryName": "Swaziland",
      "callingCode": "268",
      "currency": {
         "code": "SZL",
         "symbol": "L"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "TJK",
      "alpha2CountryCode": "TJ",
      "countryName": "Tajikistan",
      "callingCode": "992",
      "currency": {
         "code": "TJS",
         "symbol": "ЅМ"
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
      "alpha3CountryCode": "VEN",
      "alpha2CountryCode": "VE",
      "countryName": "Venezuela",
      "callingCode": "58",
      "currency": {
         "code": "VEF",
         "symbol": "Bs F"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "VNM",
      "alpha2CountryCode": "VN",
      "countryName": "Vietnam",
      "callingCode": "84",
      "currency": {
         "code": "VND",
         "symbol": "₫"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "THA",
      "alpha2CountryCode": "TH",
      "countryName": "Thailand",
      "callingCode": "66",
      "currency": {
         "code": "THB",
         "symbol": "฿"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "TLS",
      "alpha2CountryCode": "TL",
      "countryName": "Timor-Leste",
      "callingCode": "670",
      "currency": {
         "code": "USD",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "TGO",
      "alpha2CountryCode": "TG",
      "countryName": "Togo",
      "callingCode": "228",
      "currency": {
         "code": "XOF",
         "symbol": "Fr"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "TKL",
      "alpha2CountryCode": "TK",
      "countryName": "Tokelau",
      "callingCode": "690",
      "currency": {
         "code": "NZD",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "TON",
      "alpha2CountryCode": "TO",
      "countryName": "Tonga",
      "callingCode": "676",
      "currency": {
         "code": "TOP",
         "symbol": "T$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "TUN",
      "alpha2CountryCode": "TN",
      "countryName": "Tunisia",
      "callingCode": "216",
      "currency": {
         "code": "TND",
         "symbol": "د.ت"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "TUR",
      "alpha2CountryCode": "TR",
      "countryName": "Turkey",
      "callingCode": "90",
      "currency": {
         "code": "TRY",
         "symbol": "₺"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "TCA",
      "alpha2CountryCode": "TC",
      "countryName": "Turks and Caicos Islands",
      "callingCode": "1649",
      "currency": {
         "code": "USD",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "TUV",
      "alpha2CountryCode": "TV",
      "countryName": "Tuvalu",
      "callingCode": "688",
      "currency": {
         "code": "AUD",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "UGA",
      "alpha2CountryCode": "UG",
      "countryName": "Uganda",
      "callingCode": "256",
      "currency": {
         "code": "UGX",
         "symbol": "Sh"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "UKR",
      "alpha2CountryCode": "UA",
      "countryName": "Ukraine",
      "callingCode": "380",
      "currency": {
         "code": "UAH",
         "symbol": "₴"
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
   },
   {
      "alpha3CountryCode": "URY",
      "alpha2CountryCode": "UY",
      "countryName": "Uruguay",
      "callingCode": "598",
      "currency": {
         "code": "UYU",
         "symbol": "$"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "UZB",
      "alpha2CountryCode": "UZ",
      "countryName": "Uzbekistan",
      "callingCode": "998",
      "currency": {
         "code": "UZS",
         "symbol": "so'm"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "ESH",
      "alpha2CountryCode": "EH",
      "countryName": "Western Sahara",
      "callingCode": "212",
      "currency": {
         "code": "MAD",
         "symbol": "د.م."
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "YEM",
      "alpha2CountryCode": "YE",
      "countryName": "Yemen",
      "callingCode": "967",
      "currency": {
         "code": "YER",
         "symbol": "﷼"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "ZWE",
      "alpha2CountryCode": "ZW",
      "countryName": "Zimbabwe",
      "callingCode": "263",
      "currency": {
         "code": "BWP",
         "symbol": "P"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "TKM",
      "alpha2CountryCode": "TM",
      "countryName": "Turkmenistan",
      "callingCode": "993",
      "currency": {
         "code": "TMT",
         "symbol": "m"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "VUT",
      "alpha2CountryCode": "VU",
      "countryName": "Vanuatu",
      "callingCode": "678",
      "currency": {
         "code": "VUV",
         "symbol": "Vt"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "WLF",
      "alpha2CountryCode": "WF",
      "countryName": "Wallis and Futuna",
      "callingCode": "681",
      "currency": {
         "code": "XPF",
         "symbol": "₣"
      },
      "countryIndia": false
   },
   {
      "alpha3CountryCode": "ZMB",
      "alpha2CountryCode": "ZM",
      "countryName": "Zambia",
      "callingCode": "260",
      "currency": {
         "code": "ZMW",
         "symbol": "ZK"
      },
      "countryIndia": false
   }
];
const allcountryCode: any = ["GT", "GN", "GW", "HN", "HK", "HU", "IS", "IN", "ID", "IQ", "IE", "IM", "IL", "IT", "JM", "JP", "JE", "JO", "KZ", "KE", "KI", "KW", "LV", "LB", "LY", "LI", "LT", "LU", "MG", "MY", "ML", "MT", "MH", "MU", "YT", "MX", "MC", "ME", "MS", "MA", "MZ", "MM", "NA", "NR", "NP", "NL", "NZ", "NI", "NE", "NG", "NU", "MP", "NO", "OM", "PK", "PA", "PY", "PE", "PH", "PL", "PT", "PR", "QA", "RO", "RW", "PM", "SM", "SA", "SN", "RS", "SG", "SK", "SI", "SO", "ZA", "ES", "LK", "SD", "SE", "CH", "TW", "AF", "AL", "DZ", "AS", "AD", "AI", "AQ", "AR", "AM", "AU", "AT", "AZ", "BH", "BD", "BE", "BZ", "BJ", "BA", "BW", "BR", "IO", "BG", "BF", "BI", "KH", "CM", "CA", "CF", "TD", "CL", "CN", "CX", "CC", "CO", "KM", "CK", "CR", "HR", "CY", "CZ", "DK", "DJ", "DM", "DO", "EC", "EG", "SV", "GQ", "ER", "AO", "AW", "BS", "BB", "BY", "BM", "BT", "KY", "CU", "AG", "BO", "VG", "VI", "BN", "CV", "CG", "CD", "FK", "VA", "CI", "IR", "LA", "MO", "MK", "FM", "MD", "KP", "PN", "RU", "BL", "SH", "KN", "LC", "MF", "VC", "KR", "SR", "SJ", "SY", "TZ", "TT", "EE", "ET", "FO", "FI", "FR", "GA", "GE", "DE", "GH", "GR", "GL", "GD", "GU", "FJ", "PF", "GM", "GI", "GY", "HT", "KG", "LS", "LR", "MW", "MV", "MR", "MN", "NC", "PW", "PG", "WS", "ST", "SC", "SL", "SB", "SZ", "TJ", "GB", "VE", "VN", "TH", "TL", "TG", "TK", "TO", "TN", "TR", "TC", "TV", "UG", "UA", "AE", "US", "UY", "UZ", "EH", "YE", "ZW", "TM", "VU", "WF", "ZM"]
export class EditAddress extends React.Component<any, any> {
   constructor(props: any) {
      super(props);
      this.state = {
         selectedState: this.props.route.params.address.stateName != null && this.props.route.params.address.stateName != ''
            ? (this.props.route.params.address.stateName.name ? this.props.route.params.address.stateName.name : this.props.route.params.address.stateName)
            : '',
         filteredStates: [],
         stateDropDown: Dropdown,
         addresssDropDown: Dropdown,
         selectStateDisable: false,
         gstNumberWrong: false,
         allStates: [],
         activeIndex: 0,
         editAddress: false,
         isDefault: false,
         // For Cash Invoice country name
         selectedCountry: this.props.route.params.address.selectedCountry
            ? this.props.route.params.address.selectedCountry
            : {
               alpha3CountryCode: 'IND',
               alpha2CountryCode: 'IN',
               countryName: 'India',
               callingCode: '91',
               currency: {
                  code: 'INR',
                  symbol: '₹',
               },
               countryIndia: true,
            },
         address: this.props.route.params.address.address != null ? this.props.route.params.address.address : '',
         state_billing:
            this.props.route.params.address.stateName != null && this.props.route.params.address.stateName != ''
               ? this.props.route.params.address.stateName
               : '',
         stateCode: this.props.route.params.address.stateCode ? this.props.route.params.address.stateCode : '',
         gstNo: this.props.route.params.address.gstNumber != null ? this.props.route.params.address.gstNumber : '',
         pinCode: this.props.route.params.address.pincode != null ? this.props.route.params.address.pincode : '',
         loading: false,
         activeCompanyCountryCode: '',
         companyCountryDetails: '',
         isStateModalVisible: false
      };
   }

   componentDidMount() {
      this.setActiveCompanyCountry();
      this.getDetails();
   }

   getDetails = async () => {
      this.setState({ loading: true });
      var countryCode = (this.props.route.params.address.selectedCountry.alpha2CountryCode != null ? this.props.route.params.address.selectedCountry.alpha2CountryCode
         : (this.props.route.params.address.selectedCountry.countryCode != null ? this.props.route.params.address.selectedCountry.countryCode :
            this.state.companyCountryDetails.alpha2CountryCode))
      if (
         (this.state.gstNo != '' ||
            (this.props.route.params.address.taxNumber != undefined && this.props.route.params.address.taxNumber != '')) && countryCode == "IN") {
         this.setState({ selectStateDisable: true });
         this.props.route.params.address.taxNumber
            ? this.setState({ gstNo: this.props.route.params.address.taxNumber })
            : null;
      }
      const activeCompanyCountryCode = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyCountryCode);
      await this.setState({
         activeCompanyCountryCode: activeCompanyCountryCode,
         selectedCountry:
            this.props.route.params.address.selectedCountry != null
               ? this.props.route.params.address.selectedCountry
               : this.state.companyCountryDetails,
      });
      console.log(this.state.selectedCountry);
      const allStateName = await CustomerVendorService.getAllStateName(
         this.state.selectedCountry.alpha2CountryCode
            ? this.state.selectedCountry.alpha2CountryCode
            : this.state.selectedCountry.countryCode,
      );
      await this.setState({
         allStates: allStateName.body.stateList,
         filteredStates: allStateName.body.stateList
      });
      await this.setState({ loading: false });
   };

   changeactiveIndex = (value: number) => {
      this.setState({ activeIndex: value });
   };

   async setActiveCompanyCountry() {
      try {
         const activeCompanyCountryCode = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyCountryCode);
         const results = await InvoiceService.getCountryDetails(activeCompanyCountryCode);
         if (results.body && results.status == 'success') {
            await this.setState({
               companyCountryDetails: results.body.country,
            });
         }
      } catch (e) { }
   }

   gstValidator() {
      var countryCode = (this.state.selectedCountry.alpha2CountryCode != null ? this.state.selectedCountry.alpha2CountryCode
         : (this.state.selectedCountry.countryCode != null ? this.state.selectedCountry.countryCode :
            this.state.companyCountryDetails.alpha2CountryCode))
      if (countryCode == "IN") {
         const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
         const vadidatorResult = this.state.gstNo != undefined && this.state.gstNo != '' ? regex.test((this.state.gstNo).toUpperCase()) : true;
         return vadidatorResult;
      } else {
         var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
         console.log(format.test(this.state.gstNo))
         if (this.state.gstNo != null && this.state.gstNo != '') {
            if (format.test(this.state.gstNo) || this.state.gstNo.length != 15) {
               return false;
            } else {
               return true;
            }
         } else {
            return true
         }
      }
   }

   onSubmit = () => {
      console.log('state' + this.state.state_billing);
      console.log('country' + this.state.selectedCountry);
      var countryCode = (this.state.selectedCountry.alpha2CountryCode != null ? this.state.selectedCountry.alpha2CountryCode
         : (this.state.selectedCountry.countryCode != null ? this.state.selectedCountry.countryCode :
            this.state.companyCountryDetails.alpha2CountryCode))
      if (this.state.selectedCountry.countryName == '') {
         alert('Please Enter Country Name');
      } else if (
         countryCode == this.state.activeCompanyCountryCode &&
         this.state.state_billing == ''
      ) {
         alert('Please Enter State Name');
      } else if (this.state.gstNo && this.state.gstNo.length != 15) {
         countryCode == "IN" ?
            alert('Enter a valid gst number, should be 15 characters long') :
            alert('Enter a valid TRN number, should be 15 characters long')
      } else if (this.state.gstNumberWrong || !this.gstValidator()) {
         countryCode == "IN" ? alert('Enter a valid gst number') : alert('Enter a valid TRN number')
      } else if (this.state.pinCode.length > 15) {
         alert('Pincode can be maximum 15 digits in length');
         return
      } else {
         const address = {
            address: this.state.address,
            gstNumber: (this.state.gstNo).toUpperCase(),
            pincode: this.state.pinCode,
            selectedCountry: this.state.selectedCountry,
            state: {
               code: this.state.stateCode,
               name: this.state.selectedState
            },
            stateCode: this.state.stateCode,
            stateName: this.state.state_billing.name
               ? this.state.state_billing.name
               : this.state.state_billing != ''
                  ? this.state.state_billing
                  : '',
         };
         console.log("Final Address " + JSON.stringify(address))
         this.props.route.params.selectAddress(address);
         this.props.navigation.goBack();
      }
   };

   setCountrySelected = async (country: any) => {
      await this.setState({ loading: true });
      var value = {}
      for (let i = 0; i < allCountry.length; i++) {
         if (allCountry[i].alpha2CountryCode.includes(country.cca2)) {
            value = await allCountry[i]
         }
      }
      await this.setState({
         state_billing: '',
         gstNo: '',
         selectedCountry: value,
         countryName: value.countryName,
         selectStateDisable: false,
         gstNumberWrong: false,
         selectedState: ''
      });
      const allStateName = await CustomerVendorService.getAllStateName(value.alpha2CountryCode);
      await this.setState({ allStates: allStateName.body.stateList });
      // await this.state.addresssDropDown.select(-1);
      await this.setState({ loading: false });
   };

   findState = async (gstNo: any) => {
      var countryCode = (this.state.selectedCountry.alpha2CountryCode != null ? this.state.selectedCountry.alpha2CountryCode
         : (this.state.selectedCountry.countryCode != null ? this.state.selectedCountry.countryCode :
            this.state.companyCountryDetails.alpha2CountryCode))
      if (gstNo == '' || countryCode != "IN") {
         this.setState({ selectStateDisable: false, gstNumberWrong: false });
         return;
      }
      const gstStateCode = await gstNo.slice(0, 2);
      for (let i = 0; i < this.state.allStates.length; i++) {
         if (this.state.allStates[i].stateGstCode == gstStateCode) {
            await this.setState({
               state_billing: this.state.allStates[i],
               stateCode: this.state.allStates[i].code,
               selectedState: this.state.allStates[i].name,
               selectStateDisable: true,
            });
            //await this.state.addresssDropDown.select(-1);
            break;
         } else {
            await this.setState({ selectStateDisable: false });
         }
      }
      if (!this.state.selectStateDisable) {
         this.setState({ gstNumberWrong: true });
      } else {
         this.setState({ gstNumberWrong: false });
      }
   };

   filterStates = (text: any) => {
      if (text == '') {
         this.setState({
            filteredStates: this.state.allStates,
         });
         //this.state.stateDropDown.show();
         return;
      }
      let newFilteredStates: any[] = [];
      for (let i = 0; i < this.state.allStates.length; i++) {
         if (this.state.allStates[i].name.toLowerCase().includes(text.toLowerCase())) {
            newFilteredStates.push(this.state.allStates[i]);
         }
      }
      this.setState({
         filteredStates: newFilteredStates,
      });
      //this.state.stateDropDown.show();
   }

   renderStateModalView = () => {
      return (
         <Modal1 isVisible={this.state.isStateModalVisible} onBackdropPress={() => { this.setState({ isStateModalVisible: !this.state.isStateModalVisible }) }}
            onBackButtonPress={() => { this.setState({ isStateModalVisible: !this.state.isStateModalVisible }) }}
            style={style.modalMobileContainer}>
            <SafeAreaView style={style.modalViewContainer}>
               <View style={style.cancelButtonModal} >
                  <TextInput
                     placeholderTextColor={'rgba(80,80,80,0.5)'}
                     placeholder="Enter State Name"
                     returnKeyType={"done"}
                     style={{ height: 50, borderRadius: 5, width: "80%", fontSize: 15, fontFamily: 'AvenirLTStd-Book', color: '#1c1c1c' }}
                     onChangeText={(text) => {
                        this.filterStates(text);
                     }}
                  />
                  <TouchableOpacity onPress={() => { this.setState({ isStateModalVisible: false }) }} style={style.cancelButtonTextModal}>
                     <Fontisto name="close-a" size={Platform.OS == "ios" ? 10 : 18} color={'black'} style={{ marginTop: 4 }} />
                  </TouchableOpacity>
               </View>
               <FlatList
                  scrollEnabled
                  contentContainerStyle={{paddingHorizontal: 15}}
                  data={this.state.filteredStates.length == 0 ? ["Result Not Found"] : this.state.filteredStates}
                  renderItem={({ item }) => this.renderItem(item)}
                  keyExtractor={(item, index) => index.toString()}
                  ItemSeparatorComponent={()=> <View style={style.borderInModal}/>}
               />
            </SafeAreaView>
         </Modal1>
      )
   }

   renderItem = (state: any) => {
      return (
         <TouchableOpacity style={{ paddingVertical: 15 }}
            onPress={() => {
               if (state != "Result Not Found") {
                  this.setState({
                     state_billing: state,
                     stateCode: state.code,
                     selectedState: state.name,
                     isStateModalVisible: false
                  })
               } else {
                  this.setState({ isStateModalVisible: false })
               }
            }}>
            <Text style={{ fontSize: 15, fontFamily: 'AvenirLTStd-Book', color: '#1c1c1c' }}>{state.name ? state.name : state}</Text>
         </TouchableOpacity>
      );
   }


   render() {
      return (
         <View style={style.container}>
            {/* {this.props.route.params.statusBarColor && (
               <StatusBar backgroundColor={this.props.route.params.statusBarColor} barStyle={Platform.OS == "ios" ? "dark-content" : "light-content"} />
            )} */}
            <View
               style={{
                  ...style.header,
                  backgroundColor:
                     this.props.route.params.headerColor != null ? this.props.route.params.headerColor : '#229F5F',
               }}>
               <TouchableOpacity
                  hitSlop={{right: 20, left: 20, top: 10, bottom: 10}} 
                  delayPressIn={0} 
                  onPress={() => this.props.navigation.goBack()}
               >
                  <Icon name={'Backward-arrow'} color="#fff" size={18} />
               </TouchableOpacity>
               <Text style={style.title}>Enter Address</Text>
            </View>
            <KeyboardAwareScrollView style={style.body}>
               <Text style={style.BMfieldTitle}>Address</Text>
               <TextInput
                  placeholder={"Enter Address"}
                  style={{
                     borderColor: '#D9D9D9',
                     borderBottomWidth: 1,
                     paddingVertical: 5,
                     marginTop: Platform.OS == "ios" ? 10 : 0,
                     fontFamily: FONT_FAMILY.regular,
                  }}
                  multiline
                  onChangeText={(text) => this.setState({ address: text })}
                  value={this.state.address}></TextInput>
               <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                  <Text style={style.BMfieldTitle}>Country</Text>
                  <Text style={{ color: '#E04646', marginTop: 20 }}>*</Text>
               </View>
               <View style={{ flex: 1,backgroundColor: this.props.route.params.dontChangeCountry ? '#F1F1F2' : '', }}>
                  <CountryPicker
                     modalProps={this.props.route.params.dontChangeCountry ? { visible: false } : null}
                     countryCode={this.state.selectedCountry.alpha2CountryCode != null ? this.state.selectedCountry.alpha2CountryCode
                        : (this.state.selectedCountry.countryCode != null ? this.state.selectedCountry.countryCode : this.state.companyCountryDetails.alpha2CountryCode)}
                     countryCodes={allcountryCode}
                     theme={{
                        fontSize: 15, flagSizeButton: 15,
                        fontFamily: 'AvenirLTStd-Book', primaryColor: '#1c1c1c',
                     }}
                     withFilter={true}
                     withFlag={false}
                     withCountryNameButton={true}
                     withAlphaFilter={true}
                     withCallingCode={true}
                     withEmoji={true}
                     filterProps={{marginHorizontal: 10}}
                     closeButtonStyle={{position: 'absolute', right: -5, zIndex: 1}}
                     flatListProps={{contentContainerStyle: { paddingLeft: 10 }}}
                     onSelect={this.setCountrySelected}
                  />
                  <View style={{
                     borderBottomWidth: 0.5,
                     paddingTop: 0,
                     backgroundColor:"red",
                     borderBottomColor: '#808080',
                     marginTop: 5,
                     //paddingBottom: 10,
                  }} />
               </View>
               {/* <Dropdown
                  disabled={this.props.route.params.dontChangeCountry}
                  ref={(ref) => (this.state.addresssDropDown = ref)}
                  style={{
                     borderBottomWidth: 0.5,
                     paddingTop: 10,
                     borderBottomColor: '#808080',
                     marginTop: 10,
                     paddingBottom: 10,
                     backgroundColor: this.props.route.params.dontChangeCountry ? '#F1F1F2' : '',
                  }}
                  textStyle={{ color: '#1c1c1c', fontFamily: FONT_FAMILY.regular }}
                  defaultValue={this.state.selectedCountry.countryName != null ? this.state.selectedCountry.countryName : ''}
                  options={allCountry}
                  renderSeparator={() => {
                     return <View></View>;
                  }}
                  dropdownStyle={{ width: '90%', marginTop: 11, borderRadius: 10, height: 100 }}
                  dropdownTextStyle={{ color: '#1C1C1C', fontSize: 18, fontFamily: FONT_FAMILY.regular }}
                  renderRow={(options) => {
                     return (
                        <Text style={{ padding: 13, color: '#1C1C1C', fontFamily: FONT_FAMILY.regular }}>
                           {options.countryName}
                        </Text>
                     );
                  }}
                  renderButtonText={(text) => text.countryName}
                  onSelect={(idx, value) => this.setCountrySelected(value)}
               /> */}
               <View style={{ flexDirection: 'row' }}>
                  <Text style={style.BMfieldTitle}>State </Text>
                  {(this.state.selectedCountry.alpha2CountryCode != null ? this.state.selectedCountry.alpha2CountryCode
                     : (this.state.selectedCountry.countryCode != null ? this.state.selectedCountry.countryCode :
                        this.state.companyCountryDetails.alpha2CountryCode)) == this.state.activeCompanyCountryCode ? (
                     <Text style={{ color: '#E04646', marginTop: 20 }}>*</Text>
                  ) : null}
               </View>
               <View style={{ flexDirection: 'row' }}>
                  {/* <View>
                     <Dropdown
                        ref={(ref) => (this.state.stateDropDown = ref)}
                        style={{
                           width: 0,
                           height: 0,
                        }}
                        options={this.state.filteredStates.length == 0 ? ["Result Not Found"] : this.state.filteredStates}
                        renderSeparator={() => {
                           return <View></View>;
                        }}
                        dropdownStyle={{ width: '90%', marginTop: 39, borderRadius: 10, height: this.state.filteredStates.length > 1 ? 100 : 50 }}
                        dropdownTextStyle={{ color: '#1C1C1C', fontSize: 18, fontFamily: FONT_FAMILY.regular }}
                        renderRow={(options) => {
                           return (
                              <Text style={{ padding: 13, color: '#1C1C1C', fontFamily: FONT_FAMILY.regular }}>{options.name ? options.name : "Result Not Found"}</Text>
                           );
                        }}
                        renderButtonText={(text) => ''}
                        onSelect={(idx, value) => {
                           if (value != "Result Not Found") {
                              this.setState({
                                 state_billing: value,
                                 stateCode: value.code,
                                 selectedState: value
                              })
                           }
                        }}
                     />
                  </View> */}
                  <TouchableOpacity
                     style={{
                        flex: 1, backgroundColor: this.state.selectStateDisable ? '#F1F1F2' : null,
                     }}
                     onPress={() => {
                        if (!this.state.selectStateDisable) {
                           this.setState({
                              isStateModalVisible: !this.state.isStateModalVisible,
                              filteredStates: this.state.allStates
                           })
                        }
                     }}>
                     <Text
                        style={{
                           flex: 1,
                           color: '#1c1c1c',
                           fontSize: 14,
                           fontFamily: FONT_FAMILY.regular,
                           marginTop: Platform.OS == "ios" ? 10 : 0,
                           paddingTop: 5,
                        }}
                     >{this.state.selectedState == null || this.state.selectedState == undefined || this.state.selectedState == "" ? <Text style={{ color: 'rgba(80,80,80,0.5)' }}>Enter State</Text> : this.state.selectedState}</Text>
                     <View style={{
                        borderBottomWidth: 0.5,
                        paddingTop: 0,
                        borderBottomColor: '#808080',
                        marginTop: 0,
                        paddingBottom: 10,
                     }} />
                  </TouchableOpacity>
                  {/* <TextInput
                     editable={this.state.selectStateDisable ? false : true}
                     placeholder={"Enter State name"}
                     placeholderTextColor={'rgba(80,80,80,0.5)'}
                     style={{
                        flex: 1,
                        color: '#1c1c1c',
                        fontSize: 14,
                        fontFamily: FONT_FAMILY.regular,
                        borderBottomWidth: 0.7,
                        marginTop: Platform.OS == "ios" ? 10 : 0,
                        borderBottomColor: '#808080',
                        paddingVertical: 5,
                        backgroundColor: this.state.selectStateDisable ? '#F1F1F2' : null,
                     }}
                     enabled={this.state.allStates.length == 0 ? false : !this.state.selectStateDisable}
                     defaultValue={this.state.allStates.length == 0 ? 'State not available' : this.state.state_billing.name != null ? this.state.state_billing.name : this.state.state_billing}
                     value={this.state.selectedState}
                     onChangeText={(text) => {
                        this.setState({
                           selectedState: text
                        })
                        setTimeout(() => {
                           this.filterStates(text);
                        }, 2000);
                     }}
                  /> */}
               </View>
               {this.state.allStates.length > 0 ?
                  ((this.state.selectedCountry.alpha2CountryCode != null ? this.state.selectedCountry.alpha2CountryCode
                     : (this.state.selectedCountry.countryCode != null ? this.state.selectedCountry.countryCode :
                        this.state.companyCountryDetails.alpha2CountryCode))
                     == "IN" ?
                     <Text style={style.BMfieldTitle}>GSTIN</Text> :
                     <Text style={style.BMfieldTitle}>TRN</Text>)
                  : null}
               {this.state.allStates.length > 0 ? <TextInput
                  placeholder={(this.state.selectedCountry.alpha2CountryCode != null ? this.state.selectedCountry.alpha2CountryCode
                     : (this.state.selectedCountry.countryCode != null ? this.state.selectedCountry.countryCode :
                        this.state.companyCountryDetails.alpha2CountryCode))
                     == "IN" ? "Enter GSTIN" : "Enter TRN"}
                  placeholderTextColor={'rgba(80,80,80,0.5)'}
                  style={{
                     borderColor: '#D9D9D9',
                     borderBottomWidth: 1,
                     paddingVertical: 5,
                     marginTop: Platform.OS == "ios" ? 10 : 0,
                     fontFamily: FONT_FAMILY.regular,
                  }}
                  onChangeText={(text) => {
                     this.setState({ gstNo: text }), this.findState(text);
                  }}
                  value={this.state.gstNo}></TextInput> : null}
               {this.state.gstNumberWrong ? (
                  <Text style={{ fontSize: 10, color: 'red', marginTop: 6, marginLeft: 5, fontFamily: FONT_FAMILY.regular }}>
                     Invalid GSTIN Number
                  </Text>
               ) : null}

               <Text style={style.BMfieldTitle}>PinCode</Text>
               <TextInput
                  placeholder={"Enter PinCode"}
                  placeholderTextColor={'rgba(80,80,80,0.5)'}
                  returnKeyType={'done'}
                  keyboardType="number-pad"
                  style={{
                     borderColor: '#D9D9D9',
                     borderBottomWidth: 1,
                     paddingVertical: 5,
                     marginTop: Platform.OS == "ios" ? 10 : 0,
                     fontFamily: FONT_FAMILY.regular,
                  }}
                  onChangeText={(text) => this.setState({ pinCode: text })}
                  value={this.state.pinCode}></TextInput>
               {/* <View style={style.DefaultAddress}>
            <TouchableOpacity onPress={() => this.setState({ isDefault: !this.state.isDefault })}>
              {this.state.isDefault ? (
                <AntDesign name="checksquare" size={20} color={'#229F5F'} />
              ) : (
                <Fontisto name="checkbox-passive" size={20} color={'#CCCCCC'} />
              )}
            </TouchableOpacity>
            <Text style={style.DefaultAddressText}>Default Address</Text>
          </View> */}
            </KeyboardAwareScrollView>
            <TouchableOpacity style={style.button} onPress={() => this.onSubmit()}>
               <Text style={style.buttonText}>Save</Text>
            </TouchableOpacity>
            {this.renderStateModalView()}
            {this.state.loading && (
               <View
                  style={{
                     justifyContent: 'center',
                     alignItems: 'center',
                     position: 'absolute',
                     backgroundColor: 'rgba(0,0,0,0)',
                     left: 0,
                     right: 0,
                     bottom: 0,
                     top: 0,
                  }}>
                  {/* <Bars size={15} color={color.PRIMARY_NORMAL} /> */}
                  <LoaderKit
                     style={{ width: 45, height: 45 }}
                     name={'LineScale'}
                     color={color.PRIMARY_NORMAL}
                  />
               </View>
            )}
         </View>
      );
   }
}

export default EditAddress;