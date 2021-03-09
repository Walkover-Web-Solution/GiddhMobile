import React from 'react';
import {View, Text, TouchableOpacity, FlatList, Dimensions, Platform, PermissionsAndroid, Animated} from 'react-native';
import style from './style';
import Icon from '@/core/components/custom-icon/custom-icon';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import AddressItem from './AddressItem';
import {TextInput} from 'react-native-gesture-handler';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Fontisto from 'react-native-vector-icons/Fontisto';

const {height, width} = Dimensions.get('window');

const addresses = [
  {
    address: 'Thergaon , Pune, Mob. No. 9850778048, 5454 ols palasia near saker and greater kailesh hoshpital,  indore',
    gstinStatus: 'VERIFIED',
    gstNumber: '27BKWPS7554Q1ZN',
    isComposite: false,
    isDefault: true,
    partyType: 'NOT APPLICABLE',
    state: {stateGstCode: '37', name: 'Andhra Pradesh', code: 'AP'},
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
    state: {stateGstCode: '37', name: 'Andhra Pradesh', code: 'AP'},
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
    state: {stateGstCode: '37', name: 'Andhra Pradesh', code: 'AP'},
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
    state: {stateGstCode: '37', name: 'Andhra Pradesh', code: 'AP'},
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
    state: {stateGstCode: '37', name: 'Andhra Pradesh', code: 'AP'},
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
    state: {stateGstCode: '37', name: 'Andhra Pradesh', code: 'AP'},
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
    state: {stateGstCode: '37', name: 'Andhra Pradesh', code: 'AP'},
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
    state: {stateGstCode: '37', name: 'Andhra Pradesh', code: 'AP'},
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
    };
  }

  changeactiveIndex = (value: number) => {
    this.setState({activeIndex: value});
  };

  render() {
    return (
      <View style={style.container}>
        <View style={style.header}>
          <TouchableOpacity delayPressIn={0} onPress={() => this.props.navigation.goBack()}>
            <Icon name={'Backward'} color="#fff" size={18} />
          </TouchableOpacity>
          <Text style={style.title}>Edit Address</Text>
        </View>
        <View style={style.body}>
          <Text style={style.BMfieldTitle}>Address</Text>
          <TextInput
            style={{borderColor: '#D9D9D9', borderBottomWidth: 1, paddingVertical: 5, paddingHorizontal: 0}}
            multiline
            value={addresses[0].address}></TextInput>
          <Text style={style.BMfieldTitle}>State</Text>
          <TextInput
            style={{borderColor: '#D9D9D9', borderBottomWidth: 1, paddingVertical: 5}}
            value={addresses[0].stateName}></TextInput>
          <Text style={style.BMfieldTitle}>GSTIN</Text>
          <TextInput
            style={{borderColor: '#D9D9D9', borderBottomWidth: 1, paddingVertical: 5}}
            value={addresses[0].gstNumber}></TextInput>
          <View style={style.DefaultAddress}>
            <TouchableOpacity onPress={() => this.setState({isDefault: !this.state.isDefault})}>
              {this.state.isDefault ? (
                <AntDesign name="checksquare" size={20} color={'#229F5F'} />
              ) : (
                <Fontisto name="checkbox-passive" size={20} color={'#CCCCCC'} />
              )}
            </TouchableOpacity>
            <Text style={style.DefaultAddressText}>Default Address</Text>
          </View>
        </View>

        <TouchableOpacity style={style.button} onPress={() => console.log(this.state.isDefault)}>
          <Text style={style.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

export default EditAddress;
