import React from 'react';
import {View, Text, TouchableOpacity, FlatList, Dimensions, Platform, PermissionsAndroid, Animated} from 'react-native';
import style from './style';
import Icon from '@/core/components/custom-icon/custom-icon';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import AddressItem from './AddressItem';
import {TextInput} from 'react-native-gesture-handler';

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

export class SelectAddress extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      activeIndex: 0,
    };
  }

  changeactiveIndex = (value: number) => {
    this.setState({activeIndex: value});
  };

  render() {
    return (
      <View style={style.container}>
        <View style={style.header}>
          <TouchableOpacity delayPressIn={0}>
            <Icon name={'Backward'} color="#fff" size={18} />
          </TouchableOpacity>
          <Text style={style.title}>Change Address</Text>
          <TouchableOpacity delayPressIn={0} style={style.editButton}>
            <Text style={style.edit}>Edit</Text>
          </TouchableOpacity>
        </View>
        <View style={style.body}>
          <FlatList
            data={addresses}
            renderItem={({item, index}) => (
              <AddressItem
                index={index}
                item={item}
                activeIndex={this.state.activeIndex}
                changeactiveIndex={this.changeactiveIndex}
              />
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>
        <TouchableOpacity style={style.button}>
          <Text style={style.buttonText}>Select</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

export default SelectAddress;
