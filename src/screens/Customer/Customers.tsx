import React from 'react';
import { Text, View, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import styles from './style';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Zocial from 'react-native-vector-icons/Zocial';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Dropdown from 'react-native-modal-dropdown';
import Icon from '@/core/components/custom-icon/custom-icon';
import AntDesign from 'react-native-vector-icons/AntDesign';
import RBSheet from 'react-native-raw-bottom-sheet';
import { FONT_FAMILY } from '@/utils/constants';
import CheckBox from '@react-native-community/checkbox'
import { connect } from 'react-redux';
import Foundation from 'react-native-vector-icons/Foundation';
import RadioForm, { RadioButton, RadioButtonInput, RadioButtonLabel, } from 'react-native-simple-radio-button';

export class Customers extends React.Component {
  constructor(props: any) {
    super(props);
  }
  state = {
    partyName: "",
    contactNumber: "",
    emailId: "",
    partyType:"",
    ref: RBSheet,
    savedAddress: {
      street_billing: "",
      gstin_billing: "",
      state_billing: '',
      street_shipping: "",
      gstin_shipping: "",
      state_shipping: '',
      shippingSame: false,
    },
    street_billing: "",
    gstin_billing: "",
    state_billing: '',
    street_shipping: "",
    gstin_shipping: "",
    state_shipping: '',
    shippingSame: false,
    openAddress: false,
    showBalanceDetails: false,
    creditPeriodRef: Dropdown,
    radioBtn: 0,
    creditPeriodValue: 30,
    creditLimit: "0",
    openingBalance: '0'
  }

  radio_props = [
    { label: 'I receive (Dr)', value: 0 },
    { label: 'I pay (Cr)', value: 1 }
  ];

  setStreetBilling = (text: string) => {
    this.setState({ street_billing: text });
  }
  setGSTINBilling = (text: string) => {
    this.setState({ gstin_billing: text });
  }

  setStreetShipping = (text: string) => {
    this.setState({ street_shipping: text });
  }
  setGSTINShipping = (text: string) => {
    this.setState({ gstin_shipping: text });
  }

  renderAddressDetails = () => {
    return (<View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10, paddingLeft: 20 }} >
        <TouchableOpacity
          style={{ marginVertical: 10 }}
          onPress={() => {
            this.state.ref.close();
          }}>
          <Icon name={'Backward-arrow'} size={16} color={'#808080'} />
        </TouchableOpacity>
        <Text style={styles.addressDetails}>Address Details</Text>
      </View>
      <View style={{ borderBottomColor: '#808080', borderBottomWidth: 0.5 }}></View>
      <ScrollView style={{ flex: 1, paddingHorizontal: 20, paddingBottom: 3 }}>
        <View style={{ flexDirection: 'row', marginTop: 10 }}>
          <Ionicons name="location-sharp" size={18} color="#808080" />
          <Text style={{ paddingLeft: 15, color: '#1C1C1C' }} >Billing Address</Text>
        </View>
        <Text style={{ color: '#808080', marginLeft: 35, marginTop: 7, fontSize: 13 }}>Street</Text>
        <TextInput
          style={styles.inputStyle}
          multiline={true}
          onChangeText={(text) => this.setStreetBilling(text)} />
        <Text style={styles.GreyText}>GSTIN</Text>
        <TextInput
          style={styles.inputStyle}
          placeholder="GSTIN (if applicable)"
          multiline={true}
          onChangeText={(text) => this.setGSTINBilling(text)} />
        <Text style={styles.GreyText}>State*</Text>
        <Dropdown
          style={styles.dropDown}
          textStyle={{ color: '#1c1c1c' }}
          defaultValue="Select"
          options={["fill", "with", "api call"]}
          renderSeparator={() => {
            return (<View></View>);
          }}
          dropdownStyle={{ width: '90%', marginTop: 5, borderRadius: 10, marginLeft: -35, }}
          dropdownTextStyle={{ color: '#1C1C1C', fontSize: 18, fontFamily: FONT_FAMILY.bold }}
          renderRow={(options) => {
            return (<Text style={{ padding: 13, color: '#1C1C1C' }}>{options}</Text>);
          }}
        />
        <View style={styles.rowContainer} >
          <CheckBox value={this.state.shippingSame} onValueChange={(val) => this.setState({ shippingSame: val })} />
          <Text style={{ color: '#1c1c1c', marginLeft: 3 }}>Shipping Address Same as Billing*</Text>
        </View>
        {!this.state.shippingSame ? <View>
          <Text style={{ color: '#808080', marginLeft: 35, marginTop: 7, fontSize: 13 }}>Street</Text>
          <TextInput style={styles.inputStyle} multiline={true}
            onChangeText={(text) => this.setStreetShipping(text)} />
          <Text style={styles.GreyText}>GSTIN</Text>
          <TextInput
            style={styles.inputStyle}
            defaultValue="GSTIN (if applicable)"
            multiline={true}
            onChangeText={(text) => this.setGSTINShipping(text)}
          />
          <Text style={styles.GreyText}>State*</Text>
          <Dropdown
            style={styles.dropDown}
            textStyle={{ color: '#1c1c1c' }}
            defaultValue="Select"
            options={["Registered", "Unregistered", "Deemed Export"]}
            renderSeparator={() => {
              return (<View></View>);
            }}
            dropdownStyle={{ width: '90%', marginTop: 5, borderRadius: 10, marginLeft: -35, }}
            dropdownTextStyle={{ color: '#1C1C1C', fontSize: 18, fontFamily: FONT_FAMILY.bold }}
            renderRow={(options) => {
              return (<Text style={{ padding: 13, color: '#1C1C1C' }}>{options}</Text>);
            }}
          />
        </View> : <View></View>}
      </ScrollView>
      <TouchableOpacity
        style={styles.saveBtn}
        onPress={() => {
          const newAddress = {
            street_billing: this.state.street_billing,
            gstin_billing: this.state.gstin_billing,
            state_billing: this.state.state_billing,
            street_shipping: this.state.street_billing,
            gstin_shipping: this.state.gstin_shipping,
            state_shipping: this.state.state_shipping,
            shippingSame: this.state.shippingSame
          };
          this.setState({ savedAddress: newAddress });
          this.state.ref.close();
        }}
      >
        <Text style={{ color: 'white', padding: 10 }}>Save</Text>
      </TouchableOpacity>
    </View>
    );
  }

  renderSavedAddress = () => {
    return (
      <View style={{ marginLeft: 46 }}>
        <Text style={{ fontFamily: FONT_FAMILY.bold }}>Billing Address*</Text>
        {this.state.savedAddress.street_billing != "" && <Text style={{ color: "#808080" }} >{this.state.savedAddress.street_billing}</Text>}
        {this.state.savedAddress.state_billing != "" && <Text style={{ color: "#808080" }}>{this.state.savedAddress.state_billing}</Text>}
        {this.state.savedAddress.gstin_billing != "" && <Text style={{ color: "#808080" }}>{this.state.savedAddress.gstin_billing}</Text>}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: -5 }} >
          <CheckBox value={this.state.savedAddress.shippingSame} onValueChange={(val) => this.setState({ savedAddress: { shippingSame: val } })} />
          <Text style={{ color: '#1c1c1c' }}>Shipping Address Same as Billing*</Text>
        </View>
        {this.state.savedAddress.shippingSame && <View>
          <Text style={{ fontFamily: FONT_FAMILY.bold }}>Shipping Address*</Text>
          {this.state.savedAddress.street_shipping != "" && <Text style={{ color: "#808080" }} >{this.state.savedAddress.street_shipping}</Text>}
          {this.state.savedAddress.state_shipping != "" && <Text style={{ color: "#808080" }}>{this.state.savedAddress.state_shipping}</Text>}
          {this.state.savedAddress.gstin_shipping != "" && <Text style={{ color: "#808080" }}>{this.state.savedAddress.gstin_shipping}</Text>}

        </View>}
      </View>);
  };

  renderBalanceDetails = () => {

    return (
      <View style={{ marginLeft: 46, paddingTop: 5, marginRight: 20, overflow: 'hidden' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingRight: 20 }}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: "flex-end" }}>
              <Text style={{ color: '#1c1c1c', paddingRight: 5 }} >Set Credit Period</Text>
              <Foundation name="info" size={16} color="#b2b2b2" />
            </View>
            <Text style={{ color: '#808080', fontSize: 12, maxWidth: '80%' }}>Invoice will be due 30 days(s) after creationg date</Text>
          </View>
          <View style={{ ...styles.rowContainer, marginStart: -24, paddingHorizontal: 10, height: "80%", borderWidth: 1, borderColor: '#d9d9d9', justifyContent: 'space-between', overflow: 'hidden' }}>
            <Dropdown
              ref={(ref) => this.state.creditPeriodRef = ref}
              style={{ paddingRight: 20 }}
              textStyle={{ color: '#808080' }}
              defaultValue="30 Day(s)"
              renderButtonText={(text) => {
                return text + " Day(s)";
              }}
              onSelect={(ind, option) => {
                this.setState({ creditPeriodValue: option });
              }}
              options={[1, 2, 3, 4, 4]}
              renderSeparator={() => {
                return (<View></View>);
              }}
              dropdownStyle={{ width: '30%', marginTop: 10, borderRadius: 10 }}
              dropdownTextStyle={{ color: '#1C1C1C' }}
              renderRow={(options) => {
                return (<Text style={{ padding: 13, color: '#1C1C1C' }}>{options}</Text>);
              }}
            />
            <Icon
              style={{ transform: [{ rotate: 0 ? '180deg' : '0deg' }] }}
              name={'9'}
              size={12}
              color="#808080"
              onPress={() => {
                this.state.creditPeriodRef.show();
              }}
            />
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingRight: 20, marginTop: 10 }}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: "flex-end" }}>
              <Text style={{ color: '#1c1c1c', paddingRight: 5 }} >Set Credit Limit</Text>
              <Foundation name="info" size={16} color="#b2b2b2" />
            </View>
            <Text style={{ color: '#808080', fontSize: 12, maxWidth: '80%' }}>Alert me when credit to the party exceeds this value</Text>
          </View>
          <TextInput
            keyboardType="number-pad"
            onChangeText={(val) => { this.setState({ creditLimit: val }) }}
            placeholder="Amount"
            style={{ borderWidth: 1, borderColor: "#d9d9d9", height: '80%', width: "34%", paddingStart: 10, marginStart: -24 }} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: "space-between", marginTop: 10 }}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: "flex-end" }}>
              <Text style={{ color: '#1c1c1c', paddingRight: 5 }} >Opening Balance</Text>
              <Foundation name="info" size={16} color="#b2b2b2" />
            </View>
            <RadioForm
              formHorizontal={true}
              initial={0}
              animation={true}
            >

              {
                this.radio_props.map((obj, i) => (
                  <RadioButton labelHorizontal={true} key={i} style={{ alignItems: 'center' }} >
                    {/*  You can set RadioButtonLabel before RadioButtonInput */}
                    <RadioButtonInput
                      obj={obj}
                      index={i}
                      isSelected={this.state.radioBtn === i}
                      onPress={(val) => { this.setState({ radioBtn: val }) }}
                      borderWidth={1}
                      buttonInnerColor={'#864DD3'}
                      buttonOuterColor={this.state.radioBtn === i ? "#864DD3" : '#808080'}
                      buttonSize={6}
                      buttonOuterSize={12}
                      buttonStyle={{}}
                      buttonWrapStyle={{ marginLeft: 10 }}
                    />
                    <RadioButtonLabel
                      obj={obj}
                      index={i}
                      labelHorizontal={true}
                      onPress={() => { }}
                      labelStyle={{ color: '#808080' }}
                      labelWrapStyle={{}}
                    />
                  </RadioButton>
                ))
              }
            </RadioForm>
          </View>
          <TextInput
            keyboardType="number-pad"
            onChangeText={(val) => {
              this.setState({ openingBalance: val });
            }}
            placeholder="Amount"
            style={{ borderWidth: 1, borderColor: "#d9d9d9", height: '80%', width: "32.5%", paddingStart: 10 }} />
        </View>
      </View>
    );
  }

  isCreateButtonVisible = () =>{
    if(this.state.partyName && this.state.partyType && this.state.savedAddress.state_billing){
      return true;
    }else{
      return false;
    }
  }

  render() {
    return (
      <View style={styles.customerMainContainer}>
        <View style={{ flex: 1 }}>
          <View style={styles.rowContainer}>
            <Ionicons name="person" size={18} color="#864DD3" />
            <TextInput
              onChangeText={(text) => { this.setState({ partyName: text }) }}
              placeholder="Enter Party Name*"
              style={styles.input} />
          </View>
          <View style={styles.rowContainer}>
            <Zocial name="call" size={18} color="#864DD3" />
            <TextInput
              onChangeText={(text) => { this.setState({ contactNumber: text }) }}
              placeholder="Enter Contact Number"
              style={styles.input} />
          </View>
          <View style={styles.rowContainer}>
            <MaterialCommunityIcons name="email-open" size={18} color="#864DD3" />
            <TextInput
              onChangeText={(text) => this.setState({ emailId: text })}
              placeholder="Enter Address"
              style={styles.input} />
          </View>
          <View style={{ ...styles.rowContainer, marginTop: 5 }}>
            <MaterialCommunityIcons name="account-group" size={18} color="#864DD3" />
            <Dropdown
              style={{ flex: 1, paddingLeft: 10 }}
              textStyle={{ color: '#808080' }}
              defaultValue="Select Group"
              options={["call", "api", "to fill this"]}
              renderSeparator={() => {
                return (<View></View>);
              }}
              dropdownStyle={{ marginLeft: 30, width: '75%', marginTop: 10, borderRadius: 10 }}
              dropdownTextStyle={{ color: '#1C1C1C' }}
              renderRow={(options) => {
                return (<Text style={{ padding: 13, color: '#1C1C1C' }}>{options}</Text>);
              }}
            />
            <Icon
              style={{ transform: [{ rotate: 0 ? '180deg' : '0deg' }] }}
              name={'9'}
              size={12}
              color="#808080"
              onPress={() => {

              }}
            />
          </View>
          <View style={{ ...styles.rowContainer, marginTop: 25, marginBottom: 5 }}>
            <MaterialIcons name="hourglass-full" size={18} color="#864DD3" />
            <Dropdown
              style={{ flex: 1, paddingLeft: 10 }}
              textStyle={{ color: '#808080' }}
              defaultValue="Party Type*"
              options={["Registered", "Unregistered", "Deemed Export"]}
              renderSeparator={() => {
                return (<View></View>);
              }}
              dropdownStyle={{ marginLeft: 30, width: '75%', marginTop: 10, borderRadius: 10 }}
              dropdownTextStyle={{ color: '#1C1C1C' }}
              renderRow={(options) => {
                return (<Text style={{ padding: 13, color: '#1C1C1C' }}>{options}</Text>);
              }}
            />
            <Icon
              style={{ transform: [{ rotate: 0 ? '180deg' : '0deg' }] }}
              name={'9'}
              size={12}
              color="#808080"
              onPress={() => {

              }}
            />
          </View>
          <TouchableOpacity
            onPress={() => {
              this.state.ref.open();
            }}
            style={{ ...styles.rowContainer, justifyContent: 'space-between', marginVertical: 10, paddingVertical: 10, backgroundColor: this.state.openAddress ? "rgba(80,80,80,0.05)" : "white" }}>
            <AntDesign name="pluscircle" size={16} color="#864DD3" />
            <View style={{ alignItems: 'flex-start', flex: 1, paddingLeft: 10 }}>
              <Text style={{ color: '#1C1C1C' }}>Address Details*</Text>
            </View>
            <Icon
              style={{ transform: [{ rotate: this.state.openAddress ? '180deg' : '0deg' }] }}
              name={'9'}
              size={12}
              color="#808080"
              onPress={() => {
                this.setState({ openAddress: !this.state.openAddress });
              }}
            />
          </TouchableOpacity>
          {this.state.openAddress && this.renderSavedAddress()}
          <TouchableOpacity
            onPress={() => { this.setState({ showBalanceDetails: !this.state.showBalanceDetails }) }}
            style={{ ...styles.rowContainer, justifyContent: 'space-between', backgroundColor: this.state.showBalanceDetails ? 'rgba(80,80,80,0.05)' : 'white', paddingVertical: 10 }}>
            <AntDesign name="pluscircle" size={16} color="#864DD3" style={{ transform: [{ rotate: '45deg' }] }} />
            <View style={{ alignItems: 'flex-start', flex: 1, paddingLeft: 10 }}>
              <Text style={{ color: '#1C1C1C' }}>Balance Details</Text>
            </View>
            <Icon
              style={{ transform: [{ rotate: this.state.showBalanceDetails ? '180deg' : '0deg' }] }}
              name={'9'}
              size={12}
              color="#808080"
            />
          </TouchableOpacity>
          {this.state.showBalanceDetails && this.renderBalanceDetails()}
        </View>
        {this.isCreateButtonVisible() && <TouchableOpacity
          style={{ alignSelf: 'flex-end', paddingHorizontal: 10 }}
          onPress={() => {}}>
          <Icon name={'path-18'} size={48} color={'#5773FF'} />
        </TouchableOpacity>}
        <RBSheet ref={(ref) => { this.state.ref = ref }}
          height={500}
          customStyles={{
            container: {
              borderRadius: 10
            }
          }}>
          {this.renderAddressDetails()}
        </RBSheet>
      </View>
    )
  }
};

const mapStateToProps = (state: RootState) => {
  return {
    // activeCompany: state.company.activeCompany,
  };
};

function Screen(props) {
  const isFocused = useIsFocused();

  return <Customers {...props} isFocused={isFocused} />;
}
export default connect(mapStateToProps)(Screen);