import Header from "@/components/Header";
import useCustomTheme, { DefaultTheme, ThemeProps } from "@/utils/theme";
import { useIsFocused } from "@react-navigation/native";
import { Animated, Dimensions, Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from '@/core/components/custom-icon/custom-icon';
import { useState } from "react";
import style from './style';
import color from '@/utils/colors';
import { FONT_FAMILY } from "@/utils/constants";
import AntDesign from 'react-native-vector-icons/AntDesign';
import RadioForm, { RadioButton, RadioButtonInput, RadioButtonLabel } from "react-native-simple-radio-button";

const ProductScreen = ()=>{
    const _StatusBar = ({ statusBar }: { statusBar: string }) => {
        const isFocused = useIsFocused();
        return isFocused ? <StatusBar backgroundColor={statusBar} barStyle={Platform.OS === 'ios' ? "dark-content" : "light-content"} /> : null
    }
    const {statusBar,styles, voucherBackground} = useCustomTheme(getStyles, 'Stock');
    const {height, width} = Dimensions.get('window');

    const RenderStockName = ()=>{
        return (
            <View>
                <View style={{flexDirection: 'row', minHeight: 50, alignItems: 'center', paddingTop: 14}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
                    <Icon name={'Sections'} color={DefaultTheme.colors.secondary} style={{margin: 16}} size={16} />
                    <TextInput
                        placeholderTextColor={'#808080'}
                        placeholder={'Enter Stock'}
                        returnKeyType={'done'}
                        // value={stockName}
                        // onChangeText={(text) => this.setState({searchPartyName: text}, () => this.searchCalls())}
                        // style={style.searchTextInputStyle}
                    />
                    </View>
                    <TouchableOpacity>
                    <Text style={{color: '#1C1C1C', marginRight: 16, fontFamily: 'AvenirLTStd-Book'}}>Clear All</Text>
                    </TouchableOpacity>
                </View>
                <View>
                    <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
                    <Icon name={'Sections'} color={DefaultTheme.colors.secondary} style={{margin: 16}} size={16} />
                    <TextInput
                        placeholderTextColor={'#808080'}
                        placeholder={'Unique Name'}
                        returnKeyType={'done'}
                        // value={stockName}
                        // onChangeText={(text) => this.setState({searchPartyName: text}, () => this.searchCalls())}
                        // style={style.searchTextInputStyle}
                    />
                    </View>
                </View>
            </View>
        );
    }

    const RenderUnitGroup = ()=>{
        return (
        <View style={style.fieldContainer}>
            <View style={{flexDirection: 'row'}}>
            <Icon name={'path-15'} color={DefaultTheme.colors.secondary} size={16} />
            <Text style={style.fieldHeadingText}>{'Unit'}</Text>
            </View>
            <View style={{paddingVertical: 6, marginTop: 10, justifyContent: 'space-between'}}>
            <View style={{flexDirection: 'row', }}>
                <View
                style={[
                    style.buttonWrapper,
                    {marginHorizontal: 20},
                    {
                    justifyContent: 'center',
                    width: 140,
                    height: 40,
                    borderColor: false ? '#00B795' : '#d9d9d9',
                    }
                ]}>
                <TextInput
                    style={[
                    style.chequeButtonText, {color: true ? '#00B795' : '#868686'}
                    ]}
                    autoCapitalize = {"characters"}
                    // value={this.state.chequeNumber.toString()}
                    placeholder={'Group'}
                    placeholderTextColor={'#868686'}
                    returnKeyType={"done"}
                    multiline={true}
                    // onFocus={() => {
                    //   if (!this.state.partyName) {
                    //     alert('Please select a party.');
                    //   } else if (this.state.amountForReceipt == '') {
                    //     alert('Please enter amount.');
                    //   } else {
                    //   }
                    // }}
                    // onChangeText={(text) => {
                    // if (!this.state.partyName) {
                    //     alert('Please select a party.');
                    // } else if (this.state.amountForReceipt == '') {
                    //     alert('Please enter amount.');
                    // } else {
                    //     this.setState({chequeNumber: text});
                    // }
                    // }}
                />
                </View>

                <TouchableOpacity
                // onPress={() => {
                //     if (!this.state.partyName) {
                //     alert('Please select a party.');
                //     } else if (this.state.amountForReceipt == '') {
                //     alert('Please enter amount.');
                //     } else {
                //     this.setState({showClearanceDatePicker: true});
                //     this.setState({isClearanceDateSelelected: true});
                //     }
                // }}>
                >
                <View
                    style={[
                    style.buttonWrapper,
                    {marginHorizontal:20,width:140,height:40,justifyContent:'center',borderColor: false ? '#00B795' : '#d9d9d9'},
                    ]}>
                    {false ? ( <></>
                    // <Text style={[style.buttonText, { color: '#00B795' }]}>
                    //     {this.formatClearanceDate()}
                    // </Text>
                    ) : (
                    <Text
                        style={[style.buttonText, { color: '#868686' }]}>
                        Unit
                    </Text>
                    )}
                </View>
                </TouchableOpacity>
            </View>
            </View>
        </View>
        )
    }

    const RenderTaxes = ()=>{
        return (
        <View style={style.fieldContainer}>
            <View style={{flexDirection: 'row'}}>
            <Icon name={'Path-12190'} color={DefaultTheme.colors.secondary} size={16} />
            <Text style={style.fieldHeadingText}>{'Tax'}</Text>
            </View>
    
            <View style={{paddingVertical: 6, marginTop: 10, width:140}}>
            <View style={{flexDirection: 'row'}}>
                <TouchableOpacity style={{flexDirection: 'row'}}
                textColor={{color}}>
                <View
                    style={[
                    style.buttonWrapper,
                    {marginLeft: 20,width:140},
                    {borderColor: false ? '#00B795' : '#d9d9d9'},
                    ]}>
                    <Text
                    style={[
                        style.buttonText,
                        {
                        color: false ? '#00B795' : '#868686',
                        },
                    ]}>
                    Tax
                    </Text>
                </View>
                </TouchableOpacity>
                {/* <TouchableOpacity
                style={{flexDirection: 'row'}}
                //   onPress={() => {
                //     if (this.state.invoiceType == INVOICE_TYPE.cash || this.state.partyName) {
                //       this.setBottomSheetVisible(this.paymentModalRef, true);
                //     } else {
                //       alert('Please select a party.');
                //     }
                //   }}
                textColor={{color}}>
                <View
                    style={[
                    style.buttonWrapper,
                    {marginLeft: 20,width:150},
                    {borderColor: false ? '#00B795' : '#d9d9d9'},
                    ]}>
                    <Text
                    style={[
                        style.buttonText,
                        {
                        color: false ? '#00B795' : '#868686',
                        },
                    ]}>
                        Select Group
                    </Text>
                </View>
                </TouchableOpacity> */}
            </View>
            </View>
        </View>
        )
    }

    const RenderGroups = ()=>{
        return (
            <View style={style.fieldContainer}>
            <View style={{flexDirection: 'row'}}>
              <Icon name={'Path-12190'} color={DefaultTheme.colors.secondary} size={16} />
              <Text style={style.fieldHeadingText}>{'Groups'}</Text>
            </View>
    
            <View style={{paddingVertical: 6, marginTop: 10}}>
              <View style={{flexDirection: 'row'}}>
                <TouchableOpacity
                  style={{flexDirection: 'row'}}
                //   onPress={() => {
                //     if (this.state.invoiceType == INVOICE_TYPE.cash || this.state.partyName) {
                //       this.setBottomSheetVisible(this.paymentModalRef, true);
                //     } else {
                //       alert('Please select a party.');
                //     }
                //   }}
                  textColor={{color}}>
                  <View
                    style={[
                      style.buttonWrapper,
                      {marginLeft: 20,width:140},
                      {borderColor: false ? '#00B795' : '#d9d9d9'},
                    ]}>
                    <Text
                      style={[
                        style.buttonText,
                        {
                          color: false ? '#00B795' : '#868686',
                        },
                      ]}>
                        Select Group
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
            </View>
        )
    }

    const GeneralLinkedAccComponent = ({
        rateLabel = "Rate:",
        initialRadioSelection = 1,
        linkedAccountText = "Linked Purchase Accounts",
        // onLinkedAccountPress,
        textInputPlaceholder = "Rate",
        textInputKeyboardType = "number-pad",
        // textInputValue,
        // onTextInputChange,
        unitText = "Unit",
        // onUnitPress
    })=>{
        const [radioBtn, setRadioBtn] = useState(initialRadioSelection);
        const radio_props = [
            { label: 'MRP (Inclusive)', value: 0 },
            { label: 'Exclusive', value: 1 }
          ];
        return (
            <View style={{ marginHorizontal: 15, marginVertical: 10, marginRight: 20, overflow: 'hidden' }}>
                <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center',justifyContent:'space-between' }}>
                        <Text style={{ color: '#1c1c1c', paddingRight: 5, fontFamily: 'AvenirLTStd-Book' }} >{rateLabel}</Text>
                        <RadioForm
                        formHorizontal={true}
                        initial={0}
                        animation={true}
                        style={{justifyContent:'space-between',width:'70%'}}
                        >
                        {
                            radio_props.map((obj, i) => (
                            <RadioButton labelHorizontal={true} key={i} style={{ alignItems: 'center' }} >
                                <RadioButtonInput
                                obj={obj}
                                index={i}
                                isSelected={radioBtn === i}
                                onPress={(val) => { setRadioBtn(val) }}
                                borderWidth={1}
                                buttonInnerColor={'#864DD3'}
                                buttonOuterColor={radioBtn === i ? '#864DD3' : '#808080'}
                                buttonSize={8}
                                buttonOuterSize={15}
                                buttonStyle={{}}
                                buttonWrapStyle={{ marginTop: 10 }}
                                />
                                <RadioButtonLabel
                                obj={obj}
                                index={i}
                                labelHorizontal={true}
                                onPress={() => { }}
                                labelStyle={{ color: '#808080', fontFamily: 'AvenirLTStd-Book' }}
                                labelWrapStyle={{ marginRight: 10, marginTop: 10 }}
                                />
                            </RadioButton>
                            ))}
                        </RadioForm>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between',alignItems:'center' ,}}>
                    <Text style={{ color: '#1c1c1c', paddingRight: 5, marginTop: 10, fontFamily: 'AvenirLTStd-Book' }} >{linkedAccountText}</Text>
                    <View style={{ ...style.rowContainer, ...style.buttonWrapper, marginTop: 5, paddingHorizontal: 10, paddingVertical: 0, height: 40, width: "45%", borderColor: '#d9d9d9', justifyContent: 'space-between' }}>
                        <TouchableOpacity
                        onPress={() => {
                            // this.setState({
                            // isCurrencyModalVisible: !this.state.isCurrencyModalVisible,
                            // filteredCurrencyData: this.state.allCurrency,
                            // })
                        }} style={{ padding: 2, flex: 1 }}><Text
                            style={{ color: '#1C1C1C', fontSize: 15, marginTop: 3, fontFamily: 'AvenirLTStd-Book', marginLeft: 10, paddingHorizontal: 5 }}
                        >None</Text></TouchableOpacity>
                    </View>
                </View> 
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
                    <TextInput
                        returnKeyType={'done'}
                        keyboardType="number-pad"
                        // onChangeText={(val) => {
                        // this.setState({ openingBalance: val });
                        // }}
                        placeholderTextColor={'rgba(80,80,80,0.5)'}
                        // value={this.state.openingBalance}
                        placeholder="Rate"
                        style={{ ...style.buttonWrapper, borderWidth: 1, width: '45%', borderColor: '#d9d9d9', height: '70%', paddingStart: 10, marginTop: 5, fontFamily: 'AvenirLTStd-Book' }} />
                    <View style={{ ...style.rowContainer, ...style.buttonWrapper, marginTop: 5, paddingHorizontal: 10, paddingVertical: 0, height: 40, width: "45%", borderColor: '#d9d9d9', justifyContent: 'space-between' }}>
                        <TouchableOpacity
                            onPress={() => {
                                // this.setState({
                                // isCurrencyModalVisible: !this.state.isCurrencyModalVisible,
                                // filteredCurrencyData: this.state.allCurrency,
                                // })
                            }} style={{ padding: 2, flex: 1 }}>
                            <Text
                                style={{ color: '#1C1C1C', fontSize: 15, marginTop: 3, fontFamily: 'AvenirLTStd-Book', marginLeft: 10, paddingHorizontal: 5 }}
                            >Unit</Text>
                        </TouchableOpacity>
                    </View>
                </View>   
            </View>
        )
    }

    const RenderLinkedAcc = ()=>{
        const [expandAcc, setExpandAcc] = useState(false);
        // const radio_props = [
        //     { label: 'MRP (Inclusive)', value: 0 },
        //     { label: 'Exclusive', value: 1 }
        //   ];
        // const [radioBtn, setRadioBtn]= useState(1);
        return (
            <View>
                <View
                style={{
                    backgroundColor: '#E6E6E6',
                    flexDirection: 'row',
                    paddingVertical: 9,
                    paddingHorizontal: 16,
                    justifyContent: 'space-between'
                }}>
                <View style={{ flexDirection: 'row' }}>
                    <Icon style={{ marginRight: 10 }} name={'Path-12190'} size={16} color={DefaultTheme.colors.secondary} />
                    <Text style={{ color: '#1C1C1C', fontFamily: FONT_FAMILY.semibold }}>Linked Account</Text>
                </View>
                <Icon
                    style={{ transform: [{ rotate: expandAcc ? '180deg' : '0deg' }] }}
                    name={'9'}
                    size={16}
                    color="#808080"
                    onPress={() => {
                    setExpandAcc(!expandAcc);
                    }}
                />
                </View>
                {
                    expandAcc && (
                    <View> 
                        <GeneralLinkedAccComponent linkedAccountText = "Linked Purchase Accounts"/>
                        <View style={{flex:1,borderBottomWidth:0.2,width:'95%',alignSelf:'center'}}></View>
                        <GeneralLinkedAccComponent linkedAccountText = "Linked Sales Accounts"/>
                    </View>
                    )
                }
            </View>
        );
    }

    const RenderOtherInfo = ()=>{
        const [expandAcc, setExpandAcc] = useState(false);
        const [selectedCode,setSelectedCode] = useState('hsn');
        return (
        <View style={{paddingBottom:0}}>
            <View
                style={{
                    backgroundColor: '#E6E6E6',
                    flexDirection: 'row',
                    paddingVertical: 9,
                    paddingHorizontal: 16,
                    justifyContent: 'space-between'
                }}>
                <View style={{ flexDirection: 'row' }}>
                    <Icon style={{ marginRight: 10 }} name={'Path-12190'} size={16} color={DefaultTheme.colors.secondary} />
                    <Text style={{ color: '#1C1C1C', fontFamily: FONT_FAMILY.semibold }}>Other</Text>
                </View>
                <Icon
                    style={{ transform: [{ rotate: expandAcc ? '180deg' : '0deg' }] }}
                    name={'9'}
                    size={16}
                    color="#808080"
                    onPress={() => {
                    setExpandAcc(!expandAcc);
                    }}
                />
            </View>
            {expandAcc &&
            <View> 
                <View
                    style={{
                    flexDirection: 'row',
                    // backgroundColor: 'pink',
                    justifyContent: 'space-between',
                    marginTop: 10,
                    width:'75%',
                    alignSelf:'center'
                    
                    }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 16, marginTop: 10 }}>
                        <TouchableOpacity
                        style={{
                            height: 20,
                            width: 20,
                            borderRadius: 10,
                            backgroundColor: '#c4c4c4',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                        onPress={() => setSelectedCode('hsn')}
                        >
                        {selectedCode == 'hsn' && (
                            <View style={{ height: 14, width: 14, borderRadius: 7, backgroundColor: '#229F5F' }} />
                        )}
                        </TouchableOpacity>
                        <Text style={{ marginLeft: 10 }}>HSN Code</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 16, marginTop: 15 }}>
                        <TouchableOpacity
                        style={{
                            height: 20,
                            width: 20,
                            borderRadius: 10,
                            backgroundColor: '#c4c4c4',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                        onPress={() => setSelectedCode('sac')}
                        >
                        {selectedCode == 'sac' && (
                            <View style={{ height: 14, width: 14, borderRadius: 7, backgroundColor: '#229F5F' }} />
                        )}
                        </TouchableOpacity>

                        <Text style={{ marginLeft: 10 }}>SAC Code</Text>
                    </View>
                </View>
                <View style={{ marginHorizontal: 15, marginVertical: 10, marginRight: 20, overflow: 'hidden' }}>
                    <TextInput
                        placeholder={ selectedCode=='hsn'?'Enter HSN Code':'Enter SAC Code'}
                        placeholderTextColor={'#808080'}
                        // value={
                        //     this.state.selectedCode == 'hsn'
                        //     ? this.state.editItemDetails.hsnNumber
                        //     : this.state.editItemDetails.sacNumber
                        // }
                        // keyboardType={'number-pad'}
                        style={{ borderColor: '#D9D9D9', borderBottomWidth: 1 }}
                        // editable={false}
                        // onChangeText={(text) => {
                        //     const item = this.state.editItemDetails;
                        //     if (this.state.selectedCode == 'hsn') {
                        //     item.hsnNumber = text;
                        //     this.setState({ editItemDetails: item });
                        //     } else {
                        //     item.sacNumber = text;
                        //     this.setState({ editItemDetails: item });
                        //     }
                        // }}
                    />
                    <TextInput
                        placeholder={'SKU Code'}
                        placeholderTextColor={'#808080'}
                        // value={
                        //     this.state.selectedCode == 'hsn'
                        //     ? this.state.editItemDetails.hsnNumber
                        //     : this.state.editItemDetails.sacNumber
                        // }
                        // keyboardType={'number-pad'}
                        style={{ borderColor: '#D9D9D9', borderBottomWidth: 1 }}
                        // editable={false}
                        // onChangeText={(text) => {
                        //     const item = this.state.editItemDetails;
                        //     if (this.state.selectedCode == 'hsn') {
                        //     item.hsnNumber = text;
                        //     this.setState({ editItemDetails: item });
                        //     } else {
                        //     item.sacNumber = text;
                        //     this.setState({ editItemDetails: item });
                        //     }
                        // }}
                    />
                    <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                        <TextInput
                            placeholder={'Opening Quantity'}
                            placeholderTextColor={'#808080'}
                            // value={
                            //     this.state.selectedCode == 'hsn'
                            //     ? this.state.editItemDetails.hsnNumber
                            //     : this.state.editItemDetails.sacNumber
                            // }
                            // keyboardType={'number-pad'}
                            style={{ borderColor: '#D9D9D9', borderBottomWidth: 1, width:'45%'}}
                            // editable={false}
                            // onChangeText={(text) => {
                            //     const item = this.state.editItemDetails;
                            //     if (this.state.selectedCode == 'hsn') {
                            //     item.hsnNumber = text;
                            //     this.setState({ editItemDetails: item });
                            //     } else {
                            //     item.sacNumber = text;
                            //     this.setState({ editItemDetails: item });
                            //     }
                            // }}
                        />
                        <TextInput
                            placeholder={'Closing Amount'}
                            placeholderTextColor={'#808080'}
                            // value={
                            //     this.state.selectedCode == 'hsn'
                            //     ? this.state.editItemDetails.hsnNumber
                            //     : this.state.editItemDetails.sacNumber
                            // }
                            // keyboardType={'number-pad'}
                            style={{ borderColor: '#D9D9D9', borderBottomWidth: 1, width:'45%'}}
                            // editable={false}
                            // onChangeText={(text) => {
                            //     const item = this.state.editItemDetails;
                            //     if (this.state.selectedCode == 'hsn') {
                            //     item.hsnNumber = text;
                            //     this.setState({ editItemDetails: item });
                            //     } else {
                            //     item.sacNumber = text;
                            //     this.setState({ editItemDetails: item });
                            //     }
                            // }}
                        />
                    </View>
                    {/* <Text style={{ color: '#1C1C1C', fontFamily: FONT_FAMILY.semibold ,marginTop:17}}>Custom Field 1 :</Text> */}
                    <TextInput
                        placeholder={ 'Custom Field 1'}
                        placeholderTextColor={'#808080'}
                        // value={
                        //     this.state.selectedCode == 'hsn'
                        //     ? this.state.editItemDetails.hsnNumber
                        //     : this.state.editItemDetails.sacNumber
                        // }
                        // keyboardType={'number-pad'}
                        style={{ borderColor: '#D9D9D9', borderBottomWidth: 1 }}
                        // editable={false}
                        // onChangeText={(text) => {
                        //     const item = this.state.editItemDetails;
                        //     if (this.state.selectedCode == 'hsn') {
                        //     item.hsnNumber = text;
                        //     this.setState({ editItemDetails: item });
                        //     } else {
                        //     item.sacNumber = text;
                        //     this.setState({ editItemDetails: item });
                        //     }
                        // }}
                    />
                    {/* <Text style={{ color: '#1C1C1C', fontFamily: FONT_FAMILY.semibold, marginTop:17 }}>Custom Field 2 :</Text> */}
                    <TextInput
                        placeholder={'Custom Field 2'}
                        placeholderTextColor={'#808080'}
                        // value={
                        //     this.state.selectedCode == 'hsn'
                        //     ? this.state.editItemDetails.hsnNumber
                        //     : this.state.editItemDetails.sacNumber
                        // }
                        // keyboardType={'number-pad'}
                        style={{ borderColor: '#D9D9D9', borderBottomWidth: 1 }}
                        // editable={false}
                        // onChangeText={(text) => {
                        //     const item = this.state.editItemDetails;
                        //     if (this.state.selectedCode == 'hsn') {
                        //     item.hsnNumber = text;
                        //     this.setState({ editItemDetails: item });
                        //     } else {
                        //     item.sacNumber = text;
                        //     this.setState({ editItemDetails: item });
                        //     }
                        // }}
                    />
                </View>
            </View>
            }
        </View>
        )
    }

    const CreateButton = ()=>{
        return (
            <TouchableOpacity
                style={{
                height: height * 0.06,
                width: width * 0.9,
                borderRadius: 25,
                backgroundColor: '#5773FF',
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'center',
                position: 'absolute',
                bottom: height * 0.01,
                }}
                onPress={ () => {
                // this.linkInvoiceToReceipt()
                }}>
                <Text
                style={{
                    fontFamily: 'AvenirLTStd-Black',
                    color: '#fff',
                    fontSize: 20,
                }}>
                Create
                </Text>
            </TouchableOpacity>
        )
    }

    const RenderVariants = ()=>{
        const [expandAcc, setExpandAcc] = useState(false);
        return (
            <View>
                <View
                    style={{
                        backgroundColor: '#E6E6E6',
                        flexDirection: 'row',
                        paddingVertical: 9,
                        paddingHorizontal: 16,
                        justifyContent: 'space-between'
                    }}>
                    <View style={{ flexDirection: 'row' }}>
                        <Icon style={{ marginRight: 10 }} name={'Path-12190'} size={16} color={DefaultTheme.colors.secondary} />
                        <Text style={{ color: '#1C1C1C', fontFamily: FONT_FAMILY.semibold }}>Variant</Text>
                    </View>
                    <Icon
                        style={{ transform: [{ rotate: expandAcc ? '180deg' : '0deg' }] }}
                        name={'9'}
                        size={16}
                        color="#808080"
                        onPress={() => {
                        setExpandAcc(!expandAcc);
                        }}
                    />
                </View>
                {
                expandAcc && (
                    <TouchableOpacity
                        // onPress={() => console.log(this.state.partyShippingAddress)}
                        style={{
                        marginVertical: 16,
                        paddingVertical: 10,
                        flexDirection: 'row',
                        alignSelf: 'center',
                        justifyContent: 'center',
                        }}>
                        <AntDesign name={'plus'} color={'blue'} size={18} style={{ marginHorizontal: 8 }} />
                        <Text numberOfLines={1} style={style.addItemMain}> Add options like multiple size or colours etc...</Text>
                    </TouchableOpacity>
                )
                }
            </View>
        )
    }
    
    return (
        <SafeAreaView style={{flex:1,backgroundColor:'white'}}>
            <View>
                <Animated.ScrollView
                    keyboardShouldPersistTaps="never"
                    style={{ backgroundColor: 'white', marginBottom:70}}
                    bounces={false}>
                    <_StatusBar statusBar={statusBar}/>
                    <Header header={'Create Stock'} isBackButtonVisible={true} backgroundColor={voucherBackground} />
                    <RenderStockName />
                    <RenderUnitGroup />
                    <RenderTaxes />
                    <RenderGroups />
                    <RenderLinkedAcc />
                    <RenderVariants />
                    <RenderOtherInfo />
                </Animated.ScrollView>
            </View>
            <CreateButton />
        </SafeAreaView>
    )
}

export default ProductScreen;

const getStyles = (theme: ThemeProps)=> StyleSheet.create({

})