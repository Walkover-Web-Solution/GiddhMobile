import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
  StatusBar,
  PermissionsAndroid,
  Animated,
  Alert,
} from 'react-native';
import style from './style';
import Icon from '@/core/components/custom-icon/custom-icon';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
const { height, width } = Dimensions.get('window');
import { Bars } from 'react-native-loader';
import Dropdown from 'react-native-modal-dropdown';
import color from '@/utils/colors';
import { CustomerVendorService } from '@/core/services/customer-vendor/customer-vendor.service';
import { FONT_FAMILY } from '@/utils/constants';
import AsyncStorage from '@react-native-community/async-storage';
import { STORAGE_KEYS } from '@/utils/constants';

const addresses = [
  {
    address: 'Thergaon , Pune, Mob. No. 9850778048, 5454 ols palasia near saker and greater kailesh hoshpital,  indore', gstinStatus: 'VERIFIED',
    gstNumber: '27BKWPS7554Q1ZN',
    isComposite: false,
    isDefault: true,
    partyType: 'NOT APPLICABLE',
    state: { stateGstCode: '37', name: 'Andhra Pradesh', code: 'AP' },
    stateCode: 'AP',
    stateCodeString: '37',
    stateGstCode: '37',
    stateName: 'Andhra Pradesh',
  },
  {
    address: 'Thergaon , Pune, Mob. No. 9850778048, 5454 ols palasia near saker and greater kailesh hoshpital,  indore', gstinStatus: 'VERIFIED',
    gstNumber: '27BKWPS7554Q1ZN',
    isComposite: false,
    isDefault: true,
    partyType: 'NOT APPLICABLE',
    state: { stateGstCode: '37', name: 'Andhra Pradesh', code: 'AP' },
    stateCode: 'AP',
    stateCodeString: '37',
    stateGstCode: '37',
    stateName: 'Andhra Pradesh',
  },
  {
    address: 'Thergaon , Pune, Mob. No. 9850778048, 5454 ols palasia near saker and greater kailesh hoshpital,  indore', gstinStatus: 'VERIFIED',
    gstNumber: '27BKWPS7554Q1ZN',
    isComposite: false,
    isDefault: true,
    partyType: 'NOT APPLICABLE',
    state: { stateGstCode: '37', name: 'Andhra Pradesh', code: 'AP' },
    stateCode: 'AP',
    stateCodeString: '37',
    stateGstCode: '37',
    stateName: 'Andhra Pradesh',
  },
  {
    address: 'Thergaon , Pune, Mob. No. 9850778048, 5454 ols palasia near saker and greater kailesh hoshpital,  indore', gstinStatus: 'VERIFIED',
    gstNumber: '27BKWPS7554Q1ZN',
    isComposite: false,
    isDefault: true,
    partyType: 'NOT APPLICABLE',
    state: { stateGstCode: '37', name: 'Andhra Pradesh', code: 'AP' },
    stateCode: 'AP',
    stateCodeString: '37',
    stateGstCode: '37',
    stateName: 'Andhra Pradesh',
  },
  {
    address: 'Thergaon , Pune, Mob. No. 9850778048, 5454 ols palasia near saker and greater kailesh hoshpital,  indore', gstinStatus: 'VERIFIED',
    gstNumber: '27BKWPS7554Q1ZN',
    isComposite: false,
    isDefault: true,
    partyType: 'NOT APPLICABLE',
    state: { stateGstCode: '37', name: 'Andhra Pradesh', code: 'AP' },
    stateCode: 'AP',
    stateCodeString: '37',
    stateGstCode: '37',
    stateName: 'Andhra Pradesh',
  },
  {
    address: 'Thergaon , Pune, Mob. No. 9850778048, 5454 ols palasia near saker and greater kailesh hoshpital,  indore', gstinStatus: 'VERIFIED',
    gstNumber: '27BKWPS7554Q1ZN',
    isComposite: false,
    isDefault: true,
    partyType: 'NOT APPLICABLE',
    state: { stateGstCode: '37', name: 'Andhra Pradesh', code: 'AP' },
    stateCode: 'AP',
    stateCodeString: '37',
    stateGstCode: '37',
    stateName: 'Andhra Pradesh',
  },
  {
    address: 'Thergaon , Pune, Mob. No. 9850778048, 5454 ols palasia near saker and greater kailesh hoshpital,  indore', gstinStatus: 'VERIFIED',
    gstNumber: '27BKWPS7554Q1ZN',
    isComposite: false,
    isDefault: true,
    partyType: 'NOT APPLICABLE',
    state: { stateGstCode: '37', name: 'Andhra Pradesh', code: 'AP' },
    stateCode: 'AP',
    stateCodeString: '37',
    stateGstCode: '37',
    stateName: 'Andhra Pradesh',
  },
  {
    address: 'Thergaon , Pune, Mob. No. 9850778048, 5454 ols palasia near saker and greater kailesh hoshpital,  indore', gstinStatus: 'VERIFIED',
    gstNumber: '27BKWPS7554Q1ZN',
    isComposite: false,
    isDefault: true,
    partyType: 'NOT APPLICABLE',
    state: { stateGstCode: '37', name: 'Andhra Pradesh', code: 'AP' },
    stateCode: 'AP',
    stateCodeString: '37',
    stateGstCode: '37',
    stateName: 'Andhra Pradesh',
  },
];

