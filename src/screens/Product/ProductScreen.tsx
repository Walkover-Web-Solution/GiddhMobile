import Header from "@/components/Header";
import useCustomTheme, { DefaultTheme, ThemeProps } from "@/utils/theme";
import { useIsFocused } from "@react-navigation/native";
import { Animated, Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from '@/core/components/custom-icon/custom-icon';
import { useState } from "react";
import style from './style';
import CheckBox from 'react-native-check-box';
import Entypo from 'react-native-vector-icons/Entypo'
import color from '@/utils/colors';

const ProductScreen = ()=>{
    const _StatusBar = ({ statusBar }: { statusBar: string }) => {
        const isFocused = useIsFocused();
        return isFocused ? <StatusBar backgroundColor={statusBar} barStyle={Platform.OS === 'ios' ? "dark-content" : "light-content"} /> : null
    }
    const [stockName , setStockName] = useState('Enter Stock');
    const {statusBar,styles, voucherBackground} = useCustomTheme(getStyles, 'Stock');

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
            <Text style={style.fieldHeadingText}>{'Unit Group'}</Text>
            </View>
            <View style={{paddingVertical: 6, marginTop: 10, justifyContent: 'space-between'}}>
            <View style={{flexDirection: 'row', }}>
                <View
                style={[
                    style.buttonWrapper,
                    {marginHorizontal: 20},
                    {
                    justifyContent: 'center',
                    width: 150,
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
                    {width:150,height:40,justifyContent:'center',borderColor: false ? '#00B795' : '#d9d9d9'},
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
            <TouchableOpacity
                style={[style.fieldContainer, {flex: 1}]}
                // onPress={async () => {
                //     if (!this.state.partyName) {
                //     alert('Please select a party.');
                //     } else if (this.state.amountForReceipt == '') {
                //     alert('Please enter amount.');
                //     } else {
                //     this.setBottomSheetVisible(this.taxModalRef, true);
                //     await this.setState({
                //         isChecked: true
                //     });
                //     }
                // }} 
                >
                <View style={{flexDirection: 'row', flex: 1, alignItems: 'center'}}>
                <CheckBox
                    checkBoxColor={'#1CB795'}
                    uncheckedCheckBoxColor={DefaultTheme.colors.secondary}
                    style={{marginLeft: -4}}
                    onClick={()=>{
                        console.log("pressed");
                    }}
                    // onClick={async () => {
                    // if (!this.state.partyName) {
                    //         alert('Please select a party.');
                    //     } else if (this.state.amountForReceipt == '') {
                    //         alert('Please enter amount.');
                    //     } else {
                    // this.setBottomSheetVisible(this.taxModalRef, true);
                    // await this.setState({
                    //     isChecked: true
                    // });
                    // }
                    // }}
                    // isChecked={this.state.SelectedTaxData.taxDetailsArray.length > 0}
                />
                { -1 > 0 
                ? <View style={{flexDirection: 'row', flex: 1}}>
                    <View style={{flexDirection: 'row', flex: 1}}>
                    <Text style={[style.fieldHeadingText, {marginLeft: 5}]}>{'Tax'} </Text>
                    <Text style={[style.fieldHeadingText, {marginLeft: 5, color: '#00B795BF'}]}>{`(${this.state.SelectedTaxData.taxDetailsArray.map((item) => ` ${item.name}`) } )`} </Text>
                    </View>
                    <View style={{ alignSelf: 'center', justifyContent: 'flex-end'}}>
                    <Entypo name="edit" size={16} color={'#00B795'} style={{ paddingRight: 10}}/>
                    </View>
                    </View>
                : <Text style={[style.fieldHeadingText, {marginLeft: 5}]}>{'Tax'}</Text>}
                </View>
            </TouchableOpacity>
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
                </TouchableOpacity>
              </View>
            </View>
            </View>
        )
    }

    return (
        <SafeAreaView style={{flex:1}}>
            <View>
            <Animated.ScrollView
                keyboardShouldPersistTaps="never"
                style={{ backgroundColor: 'white'}}
                bounces={false}>
                <_StatusBar statusBar={statusBar}/>
                <Header header={'Create Stock'} isBackButtonVisible={true} backgroundColor={voucherBackground} />
                <RenderStockName />
                <RenderUnitGroup />
                <RenderTaxes />
                <RenderGroups />
            </Animated.ScrollView>
            </View>
        </SafeAreaView>
    )
}

export default ProductScreen;

const getStyles = (theme: ThemeProps)=> StyleSheet.create({

})