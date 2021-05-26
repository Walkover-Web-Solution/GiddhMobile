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
} from 'react-native';
import style from './style';
import Icon from '@/core/components/custom-icon/custom-icon';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import AddressItem from './AddressItem';
import { TextInput } from 'react-native-gesture-handler';

const { height, width } = Dimensions.get('window');

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

export class SelectAddress extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      activeIndex: 0,
      editAddress: false,
      addressList: this.props.route.params.type == 'address' ? (this.props.route.params.addressArray.length > 0 ? [...this.props.route.params.addressArray] : []) :
        (this.props.route.params.warehouseArray.length > 0 ? [...this.props.route.params.warehouseArray] : []),
      newList: [],
      // this.props.route.params.type == 'warehouse'
      //   ? this.props.route.params.warehouseArray
      //   : ,
      selectedAddress: {},
    };
  }

  changeactiveIndex = (value: number) => {
    this.setState({ activeIndex: value });
  };

  addAddress = (address) => {
    let arr = [...this.state.addressList];
    arr.push(address);
    // console.log('as expected', arr);
    this.setState({ addressList: arr });
    // console.log(address);
  };

  render() {
    return (
      <View style={style.container}>
        {this.props.route.params.statusBarColor && (
          <StatusBar backgroundColor={this.props.route.params.statusBarColor} barStyle="light-content" />
        )}
        <View
          style={[
            style.header,
            { backgroundColor: this.props.route.params.color ? this.props.route.params.color : '#229F5F' },
          ]}>
          <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
            <Icon name={'Backward-arrow'} color="#fff" size={18} />
          </TouchableOpacity>
          <Text style={style.title}>
            {this.props.route.params.type == 'warehouse' ? 'Select Warehouse' : 'Select Address'}
          </Text>
          {/* {this.props.route.params.type == 'address' ?
            <TouchableOpacity
              style={{ position: 'absolute', right: 20 }}
              onPress={() =>
                this.props.navigation.navigate('EditAddress', {
                  dontChangeCountry:true,
                  address:
                    this.state.addressList.length > 0
                      ? this.state.addressList[this.state.activeIndex]
                      : {
                        address: '',
                        gstNumber: '',
                        state: {
                          code: '',
                          name: '',
                        },
                        stateCode: '',
                        stateName: '',
                      },
                  selectAddress: this.addAddress,
                  statusBarColor: '#ef6c00',
                  headerColor: '#FC8345',
                })
              }>
              <Text style={{ color: '#fff', fontFamily: 'AvenirLTStd-Black' }}>Add Address</Text>
            </TouchableOpacity>
            : null} */}
        </View>
        <View style={{ height: height * 0.8 }}>
          <FlatList
            data={this.state.addressList}
            renderItem={({ item, index }) => (
              <AddressItem
                index={index}
                type={this.props.route.params.type}
                item={item}
                activeIndex={this.state.activeIndex}
                changeactiveIndex={this.changeactiveIndex}
                color={this.props.route.params.color ? this.props.route.params.color : '#229F5F'}
              />
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>
        <TouchableOpacity
          style={style.button}
          onPress={() => {
            this.props.route.params.selectAddress(this.state.addressList[this.state.activeIndex]);
            this.props.navigation.goBack();
            // console.log(this.props.route.params.addressArray);
          }}
        // onPress={() => console.log(this.state.array)}
        >
          <Text style={style.buttonText}>Select</Text>
        </TouchableOpacity>
        {/* {this.state.editAddress && this._renderBottomSheetForItemDetails()} */}
      </View>
    );
  }
}

export default SelectAddress;
