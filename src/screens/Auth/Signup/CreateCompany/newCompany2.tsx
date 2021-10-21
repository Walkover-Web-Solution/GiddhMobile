import React from 'react';
import { connect } from 'react-redux';

import { View, TouchableOpacity, Dimensions, Modal, ScrollView, StatusBar, Platform } from 'react-native';
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
import { STORAGE_KEYS } from '@/utils/constants';
import AsyncStorage from '@react-native-community/async-storage';
import { retry } from '@redux-saga/core/effects';

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
      modalVisible: false
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
      this.state.stateDropDown.show();
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
    this.state.stateDropDown.show();
  }

  findState = (gstNo: any) => {
    if (gstNo == '') {
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
    const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    const vadidatorResult = this.state.gstNumber != null && this.state.gstNumber != '' ? regex.test((this.state.gstNumber).toUpperCase()) : true;
    console.log(vadidatorResult)
    return vadidatorResult;
  }

  submit = async () => {
    if (this.state.bussinessType == "Registered") {
      if (this.state.gstNumber == null) {
        alert('Enter GST Number');
      } else if (this.state.gstNumber && this.state.gstNumber.length != 15) {
        alert('Enter a valid gst number, should be 15 characters long');
        return
      } else if (this.state.gstNumberWrong || !this.gstValidator()) {
        alert('Enter a valid gst number');
        return
      } else if (this.state.stateName == null) {
        alert('Enter State Name');
        return
      } else if (this.state.applicableTax == null) {
        alert('Select Applicable Tax');
        return
      } else if (this.state.address == null) {
        alert('Enter Address');
        return
      }
    }
    var userEmail = await AsyncStorage.getItem(STORAGE_KEYS.googleEmail)
    const payload = {
      name: this.props.route.params.companyName,
      country: this.props.route.params.country.alpha2CountryCode,
      phoneCode: this.props.route.params.country.callingCode,
      contactNo: this.props.route.params.mobileNumber,
      uniqueName: "walkovin16345510716060fvpzr",
      isBranch: false,
      subscriptionRequest: {
        planUniqueName: "xoh1591185630174",
        subscriptionId: "",
        userUniqueName: userEmail,
        licenceKey: ""
      },
      addresses:
        this.state.stateName == null && this.state.applicableTax == null && this.state.address == null ? [] :
          [{
            stateCode: this.state.stateName != null ? this.state.stateName.code : "",
            address: this.state.address != null ? this.state.address : "",
            isDefault: false,
            stateName: this.state.stateName != null ? this.state.stateName.name : "",
            taxNumber: this.state.gstNumber != null ? this.state.gstNumber : "",
            pincode: this.state.pinCode == null ? "" : this.state.pinCode
          }],
      businessNature: this.state.bussinessNature != null ? this.state.bussinessNature : "",
      businessType: this.state.bussinessType != null ? this.state.bussinessType : "",
      address: this.state.address != null ? this.state.address : "",
      industry: "",
      baseCurrency: this.props.route.params.currency,
      isMultipleCurrency: this.props.route.params.currency == "INR" ? false : true,
      city: "",
      email: "",
      taxes: this.state.applicableTax,
      userBillingDetails: { name: "", email: "", contactNo: "", gstin: "", stateCode: "", address: "", autorenew: "" },
      nameAlias: "", paymentId: "", amountPaid: "", razorpaySignature: ""
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


  render() {
    return (
      <SafeAreaView style={style.container}>
        <StatusBar backgroundColor="#1A237E" barStyle={Platform.OS == "ios" ? "dark-content" : "light-content"} />
        <ScrollView style={{ flex: 1, marginBottom: 10, }}>
          <View style={{ borderBottomWidth: 0.5, borderColor: 'rgba(80,80,80,0.5)', height: 55 }}>
            <View style={{ flexDirection: "row", marginBottom: 4 }}>
              <FontAwesome name="th" size={20} color={'#5773FF'} style={{ marginTop: 4 }} />
              <Text style={{ marginLeft: 20 }}>
                <Text style={{ color: 'rgba(80,80,80,0.5)', fontFamily: 'AvenirLTStd-Roman' }}>{'Business Type'}</Text>
                {/* <Text style={{ color: '#E04646', fontFamily: 'AvenirLTStd-Roman' }}>{this.state.bussinessType !=null?'*':""}</Text> */}
              </Text>
            </View>
            <Dropdown
              style={{ flex: 1, marginLeft: 40 }}
              textStyle={{ color: 'black', fontSize: 15, fontFamily: 'AvenirLTStd-Book' }}
              options={["Registered", "Unregistered"]}
              renderSeparator={() => {
                return (<View></View>);
              }}
              dropdownStyle={{ width: '81%', height: 90, marginTop: 5, borderRadius: 5 }}
              dropdownTextStyle={{ color: '#1C1C1C', fontFamily: 'AvenirLTStd-Book' }}
              renderRow={(options) => {
                return (
                  <Text style={{ padding: 10, color: '#1C1C1C' }}>{options}</Text>)
              }}
              onSelect={(index, value) => {
                this.setState({ bussinessType: value, gstNumber: null, stateName: null, applicableTax: [] })
              }}>
              <View style={{ flexDirection: "row", marginBottom: 4 }}>
                <Text style={{ color: this.state.bussinessType == null ? 'rgba(80,80,80,0.5)' : '#1c1c1c', flex: 1, fontFamily: 'AvenirLTStd-Book' }}>
                  {this.state.bussinessType == null ? 'Select Bussiness Type' : this.state.bussinessType}</Text>
              </View>
            </Dropdown>
          </View>
          <View style={{ marginTop: 20, borderBottomWidth: 0.5, borderColor: 'rgba(80,80,80,0.5)', height: 55 }}>
            <View style={{ flexDirection: "row", marginBottom: 4 }}>
              <FontAwesome name="th" size={20} color={'#5773FF'} style={{ marginTop: 4 }} />
              <Text style={{ color: 'rgba(80,80,80,0.5)', fontFamily: 'AvenirLTStd-Roman', marginLeft: 20 }}>{'Business Nature'}</Text>
            </View>
            <Dropdown
              style={{ flex: 1, marginLeft: 40 }}
              textStyle={{ color: 'black', fontSize: 15, fontFamily: 'AvenirLTStd-Book' }}
              options={["Food", "Service", "Manufacturing", "Retail"]}
              renderSeparator={() => {
                return (<View></View>);
              }}
              dropdownStyle={{ width: '81%', height: 100, marginTop: 5, borderRadius: 5 }}
              dropdownTextStyle={{ color: '#1C1C1C', fontFamily: 'AvenirLTStd-Book' }}
              renderRow={(options) => {
                return (
                  <Text style={{ padding: 10, color: '#1C1C1C' }}>{options}</Text>)
              }}
              onSelect={(index, value) => {
                this.setState({ bussinessNature: value })
              }}>
              <View style={{ flexDirection: "row", marginBottom: 4 }}>
                <Text style={{ color: this.state.bussinessNature == null ? 'rgba(80,80,80,0.5)' : '#1c1c1c', flex: 1, fontFamily: 'AvenirLTStd-Book' }}>
                  {this.state.bussinessNature == null ? 'Select Bussiness Type' : this.state.bussinessNature}</Text>
              </View>
            </Dropdown>
          </View>
          {this.state.bussinessType == "Registered" && <View style={{ marginTop: 20, borderBottomWidth: 0.5, borderColor: 'rgba(80,80,80,0.5)', height: 55 }}>
            <View style={{ flexDirection: "row", }}>
              <Entypo name="news" size={20} color={'#5773FF'} style={{ marginTop: 4 }} />
              <Text style={{ marginLeft: 20 }}>
                <Text style={{ color: 'rgba(80,80,80,0.5)', fontFamily: 'AvenirLTStd-Roman' }}>{'GSTIN'}</Text>
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
              placeholder={"Enter GSTIN"}
              placeholderTextColor={'rgba(80,80,80,0.5)'}
              style={style.GSTInput}>
            </TextInput>
          </View>}
          {this.state.bussinessType == "Registered" && (this.state.gstNumber != null && (this.state.gstNumberWrong || !this.gstValidator())) ? (
            <Text style={{ fontSize: 10, color: 'red', marginTop: 5, marginLeft: 40, fontFamily: 'AvenirLTStd-Roman' }}>
              Invalid GSTIN Number
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
            <TextInput
              editable={this.state.selectStateDisable ? false : true}
              placeholder={"Enter State"}
              style={[style.GSTInput, { backgroundColor: this.state.selectStateDisable ? '#F1F1F2' : null }]}
              value={this.state.selectedState}
              onChangeText={(text) => {
                this.setState({
                  selectedState: text
                })
                setTimeout(() => {
                  this.filterStates(text);
                }, 1000);
              }}
            />
            <Dropdown
              ref={(ref) => (this.state.stateDropDown = ref)}
              style={{
                width: 0,
                height: 0,
                marginLeft: 40, marginTop: -3
              }}
              textStyle={{ color: 'black', fontSize: 15, fontFamily: 'AvenirLTStd-Book' }}
              options={this.state.filteredStates}
              renderSeparator={() => {
                return (<View></View>);
              }}
              dropdownStyle={{ width: '81%', height: 100, marginTop: 5, borderRadius: 5 }}
              dropdownTextStyle={{ color: '#1C1C1C', fontFamily: 'AvenirLTStd-Book' }}
              renderButtonText={(text) => ""}
              renderRow={(options) => {
                return (
                  <Text style={{ padding: 10, color: '#1C1C1C' }}>{options.name}</Text>)
              }}
              onSelect={(index, value) => {
                console.log(JSON.stringify(value))
                this.setState({ stateName: value, selectedState: value.name })
              }} />
          </View>}
          {this.state.bussinessType == "Registered" && <View style={{ marginTop: 20, borderBottomWidth: 0.5, borderColor: 'rgba(80,80,80,0.5)', height: 55 }}>
            <View style={{ flexDirection: "row", marginBottom: 4 }}>
              <FontAwesome name={'bank'} color="#5773FF" size={18} />
              <Text style={{ marginLeft: 20, marginBottom: 5 }}>
                <Text style={{ color: 'rgba(80,80,80,0.5)', fontFamily: 'AvenirLTStd-Roman' }}>{'Applicable Taxes'}</Text>
                <Text style={{ color: '#E04646', fontFamily: 'AvenirLTStd-Roman' }}>{'*'}</Text>
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
              <View style={style.centeredView}>
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

                  <Text style={{ fontSize: 14, marginLeft: 10 }}>GST 5%</Text>
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

                  <Text style={{ fontSize: 14, marginLeft: 10 }}>GST 12%</Text>
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

                  <Text style={{ fontSize: 14, marginLeft: 10 }}>GST 18%</Text>
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
                  <Text style={{ fontSize: 14, marginLeft: 10 }}>GST 28%</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        </ScrollView>
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
            style={{
              height: Dimensions.get('screen').height * 0.06,
              width: Dimensions.get('screen').width * 0.45,
              borderRadius: 25,
              backgroundColor: '#5773FF',
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'flex-end',
            }}
            onPress={() => {
              this.submit()
            }}>
            <Text style={{ color: '#fff', fontFamily: 'AvenirLTStd-Black' }}>Create</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
    // }
  }
}

const mapStateToProps = (state: RootState) => {
  return {}
};

function mapDispatchToProps(dispatch) {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(NewCompanyDetails);
