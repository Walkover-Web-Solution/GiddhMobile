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
      editAddress: false,
      array:
        this.props.route.params.type == 'warehouse'
          ? this.props.route.params.warehouseArray
          : this.props.route.params.addressArray,
    };
  }

  changeactiveIndex = (value: number) => {
    this.setState({activeIndex: value});
  };

  _renderBottomSheetForItemDetails() {
    return (
      <View style={style.BSContainer}>
        <TouchableOpacity
          style={{backgroundColor: 'black', opacity: 0.5, width: '100%', height: '100%', position: 'absolute'}}
          onPress={() => {
            this.setState({editAddress: false});
          }}
        />
        <View style={style.BMinnerContainer}>
          <View style={style.BMHeader}>
            <TouchableOpacity onPress={() => this.setState({editAddress: false})}>
              <Icon name={'Backward'} color="#000" size={18} />
            </TouchableOpacity>
            <Text style={style.BMTitle}>Edit Address</Text>
          </View>
          <Text style={style.BMfieldTitle}>Address</Text>
          <TextInput
            style={{borderColor: '#D9D9D9', borderBottomWidth: 1, paddingVertical: 5}}
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
          <TouchableOpacity style={style.button}>
            <Text style={style.buttonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  render() {
    return (
      <View style={style.container}>
        <View style={style.header}>
          <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
            <Icon name={'Backward-arrow'} color="#fff" size={18} />
          </TouchableOpacity>
          <Text style={style.title}>
            {this.props.route.params.type == 'warehouse' ? 'Select Warehouse' : 'Select Address'}
          </Text>
          {this.props.route.params.type != 'warehouse' && (
            <TouchableOpacity
              delayPressIn={0}
              style={style.editButton}
              onPress={() => this.props.navigation.navigate('EditAddress')}>
              <Text style={style.edit}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={{height: height * 0.8}}>
          <FlatList
            data={this.state.array}
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
        <TouchableOpacity
          style={style.button}
          onPress={() =>
            this.props.route.params.type == 'warehouse'
              ? this.props.navigation.navigate('InvoiceOtherDetailScreen', {
                  selectedWareHouse: this.state.array[this.state.activeIndex],
                })
              : this.props.navigation.navigate('SalesInvoiceScreen')
          }>
          <Text style={style.buttonText}>Select</Text>
        </TouchableOpacity>
        {/* {this.state.editAddress && this._renderBottomSheetForItemDetails()} */}
      </View>
    );
  }
}

export default SelectAddress;