export class EditAddress extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      addresssDropDown: Dropdown,
      selectStateDisable: false,
      gstNumberWrong: false,
      allStates: [],
      allCountry: [],
      activeIndex: 0,
      editAddress: false,
      isDefault: false,
      // For Cash Invoice country name
      selectedCountry:
        this.props.route.params.addressArray.selectedCountry != null
          ? this.props.route.params.addressArray.selectedCountry
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
      address: this.props.route.params.addressArray.address != null ? this.props.route.params.addressArray.address : '',
      state_billing:
        this.props.route.params.addressArray.stateName != null && this.props.route.params.addressArray.stateName != ''
          ? this.props.route.params.addressArray.stateName
          : 'Select',
      gstNo:
        this.props.route.params.addressArray.gstNumber != null ? this.props.route.params.addressArray.gstNumber : '',
      pinCode: this.props.route.params.addressArray.pincode != null ? this.props.route.params.addressArray.pincode : '',
      loading: false,
      activeCompanyCountryCode: ""
    };
  }

  componentDidMount() {
    this.getDetails();
  }

  getDetails = async () => {
    this.setState({ loading: true });
    if (this.state.gstNo != '') {
      this.setState({ selectStateDisable: true });
    }
    let activeCompanyCountryCode = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyCountryCode);
    let allCountry = await CustomerVendorService.getAllCountryName();
    const countryIndia = {
      alpha3CountryCode: 'IND',
      alpha2CountryCode: 'IN',
      countryName: 'India',
      callingCode: '91',
      currency: {
        code: 'INR',
        symbol: '₹',
      },
      countryIndia: true,
    };
    await this.setState({
      activeCompanyCountryCode: activeCompanyCountryCode,
      allCountry: allCountry.body,
      selectedCountry:
        this.props.route.params.addressArray.selectedCountry != null
          ? this.props.route.params.addressArray.selectedCountry
          : countryIndia,
    });
    console.log(this.state.selectedCountry);
    let allStateName = await CustomerVendorService.getAllStateName(this.state.selectedCountry.alpha2CountryCode);
    await this.setState({
      allStates: allStateName.body.stateList,
    });
    await this.setState({ loading: false });
  }

  changeactiveIndex = (value: number) => {
    this.setState({ activeIndex: value });
  };

  onSubmit = () => {
    console.log("state" + this.state.state_billing == "");
    console.log("country" + this.state.selectedCountry);
    if (this.state.selectedCountry.countryName == "") {
      alert("Please Enter Country Name");
    } else if (this.state.selectedCountry.alpha2CountryCode == this.state.activeCompanyCountryCode && this.state.state_billing == "Select") {
      alert("Please Enter State Name");
    }
    else if (this.state.gstNo && this.state.gstNo.length != 15) {
      alert("Enter a valid gst number, should be 15 characters long");
    } else if (this.state.gstNumberWrong) {
      alert('Enter a valid gst number');
    } else {
      var address = {
        address: this.state.address,
        gstNumber: this.state.gstNo,
        pincode: this.state.pinCode,
        selectedCountry: this.state.selectedCountry,
        state: this.state.state_billing != "Select" ? this.state.state_billing : "",
        stateCode: this.state.state_billing.code,
        stateName: this.state.state_billing.name,
      };
      this.props.route.params.selectAddress(address);
      this.props.navigation.goBack();
    }
  };

  setCountrySelected = async (value: any) => {
    await this.setState({ loading: true });
    await this.setState({
      state_billing: 'Select',
      gstNo: '',
      selectedCountry: value,
      countryName: value.countryNamem,
      selectStateDisable: false,
      gstNumberWrong: false,
    });
    let allStateName = await CustomerVendorService.getAllStateName(value.alpha2CountryCode);
    await this.setState({ allStates: allStateName.body.stateList });
    await this.state.addresssDropDown.select(-1);
    await this.setState({ loading: false });
  };

  findState = async (gstNo: any) => {
    if (gstNo == '') {
      this.setState({ selectStateDisable: false, gstNumberWrong: false });
      return;
    }
    const gstStateCode = await gstNo.slice(0, 2);
    for (var i = 0; i < this.state.allStates.length; i++) {
      if (this.state.allStates[i].stateGstCode == gstStateCode) {
        await this.setState({ state_billing: this.state.allStates[i], selectStateDisable: true });
        await this.state.addresssDropDown.select(-1);
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

  render() {
    return (
      <View style={style.container}>
        {this.props.route.params.statusBarColor && (
          <StatusBar backgroundColor={this.props.route.params.statusBarColor} barStyle="light-content" />
        )}
        <View
          style={{
            ...style.header,
            backgroundColor:
              this.props.route.params.headerColor != null ? this.props.route.params.headerColor : '#229F5F',
          }}>
          <TouchableOpacity delayPressIn={0} onPress={() => this.props.navigation.goBack()}>
            <Icon name={'Backward-arrow'} color="#fff" size={18} />
          </TouchableOpacity>
          <Text style={style.title}>Enter Address</Text>
        </View>
        <ScrollView style={style.body}>
          <Text style={style.BMfieldTitle}>Address</Text>
          <TextInput
            style={{ borderColor: '#D9D9D9', borderBottomWidth: 1, paddingVertical: 5, paddingHorizontal: 10,fontFamily: FONT_FAMILY.regular }}
            multiline
            onChangeText={(text) => this.setState({ address: text })}
            value={this.state.address}></TextInput>
          <View style={{ flexDirection: 'row' }}>
            <Text style={style.BMfieldTitle}>Country</Text>
            <Text style={{ color: "#E04646", marginTop: 20 }}>*</Text>
          </View>
          <Dropdown
            disabled={this.props.route.params.dontChangeCountry}
            ref={(ref) => this.state.addresssDropDown = ref}
            style={{
              marginVertical: 10,
              borderBottomWidth: 0.5,
              paddingTop: 10,
              borderBottomColor: '#808080',
              paddingBottom: 10,
              marginTop: 15,
              paddingHorizontal: 10,
              backgroundColor: this.props.route.params.dontChangeCountry ? "#F1F1F2" : ""
            }}
            textStyle={{ color: '#1c1c1c' ,fontFamily: FONT_FAMILY.regular}}
            defaultValue={this.state.selectedCountry.countryName != null ? this.state.selectedCountry.countryName : ''}
            options={this.state.allCountry}
            renderSeparator={() => {
              return <View></View>;
            }}
            dropdownStyle={{ width: '90%', marginTop: 5, borderRadius: 10 }}
            dropdownTextStyle={{ color: '#1C1C1C', fontSize: 18, fontFamily: FONT_FAMILY.regular }}
            renderRow={(options) => {
              return <Text style={{ padding: 13, color: '#1C1C1C',fontFamily: FONT_FAMILY.regular }}>{options.countryName}</Text>;
            }}
            renderButtonText={(text) => text.countryName}
            onSelect={(idx, value) => this.setCountrySelected(value)}
          />
          <View style={{ flexDirection: 'row' }}>
            <Text style={style.BMfieldTitle}>State </Text>
            {this.state.selectedCountry.alpha2CountryCode == this.state.activeCompanyCountryCode ? <Text style={{ color: "#E04646", marginTop: 20 }}>*</Text> : null}
          </View>
          <Dropdown
            disabled={this.state.allStates.length==0 ?true:this.state.selectStateDisable}
            ref={(ref) => (this.state.addresssDropDown = ref)}
            style={{
              marginVertical: 10,
              borderBottomWidth: 0.5,
              paddingTop: 10,
              borderBottomColor: '#808080',
              paddingBottom: 10,
              marginTop: 15,
              paddingHorizontal: 10,
              backgroundColor: this.state.selectStateDisable ? "#F1F1F2" : null
            }}
            textStyle={{ color: '#1c1c1c', fontSize: 14, fontFamily: FONT_FAMILY.regular}}
            defaultValue={
              this.state.state_billing.name != null ? this.state.state_billing.name : this.state.state_billing
            }
            options={this.state.allStates}
            renderSeparator={() => {
              return <View></View>;
            }}
            dropdownStyle={{ width: '90%', marginTop: 5, borderRadius: 10,}}
            dropdownTextStyle={{ color: '#1C1C1C', fontSize: 18, fontFamily: FONT_FAMILY.regular }}
            renderRow={(options) => {
              return <Text style={{ padding: 13, color: '#1C1C1C',fontFamily: FONT_FAMILY.regular }}>{options.name}</Text>;
            }}
            renderButtonText={(text) => text.name}
            onSelect={(idx, value) => this.setState({ state_billing: value })}
          />
          {this.state.allStates.length==0 ? (
            <Text style={{ fontSize: 10, marginTop: 6, marginLeft: 5,fontFamily: FONT_FAMILY.regular }}>No State Present in Current Country</Text>
          ) : null}
          <Text style={style.BMfieldTitle}>GSTIN</Text>
          <TextInput
            style={{
              borderColor: '#D9D9D9', borderBottomWidth: 1, paddingVertical: 5, paddingHorizontal: 10,fontFamily: FONT_FAMILY.regular
            }}
            onChangeText={(text) => {
              this.setState({ gstNo: text }), this.findState(text);
            }}
            value={this.state.gstNo}></TextInput>
          {this.state.gstNumberWrong ? (
            <Text style={{ fontSize: 10, color: 'red', marginTop: 6, marginLeft: 5,fontFamily: FONT_FAMILY.regular }}>Invalid GSTIN Number</Text>
          ) : null}

          <Text style={style.BMfieldTitle}>PinCode</Text>
          <TextInput
            style={{
              borderColor: '#D9D9D9', borderBottomWidth: 1, paddingVertical: 5, paddingHorizontal: 10,fontFamily: FONT_FAMILY.regular
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
        </ScrollView>
        <TouchableOpacity style={style.button} onPress={() => this.onSubmit()}>
          <Text style={style.buttonText}>Save</Text>
        </TouchableOpacity>
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
            <Bars size={15} color={color.PRIMARY_NORMAL} />
          </View>
        )}
      </View>
    );
  }
}

export default EditAddress;
