import Header from "@/components/Header"
import useCustomTheme, { DefaultTheme, ThemeProps } from "@/utils/theme"
import { useIsFocused } from "@react-navigation/native"
import { Animated, Platform, Pressable, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Icon from '@/core/components/custom-icon/custom-icon';
import { Dimensions } from "react-native"
import { useState } from "react"
import style from "../Product/style"
import color from '@/utils/colors';
import CheckBox from 'react-native-check-box';
import Entypo from 'react-native-vector-icons/Entypo'


const ProductGroupScreen = ()=>{
    const _StatusBar = ({ statusBar }: { statusBar: string }) => {
        const isFocused = useIsFocused();
        return isFocused ? <StatusBar backgroundColor={statusBar} barStyle={Platform.OS === 'ios' ? "dark-content" : "light-content"} /> : null
    }
    const {statusBar,styles, voucherBackground} = useCustomTheme(getStyles, 'Group');
    const {height, width} = Dimensions.get('window');

    const RenderGroupName = ()=>{
        return (
            <View>
                <View style={{flexDirection: 'row', minHeight: 50, alignItems: 'center', paddingTop: 14}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
                    <Icon name={'Sections'} color={DefaultTheme.colors.secondary} style={{margin: 16}} size={16} />
                    <TextInput
                        placeholderTextColor={'#808080'}
                        placeholder={'Enter Group Name*'}
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
                        placeholder={'Enter Unique Name'}
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

    const RenderRadioBtn = ()=>{
        const [selectedCode,setSelectedCode] = useState('hsn');
        return (
            <View
                style={{
                flexDirection: 'row',
                // backgroundColor: 'pink',
                justifyContent: 'space-between',
                marginVertical: 10,
                alignItems: 'center',
                }}>
                <View>
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
                    onPress={() => setSelectedCode('sac')}>
                    {selectedCode == 'sac' && (
                        <View style={{ height: 14, width: 14, borderRadius: 7, backgroundColor: '#229F5F' }} />
                    )}
                    </TouchableOpacity>

                    <Text style={{ marginLeft: 10 }}>SAC Code</Text>
                </View>
                </View>
                <TextInput
                placeholder={ selectedCode=='hsn'?'Enter HSN Code':'Enter SAC Code'}
                placeholderTextColor={'#808080'}
                // value={
                //     this.state.selectedCode == 'hsn'
                //     ? this.state.editItemDetails.hsnNumber
                //     : this.state.editItemDetails.sacNumber
                // }
                keyboardType={'number-pad'}
                style={{ borderColor: '#D9D9D9', borderBottomWidth: 1, width: '55%', marginRight: 16 }}
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
        )
    }

    const RenderTaxes = ()=>{
        return (
        <View style={style.fieldContainer}>
            <View style={{flexDirection: 'row',marginTop:10}}>
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
                            {marginLeft: 20,width:170},
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

    const RenderChildGroup = ()=>{
        const [isChecked,setIsChecked] = useState(false);
        return (
            <View style={[style.fieldContainer, {flex: 1}]} >
                <View style={{flexDirection: 'row', flex: 1, alignItems: 'center'}}>
                    <CheckBox
                        checkBoxColor={'#1CB795'}
                        uncheckedCheckBoxColor={'#1CB795'}
                        style={{marginLeft: -4}}
                        isChecked={isChecked}
                        onClick={()=>{
                            setIsChecked(!isChecked);
                        }}

                    />
                    <View style={{flexDirection: 'row', flex: 1}}>
                        <Pressable style={[style.fieldHeadingText, {marginLeft: 5}]} onPress={()=>{setIsChecked(!isChecked)}}><Text>Is it a child group?</Text></Pressable>
                    </View>
                </View>
                <View>
                {/* <Entypo name="edit" size={16} color={'#00B795'} style={{ paddingRight: 10}}/> */}
                {isChecked && <View style={{flexDirection: 'row',marginTop:20}}>
                    <TouchableOpacity style={{flexDirection: 'row'}} onPress={()=>{
                        setIsChecked(false);
                    }}
                    textColor={{color}}>
                        <View
                            style={[
                            style.buttonWrapper,
                            {marginLeft: 20,width:170},
                            {borderColor: false ? '#00B795' : '#d9d9d9'},
                            ]}>
                            <Text
                            style={[
                                style.buttonText,
                                {
                                color: false ? '#00B795' : '#868686',
                                },
                            ]}>
                            Select Parent Group
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>}
                </View>
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
                    <RenderGroupName />
                    <RenderRadioBtn />
                    <RenderTaxes />
                    <RenderChildGroup />
                </Animated.ScrollView>
            </View>
            <CreateButton />
        </SafeAreaView>

    )
}

const getStyles = (theme: ThemeProps)=> StyleSheet.create({

})

export default ProductGroupScreen;