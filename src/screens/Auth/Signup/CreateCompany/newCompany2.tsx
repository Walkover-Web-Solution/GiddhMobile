import React from 'react';
import { connect } from 'react-redux';

import { View, TouchableOpacity, Modal, Dimensions, StatusBar, Platform, DeviceEventEmitter, ToastAndroid, FlatList, Alert } from 'react-native';
import style from './style';
import { Text } from '@ui-kitten/components';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Entypo from 'react-native-vector-icons/Entypo';
import { TextInput } from 'react-native-gesture-handler';
import Dropdown from 'react-native-modal-dropdown';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Fontisto from 'react-native-vector-icons/Fontisto';
import { CustomerVendorService } from '@/core/services/customer-vendor/customer-vendor.service';
import { STORAGE_KEYS, APP_EVENTS } from '@/utils/constants';
import AsyncStorage from '@react-native-community/async-storage';
import { CompanyService } from '@/core/services/company/company.service';
import { getCompanyAndBranches } from '../../../../redux/CommonAction';
import { Bars } from 'react-native-loader';
import color from '@/utils/colors';
import TOAST from 'react-native-root-toast';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Modal1 from 'react-native-modal';

class NewCompanyDetails extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
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
      selectStateDisable: false,
      gstNumberWrong: false,
      bussinessNature: null,
      pinCode: null,
      modalVisible: false,
      loader: false,
      countryCode: this.props.route.params.country.alpha2CountryCode,
      disbaleCreateButton: false,
      isStateModalVisible: false
    };
  }


  componentDidMount() {
    this.getStates()
  }

  componentDidUpdate(prevProps) {

  }

  componentWillUnmount() {

  }

  getStates = async () => {
    const allStateName = await CustomerVendorService.getAllStateName(this.props.route.params.country.alpha2CountryCode);
    await this.setState({
      stateData: allStateName.body.stateList,
      filteredStates: allStateName.body.stateList
    });
  }

  filterStates = (text: any) => {
    if (text == '') {
      this.setState({
        filteredStates: this.state.stateData,
      });
      // this.state.stateDropDown.show();
      return;
    }
    let newFilteredStates: any[] = [];
    for (let i = 0; i < this.state.stateData.length; i++) {
      if (this.state.stateData[i].name.toLowerCase().includes(text.toLowerCase())) {
        newFilteredStates.push(this.state.stateData[i]);
      }
    }
    this.setState({
      filteredStates: newFilteredStates,
    });
    // this.state.stateDropDown.show();
  }

  findState = (gstNo: any) => {
    if (gstNo == '' || this.state.countryCode != "IN") {
      this.setState({ selectStateDisable: false, gstNumberWrong: false, stateName: null, selectedState: null });
      return;
    }
    const gstStateCode = gstNo.slice(0, 2);
    for (let i = 0; i < this.state.stateData.length; i++) {
      if (this.state.stateData[i].stateGstCode == gstStateCode) {
        this.setState({
          stateName: this.state.stateData[i],
          selectedState: this.state.stateData[i].name,
          selectStateDisable: true,
        });
        break;
      } else {
        this.setState({ selectStateDisable: false });
      }
    }
    if (!this.state.selectStateDisable) {
      this.setState({ gstNumberWrong: true });
    } else {
      this.setState({ gstNumberWrong: false });
    }
  };

  gstValidator() {
    if (this.state.countryCode == "IN") {
      const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      const vadidatorResult = this.state.gstNumber != null && this.state.gstNumber != '' ? regex.test((this.state.gstNumber).toUpperCase()) : true;
      console.log(vadidatorResult)
      return vadidatorResult;
    } else {
      var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
      if (this.state.gstNumber != null && this.state.gstNumber != '') {
        if (format.test(this.state.gstNumber) || this.state.gstNumber.length != 15) {
          return false;
        } else {
          return true;
        }
      } else {
        return true
      }
    }
  }

  submit = async () => {
    if (this.state.bussinessType == "Registered") {
      if (this.state.gstNumber == null) {
        this.state.countryCode == "IN" ? alert('Enter GST Number') : alert('Enter TRN Number');
        return
      } else if (this.state.gstNumber && this.state.gstNumber.length != 15) {
        this.state.countryCode == "IN" ? alert('Enter a valid gst number, should be 15 characters long')
          : alert('Enter a valid TRN number, should be 15 characters long');
        return
      } else if (this.state.gstNumberWrong || !this.gstValidator()) {
        this.state.countryCode == "IN" ? alert('Enter a valid gst number') : alert('Enter a valid TRN number');;
        return
      } else if (this.state.stateName == null) {
        alert('Enter State Name');
        return
      } else if (this.state.Address == null) {
        alert('Enter Address');
        return
      }
    }
    if (this.state.pinCode!=null && this.state.pinCode.length > 15) {
      alert('Pincode can be maximum 15 digits in length');
      return
    }
    this.setState({ loader: true, disbaleCreateButton: true })
    var userEmail = await AsyncStorage.getItem(STORAGE_KEYS.googleEmail)
    var companyNameWithoutAnySpecialChar = this.props.route.params.companyName.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '').replace(/ /g, '')
    var randomString = '';
    var chars = "0123456789abcdefghijklmnopqrstuvwxyz"
    for (var i = 6; i > 0; --i) randomString += chars[Math.floor(Math.random() * chars.length)];
    var compnayUniquename = companyNameWithoutAnySpecialChar.toLowerCase() + this.props.route.params.country.alpha2CountryCode.toLowerCase() + new Date().getTime() + randomString
    const payload = {
      name: this.props.route.params.companyName,
      country: this.props.route.params.country.alpha2CountryCode,
      phoneCode: this.props.route.params.callingCode,
      contactNo: this.props.route.params.mobileNumber.replace(/[^0-9]/g, ''),
      uniqueName: compnayUniquename,
      isBranch: false,
      subscriptionRequest: {
        planUniqueName: "e6v1566224240273",// For Production, In testing we use xoh1591185630174 uniquename
        subscriptionId: "",
        userUniqueName: userEmail,
        licenceKey: ""
      },
      addresses:
        this.state.stateName == null && this.state.applicableTax == null && this.state.address == null ? [] :
          [{
            stateCode: this.state.stateName != null ? this.state.stateName.code : "",
            address: this.state.Address != null ? this.state.Address : "",
            isDefault: false,
            stateName: this.state.stateName != null ? this.state.stateName.name : "",
            taxNumber: this.state.gstNumber != null ? this.state.gstNumber : "",
            pincode: this.state.pinCode == null ? "" : this.state.pinCode
          }],
      businessNature: this.state.bussinessNature != null ? this.state.bussinessNature : "",
      businessType: this.state.bussinessType != null ? this.state.bussinessType : "",
      address: this.state.Address != null ? this.state.Address : "",
      industry: "",
      baseCurrency: this.props.route.params.currency.code,
      isMultipleCurrency: this.props.route.params.currency == "INR" ? false : true,
      city: "",
      email: "",
      taxes: this.state.applicableTax,
      userBillingDetails: { name: "", email: "", contactNo: "", gstin: "", stateCode: "", address: "", autorenew: "" },
      nameAlias: "", paymentId: "", amountPaid: "", razorpaySignature: ""
    }
    console.log("Create Company " + JSON.stringify(payload))
    const response = await CompanyService.createCompany(payload)
    console.log("create Company Response " + JSON.stringify(response))
    if (response.status == "success") {
      // ToastAndroid.show("Company created Successfully", ToastAndroid.LONG)
      await AsyncStorage.setItem(STORAGE_KEYS.activeCompanyCountryCode, response.body.subscription.country.countryCode);
      await AsyncStorage.setItem(STORAGE_KEYS.activeCompanyUniqueName, response.body.uniqueName);
      await AsyncStorage.setItem(STORAGE_KEYS.activeBranchUniqueName, " ");
      if (this.props.route.params.oldUser) {
        this.props.navigation.navigate('Home');
      }
      await this.props.getCompanyAndBranches();
      await DeviceEventEmitter.emit(APP_EVENTS.comapnyBranchChange, {});
      await setTimeout(() => { this.setState({ loader: false, disbaleCreateButton: false }) }, 5000)
    } else {
      this.setState({ loader: false, disbaleCreateButton: false })
      if (Platform.OS == "android") {
        ToastAndroid.show(response.message, ToastAndroid.LONG)
      } else {
        TOAST.show(response.message, {
          duration: TOAST.durations.LONG,
          position: -70,
          hideOnPress: true,
          backgroundColor: "#1E90FF",
          textColor: "white",
          opacity: 1,
          shadow: false,
          animation: true,
          containerStyle: { borderRadius: 10 }
        });
      }
    }
  }

  addTaxOrRemove = (tax: string) => {
    if (this.state.applicableTax.includes(tax)) {
      let index = this.state.applicableTax.indexOf(tax)
      let applicableTax = [...this.state.applicableTax]
      applicableTax.splice(index, 1)
      this.setState({ applicableTax })
    } else {
      let applicableTax = [...this.state.applicableTax]
      applicableTax.push(tax)
      this.setState({ applicableTax })
    }
  }

  renderStateModalView = () => {
    return (
      <Modal1 isVisible={this.state.isStateModalVisible} onBackdropPress={() => { this.setState({ isStateModalVisible: !this.state.isStateModalVisible }) }}
        onBackButtonPress={() => { this.setState({ isStateModalVisible: !this.state.isStateModalVisible }) }}
        style={style.modalMobileContainer}>
        <SafeAreaView style={style.modalViewContainer}>
          <View style={style.cancelButtonModal} >
            <TouchableOpacity onPress={() => { this.setState({ isStateModalVisible: false }) }} style={style.cancelButtonTextModal}>
              <Fontisto name="close-a" size={Platform.OS == "ios" ? 10 : 18} color={'black'} style={{ marginTop: 4 }} />
            </TouchableOpacity>
            <TextInput
              placeholderTextColor={'rgba(80,80,80,0.5)'}
              placeholder="Enter State Name"
              returnKeyType={"done"}
              style={{ marginTop: 10, borderRadius: 5, width: "80%", marginHorizontal: 15, fontSize: 15, fontFamily: 'AvenirLTStd-Book', color: '#1c1c1c' }}
              onChangeText={(text) => {
                this.filterStates(text);
              }}
            />
          </View>
          <View style={{ marginBottom: 40, flex: 1, marginTop: 5 }}>
            <FlatList
              scrollEnabled
              data={this.state.filteredStates.length == 0 ? ["Result Not Found"] : this.state.filteredStates}
              renderItem={({ item }) => this.renderItem(item)}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        </SafeAreaView>
      </Modal1>
    )
  }

  renderItem = (state: any) => {
    return (
      <View style={{ justifyContent: "center", alignItems: "center" }}>
        <TouchableOpacity style={{ paddingVertical: 10, width: "90%", }}
          onPress={() => {
            if (state != "Result Not Found") {
              this.setState({ stateName: state, selectedState: state.name, isStateModalVisible: !this.state.isStateModalVisible })
            } else {
              this.setState({ isStateModalVisible: !this.state.isStateModalVisible })
            }
          }}>
          <Text style={{ fontSize: 15, fontFamily: 'AvenirLTStd-Book', color: '#1c1c1c' }}>{state.name ? state.name : state}</Text>
        </TouchableOpacity>
        <View style={style.borderInModal} />
      </View>
    );
  }


  render() {
    return (
      <SafeAreaView style={style.container}>
        <StatusBar backgroundColor="#1A237E" barStyle={Platform.OS == "ios" ? "dark-content" : "light-content"} />
        <KeyboardAwareScrollView keyboardShouldPersistTaps={'handled'}
          style={{ flex: 1, marginBottom: 10, }}>
          <View style={{ borderBottomWidth: 0.5, borderColor: 'rgba(80,80,80,0.5)', height: 55 }}>
            <View style={{ flexDirection: "row", marginBottom: 4 }}>
              <FontAwesome name="th" size={20} color={'#5773FF'} style={{ marginTop: 4 }} />
              <Text style={{ marginLeft: 20 }}>
                <Text style={{ color: 'rgba(80,80,80,0.5)', fontFamily: 'AvenirLTStd-Roman' }}>{'Business Type'}</Text>
                {/* <Text style={{ color: '#E04646', fontFamily: 'AvenirLTStd-Roman' }}>{this.state.bussinessType !=null?'*':""}</Text> */}
              </Text>
            </View>
            <Dropdown
              style={{ flex: 1, marginLeft: 40, marginTop: Platform.OS == "ios" ? 4 : 0 }}
              textStyle={{ color: 'black', fontSize: 15, fontFamily: 'AvenirLTStd-Book' }}
              options={this.state.countryCode == "US" || this.state.countryCode == "GB" ||
                this.state.countryCode == "AU" || this.state.countryCode == "NP" ? ["Unregistered"] :
                ["Registered", "Unregistered"]}
              renderSeparator={() => {
                return (<View></View>);
              }}
              dropdownStyle={{
                width: '81%', height: this.state.countryCode == "US" || this.state.countryCode == "GB" ||
                  this.state.countryCode == "AU" || this.state.countryCode == "NP" ? 40 : 80, marginTop: 5, borderRadius: 10
              }}
              dropdownTextStyle={{ color: '#1C1C1C', fontFamily: 'AvenirLTStd-Book' }}
              renderRow={(options) => {
                return (
                  <View style={{
                    flexDirection: "row", justifyContent: "flex-start", borderBottomColor: 'rgba(80,80,80,0.5)', borderBottomWidth: this.state.countryCode == "US" || this.state.countryCode == "GB" ||
                      this.state.countryCode == "AU" || this.state.countryCode == "NP" ? 0 : (options == "Registered" ? 0.5 : 0),padding: 10,backgroundColor:"white"
                  }}>
                    {this.state.bussinessType==options?<AntDesign name="check" size={20} color={'black'} />:<View style={{width:this.state.bussinessType==null?0:20}}/>}
                    <Text style={{
                       color: '#1C1C1C', fontFamily: 'AvenirLTStd-Book',marginLeft:10
                    }}>{options}
                    </Text>
                  </View>)
              }}
              onSelect={(index, value) => {
                this.setState({ bussinessType: value, gstNumber: null, stateName: null, applicableTax: [], selectStateDisable: false, selectedState: null })
              }}>
              <View style={{ flexDirection: "row", marginBottom: 4 }}>
                <Text style={{ color: this.state.bussinessType == null ? 'rgba(80,80,80,0.5)' : '#1c1c1c', flex: 1, fontFamily: 'AvenirLTStd-Book' }}>
                  {this.state.bussinessType == null ? 'Select Business Type' : this.state.bussinessType}</Text>
              </View>
            </Dropdown>
          </View>
          <View style={{ marginTop: 20, borderBottomWidth: 0.5, borderColor: 'rgba(80,80,80,0.5)', height: 55 }}>
            <View style={{ flexDirection: "row", marginBottom: 4 }}>
              <FontAwesome name="th" size={20} color={'#5773FF'} style={{ marginTop: 4 }} />
              <Text style={{ color: 'rgba(80,80,80,0.5)', fontFamily: 'AvenirLTStd-Roman', marginLeft: 20 }}>{'Business Nature'}</Text>
            </View>
            <Dropdown
              style={{ flex: 1, marginLeft: 40, marginTop: Platform.OS == "ios" ? 4 : 0 }}
              textStyle={{ color: 'black', fontSize: 15, fontFamily: 'AvenirLTStd-Book' }}
              options={["Food", "Service", "Manufacturing", "Retail"]}
              renderSeparator={() => {
                return (<View></View>);
              }}
              dropdownStyle={{ width: '81%', height: 100, marginTop: 5, borderRadius: 10 }}
              dropdownTextStyle={{ color: '#1C1C1C', fontFamily: 'AvenirLTStd-Book' }}
              renderRow={(options) => {
                return (
                  <View style={{
                    flexDirection: "row", justifyContent: "flex-start", borderBottomColor: 'rgba(80,80,80,0.5)', borderBottomWidth:(options == "Retail" ? 0.5 : 0),padding: 10,backgroundColor:"white"
                  }}>
                    {this.state.bussinessNature==options?<AntDesign name="check" size={20} />:<View style={{width:this.state.bussinessNature==null?0:20}}/>}
                    <Text style={{
                       color: '#1C1C1C', fontFamily: 'AvenirLTStd-Book',marginLeft:10
                    }}>{options}
                    </Text>
                  </View>)
              }}
              onSelect={(index, value) => {
                this.setState({ bussinessNature: value })
              }}>
              <View style={{ flexDirection: "row", marginBottom: 4 }}>
                <Text style={{ color: this.state.bussinessNature == null ? 'rgba(80,80,80,0.5)' : '#1c1c1c', flex: 1, fontFamily: 'AvenirLTStd-Book' }}>
                  {this.state.bussinessNature == null ? 'Select Business Type' : this.state.bussinessNature}</Text>
              </View>
            </Dropdown>
          </View>
          {this.state.bussinessType == "Registered" && <View style={{ marginTop: 20, borderBottomWidth: 0.5, borderColor: 'rgba(80,80,80,0.5)', height: 55 }}>
            <View style={{ flexDirection: "row", }}>
              <Entypo name="news" size={20} color={'#5773FF'} style={{ marginTop: 4 }} />
              <Text style={{ marginLeft: 20 }}>
                <Text style={{ color: 'rgba(80,80,80,0.5)', fontFamily: 'AvenirLTStd-Roman' }}>{this.state.countryCode != "IN" ? "TRN" : 'GSTIN'}</Text>
                <Text style={{ color: '#E04646', fontFamily: 'AvenirLTStd-Roman' }}>{'*'}</Text>
              </Text>
            </View>
            <TextInput
              onChangeText={(text) => {
                console.log(text)
                this.setState({ gstNumber: text })
                this.findState(text)
              }
              }
              value={this.state.gstNumber}
              placeholder={this.state.countryCode != "IN" ? "Enter TRN" : "Enter GSTIN"}
              placeholderTextColor={'rgba(80,80,80,0.5)'}
              style={style.GSTInput}>
            </TextInput>
          </View>}
          {this.state.bussinessType == "Registered" && (this.state.gstNumber != null && (this.state.gstNumberWrong || !this.gstValidator())) ? (
            <Text style={{ fontSize: 10, color: 'red', marginTop: 5, marginLeft: 40, fontFamily: 'AvenirLTStd-Roman' }}>
              {this.state.countryCode == "IN" ? "Invalid GSTIN Number" : "Invalid TRN Number"}
            </Text>
          ) : null}
          {this.state.bussinessType == "Registered" && <View style={{ marginTop: 20, borderBottomWidth: 0.5, borderColor: 'rgba(80,80,80,0.5)', height: 55 }}>
            <View style={{ flexDirection: "row", }}>
              <Entypo name="location-pin" size={21} color={'#5773FF'} style={{ marginTop: 4 }} />
              <Text style={{ marginLeft: 20 }}>
                <Text style={{ color: 'rgba(80,80,80,0.5)', fontFamily: 'AvenirLTStd-Roman' }}>{'State'}</Text>
                <Text style={{ color: '#E04646', fontFamily: 'AvenirLTStd-Roman' }}>{'*'}</Text>
              </Text>
            </View>
            <TouchableOpacity
              style={{ backgroundColor: this.state.selectStateDisable ? '#F1F1F2' : null }}
              onPress={() => {
                if (!this.state.selectStateDisable) {
                  this.setState({
                    isStateModalVisible: !this.state.isStateModalVisible,
                    filteredStates: this.state.stateData
                  })
                }
              }}>
              <Text
                style={[style.GSTInput,
                { paddingBottom: Platform.OS == "ios" ? 13 : 9, }]}
              >{this.state.selectedState == null ? <Text style={{ color: 'rgba(80,80,80,0.5)', fontFamily: 'AvenirLTStd-Roman' }}>Enter State</Text> : this.state.selectedState}</Text>
            </TouchableOpacity>
            {/* <Dropdown
              ref={(ref) => (this.state.stateDropDown = ref)}
              style={{
                width: 0,
                height: 0,
                marginLeft: 40, marginTop: Platform.OS == "ios" ? 6.5 : -3
              }}
              textStyle={{ color: 'black', fontSize: 15, fontFamily: 'AvenirLTStd-Book' }}
              options={this.state.filteredStates.length == 0 ? ["Result Not Found"] : this.state.filteredStates}
              renderSeparator={() => {
                return (<View></View>);
              }}
              dropdownStyle={{ width: '81%', height: this.state.filteredStates.length > 1 ? 100 : 50, marginTop: Platform.OS == "ios" ? -4 : 5, borderRadius: 5 }}
              dropdownTextStyle={{ color: '#1C1C1C', fontFamily: 'AvenirLTStd-Book' }}
              renderButtonText={(text) => ""}
              renderRow={(options) => {
                return (
                  <Text style={{ padding: 10, color: '#1C1C1C' }}>{options.name ? options.name : "Result Not Found"}</Text>)
              }}
              onSelect={(index, value) => {
                console.log(JSON.stringify(value))
                if (value != "Result Not Found") {
                  this.setState({ stateName: value, selectedState: value.name })
                }
              }} /> */}
          </View>}
          {this.state.bussinessType == "Registered" && <View style={{ marginTop: 20, borderBottomWidth: 0.5, borderColor: 'rgba(80,80,80,0.5)', height: 55 }}>
            <View style={{ flexDirection: "row", marginBottom: 4 }}>
              <FontAwesome name={'bank'} color="#5773FF" size={18} />
              <Text style={{ marginLeft: 20, marginBottom: 5 }}>
                <Text style={{ color: 'rgba(80,80,80,0.5)', fontFamily: 'AvenirLTStd-Roman' }}>{'Applicable Taxes'}</Text>
                {/* <Text style={{ color: '#E04646', fontFamily: 'AvenirLTStd-Roman' }}>{'*'}</Text> */}
              </Text>
            </View>
            {/* <Dropdown
              style={{ flex: 1, marginLeft: 40 }}
              textStyle={{ color: 'black', fontSize: 15, fontFamily: 'AvenirLTStd-Book' }}
              options={this.state.applicableTaxData}
              renderSeparator={() => {
                return (<View></View>);
              }}
              dropdownStyle={{ width: '81%', height: 100, marginTop: 3, borderRadius: 5 }}
              dropdownTextStyle={{ color: '#1C1C1C', fontFamily: 'AvenirLTStd-Book' }}
              renderRow={(options) => {
                return (
                  <Text style={{ padding: 10, color: '#1C1C1C' }}>{options}</Text>)
              }}
              onSelect={(index, value) => {
                this.setState({ applicableTax: value })
              }}>
              <View style={{ flexDirection: "row", marginVertical: 4 }}>
                <Text style={{ color: this.state.applicableTax.length == 0 ? 'rgba(80,80,80,0.5)' : '#1c1c1c', flex: 1, fontFamily: 'AvenirLTStd-Book' }}>
                  {this.state.applicableTax.length == 0 ? 'Select Taxes' : this.state.applicableTax}</Text>
              </View>
            </Dropdown> */}
            <TouchableOpacity
              onPress={() => this.setState({ modalVisible: true })}
              style={{ flexDirection: "row", marginVertical: 4, marginLeft: 40 }}>
              <Text style={{ color: this.state.applicableTax.length == 0 ? 'rgba(80,80,80,0.5)' : '#1c1c1c', flex: 1, fontFamily: 'AvenirLTStd-Book' }}>
                {this.state.applicableTax.length == 0 ? 'Select Taxes' : this.state.applicableTax + "  "}</Text>
            </TouchableOpacity>
          </View>}
          {this.state.bussinessType != null && <View style={{ marginTop: 30, borderBottomWidth: 0.5, borderColor: 'rgba(80,80,80,0.5)' }}>
            <View style={{ flexDirection: "row", }}>
              <Entypo name="location-pin" size={21} color={'#5773FF'} style={{ marginTop: 4 }} />
              <Text style={{ marginLeft: 20, marginBottom: 5 }}>
                <Text style={{ color: 'rgba(80,80,80,0.5)', fontFamily: 'AvenirLTStd-Roman' }}>{'PIN Code'}</Text>
              </Text>
            </View>
            <TextInput
              keyboardType={"number-pad"}
              returnKeyType={"done"}
              onChangeText={(text) => {
                console.log(text)
                this.setState({ pinCode: text })
              }}
              value={this.state.pinCode}
              placeholder={"Enter PIN Code"}
              placeholderTextColor={'rgba(80,80,80,0.5)'}
              style={style.GSTInput}>
            </TextInput>
          </View>}
          {this.state.bussinessType != null && <View style={{ marginTop: 30, borderBottomWidth: 0.5, borderColor: 'rgba(80,80,80,0.5)' }}>
            <View style={{ flexDirection: "row", }}>
              <Entypo name="location-pin" size={21} color={'#5773FF'} style={{ marginTop: 4 }} />
              <Text style={{ marginLeft: 20, marginBottom: 5 }}>
                <Text style={{ color: 'rgba(80,80,80,0.5)', fontFamily: 'AvenirLTStd-Roman' }}>{'Address'}</Text>
                <Text style={{ color: '#E04646', fontFamily: 'AvenirLTStd-Roman' }}>{this.state.bussinessType == "Registered" ? '*' : ""}</Text>
              </Text>
            </View>
            <TextInput
              multiline={true}
              returnKeyType={"done"}
              onChangeText={(text) => {
                console.log(text)
                this.setState({ Address: text })
              }}
              value={this.state.Address}
              placeholder={"Enter Address"}
              placeholderTextColor={'rgba(80,80,80,0.5)'}
              style={style.GSTInput}>
            </TextInput>
          </View>}
          <Modal animationType="none" transparent={true} visible={this.state.modalVisible} onRequestClose={() => { this.setState({ modalVisible: false }) }}>
            <TouchableOpacity style={style.modalContainer} onPress={() => this.setState({ modalVisible: false })}>
              {this.state.countryCode == "IN" ? <View style={style.centeredView}>
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}
                  onPress={() => {
                    this.addTaxOrRemove("GST 5%")
                  }}>
                  <View style={{ height: 20, width: 20, borderRadius: 2 }}>
                    {this.state.applicableTax.includes("GST 5%")
                      ? (
                        <AntDesign name="checksquare" size={20} color={'#5773FF'} />
                      )
                      : (
                        <Fontisto name="checkbox-passive" size={20} color={'#CCCCCC'} />
                      )}
                  </View>

                  <Text style={{ fontSize: 14, marginLeft: 10, fontFamily: 'AvenirLTStd-Book' }}>GST 5%</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}
                  onPress={() => {
                    this.addTaxOrRemove("GST 12%")
                  }}>
                  <View style={{ height: 20, width: 20, borderRadius: 2 }}>
                    {this.state.applicableTax.includes("GST 12%")
                      ? (
                        <AntDesign name="checksquare" size={20} color={'#5773FF'} />
                      )
                      : (
                        <Fontisto name="checkbox-passive" size={20} color={'#CCCCCC'} />
                      )}
                  </View>

                  <Text style={{ fontSize: 14, marginLeft: 10, fontFamily: 'AvenirLTStd-Book' }}>GST 12%</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}
                  onPress={() => { this.addTaxOrRemove("GST 18%") }}>
                  <View style={{ height: 20, width: 20, borderRadius: 2 }}>
                    {this.state.applicableTax.includes("GST 18%")
                      ? (
                        <AntDesign name="checksquare" size={20} color={'#5773FF'} />
                      )
                      : (
                        <Fontisto name="checkbox-passive" size={20} color={'#CCCCCC'} />
                      )}
                  </View>

                  <Text style={{ fontSize: 14, marginLeft: 10, fontFamily: 'AvenirLTStd-Book' }}>GST 18%</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}
                  onPress={() => { this.addTaxOrRemove("GST 28%") }}>
                  <View style={{ height: 20, width: 20, borderRadius: 2 }}>
                    {this.state.applicableTax.includes("GST 28%")
                      ? (
                        <AntDesign name="checksquare" size={20} color={'#5773FF'} />
                      )
                      : (
                        <Fontisto name="checkbox-passive" size={20} color={'#CCCCCC'} />
                      )}
                  </View>
                  <Text style={{ fontSize: 14, marginLeft: 10, fontFamily: 'AvenirLTStd-Book' }}>GST 28%</Text>
                </TouchableOpacity>
              </View> : <View style={style.centeredView}>
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}
                  onPress={() => {
                    this.addTaxOrRemove("VAT0")
                  }}>
                  <View style={{ height: 20, width: 20, borderRadius: 2 }}>
                    {this.state.applicableTax.includes("VAT0")
                      ? (
                        <AntDesign name="checksquare" size={20} color={'#5773FF'} />
                      )
                      : (
                        <Fontisto name="checkbox-passive" size={20} color={'#CCCCCC'} />
                      )}
                  </View>

                  <Text style={{ fontSize: 14, marginLeft: 10, fontFamily: 'AvenirLTStd-Book' }}>VAT0</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}
                  onPress={() => {
                    this.addTaxOrRemove("VAT5")
                  }}>
                  <View style={{ height: 20, width: 20, borderRadius: 2 }}>
                    {this.state.applicableTax.includes("VAT5")
                      ? (
                        <AntDesign name="checksquare" size={20} color={'#5773FF'} />
                      )
                      : (
                        <Fontisto name="checkbox-passive" size={20} color={'#CCCCCC'} />
                      )}
                  </View>

                  <Text style={{ fontSize: 14, marginLeft: 10, fontFamily: 'AvenirLTStd-Book' }}>VAT5</Text>
                </TouchableOpacity></View>}
            </TouchableOpacity>
          </Modal>
        </KeyboardAwareScrollView>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <TouchableOpacity style={{
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1
          }}
            onPress={() => { this.props.navigation.goBack() }}>
            <Text style={{ color: '#5773FF', fontFamily: 'AvenirLTStd-Book', padding: 5, fontSize: 16 }}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={this.state.disbaleCreateButton}
            style={{
              height: Dimensions.get('screen').height * 0.06,
              width: Dimensions.get('screen').width * 0.45,
              borderRadius: 25,
              backgroundColor: this.state.disbaleCreateButton ? '#ACBAFF' : '#5773FF',
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'flex-end',
            }}
            onPress={() => {
              if (!this.state.disbaleCreateButton) {
                this.submit()
              }
            }}>
            <Text style={{ color: '#fff', fontFamily: 'AvenirLTStd-Black' }}>Create</Text>
          </TouchableOpacity>
        </View>
        {this.renderStateModalView()}
        {this.state.loader && (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              top: 0
            }}>
            <Bars size={15} color={color.PRIMARY_NORMAL} />
          </View>
        )}
      </SafeAreaView>
    );
    // }
  }
}

const mapStateToProps = (state: RootState) => {
  return {}
};

function mapDispatchToProps(dispatch) {
  return {
    getCompanyAndBranches: () => {
      dispatch(getCompanyAndBranches());
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(NewCompanyDetails);
