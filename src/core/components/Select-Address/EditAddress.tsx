import React from 'react';
import { View, Text, TouchableOpacity, FlatList, Dimensions, StatusBar, PermissionsAndroid, Animated, Alert } from 'react-native';
import style from './style';
import Icon from '@/core/components/custom-icon/custom-icon';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import AddressItem from './AddressItem';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Fontisto from 'react-native-vector-icons/Fontisto';
const { height, width } = Dimensions.get('window');
import { alias } from 'yargs';

const addresses = [
  {
    address: 'Thergaon , Pune, Mob. No. 9850778048, 5454 ols palasia near saker and greater kailesh hoshpital,  indore',
    gstinStatus: 'VERIFIED',
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
    address: 'Thergaon , Pune, Mob. No. 9850778048, 5454 ols palasia near saker and greater kailesh hoshpital,  indore',
    gstinStatus: 'VERIFIED',
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
    address: 'Thergaon , Pune, Mob. No. 9850778048, 5454 ols palasia near saker and greater kailesh hoshpital,  indore',
    gstinStatus: 'VERIFIED',
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
    address: 'Thergaon , Pune, Mob. No. 9850778048, 5454 ols palasia near saker and greater kailesh hoshpital,  indore',
    gstinStatus: 'VERIFIED',
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
    address: 'Thergaon , Pune, Mob. No. 9850778048, 5454 ols palasia near saker and greater kailesh hoshpital,  indore',
    gstinStatus: 'VERIFIED',
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
    address: 'Thergaon , Pune, Mob. No. 9850778048, 5454 ols palasia near saker and greater kailesh hoshpital,  indore',
    gstinStatus: 'VERIFIED',
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
    address: 'Thergaon , Pune, Mob. No. 9850778048, 5454 ols palasia near saker and greater kailesh hoshpital,  indore',
    gstinStatus: 'VERIFIED',
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
    address: 'Thergaon , Pune, Mob. No. 9850778048, 5454 ols palasia near saker and greater kailesh hoshpital,  indore',
    gstinStatus: 'VERIFIED',
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
      activeIndex: 0,
      editAddress: false,
      isDefault: false,
      address:  this.props.route.params.addressArray.address!=null?this.props.route.params.addressArray.address:"",
      state: this.props.route.params.addressArray.stateName!=null?this.props.route.params.addressArray.stateName:"",
      country: this.props.route.params.addressArray.countryName!=null?this.props.route.params.addressArray.countryName:"",
      gstNo: this.props.route.params.addressArray.gstNumber!=null?this.props.route.params.addressArray.gstNumber:"",
      pinCode: this.props.route.params.addressArray.pincode!=null?this.props.route.params.addressArray.pincode:""
    };
  }

  changeactiveIndex = (value: number) => {
    this.setState({ activeIndex: value });
  };

  getStateCode = (displayName: any) => {
    var stateCode = displayName.charAt(0).toUpperCase();
    if (displayName.includes(" ")) {
      stateCode += displayName.charAt(displayName.indexOf(" ", 0) + 1).toUpperCase();
    }
    return stateCode
  }

  onSubmit = () => {
    if (this.state.state == "" || this.state.country == "") {
      alert("Please Enter Country and State Name")
    } else {
      const stateCode = this.getStateCode(this.state.state)
      var address = {
        address: this.state.address,
        state: {
          code: stateCode,
          name: this.state.state
        },
        gstNumber: this.state.gstNo,
        pincode: this.state.pinCode,
        countryName: this.state.country,
        stateCode: stateCode,
        stateName: this.state.state
      }
      this.props.route.params.selectAddress(address);
      this.props.navigation.goBack();

    }
  }

  render() {
    return (
      <View style={style.container}>
        {this.props.route.params.statusBarColor && <StatusBar backgroundColor={this.props.route.params.statusBarColor} barStyle="light-content" />}
        <View style={style.header}>
          <TouchableOpacity delayPressIn={0} onPress={() => this.props.navigation.goBack()}>
            <Icon name={'Backward-arrow'} color="#fff" size={18} />
          </TouchableOpacity>
          <Text style={style.title}>Enter Address</Text>
        </View>
        <ScrollView style={style.body}>
          <Text style={style.BMfieldTitle}>Address</Text>
          <TextInput
            style={{ borderColor: '#D9D9D9', borderBottomWidth: 1, paddingVertical: 5, paddingHorizontal: 0 }}
            multiline
            onChangeText={(text) => this.setState({ address: text })}
            value={this.state.address}></TextInput>
          <Text style={style.BMfieldTitle}>Country</Text>
          <TextInput
            style={{ borderColor: '#D9D9D9', borderBottomWidth: 1, paddingVertical: 5 }}
            onChangeText={(text) => this.setState({ country: text })}
            value={this.state.country}></TextInput>
          <Text style={style.BMfieldTitle}>State</Text>
          <TextInput
            style={{ borderColor: '#D9D9D9', borderBottomWidth: 1, paddingVertical: 5 }}
            onChangeText={(text) => this.setState({ state: text })}
            value={this.state.state}></TextInput>
          <Text style={style.BMfieldTitle}>GSTIN</Text>
          <TextInput
            style={{ borderColor: '#D9D9D9', borderBottomWidth: 1, paddingVertical: 5 }}
            onChangeText={(text) => this.setState({ gstNo: text })}
            value={this.state.gstNo}></TextInput>
          <Text style={style.BMfieldTitle}>PinCode</Text>
          <TextInput
            style={{ borderColor: '#D9D9D9', borderBottomWidth: 1, paddingVertical: 5 }}
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
      </View>
    );
  }
}

export default EditAddress;
