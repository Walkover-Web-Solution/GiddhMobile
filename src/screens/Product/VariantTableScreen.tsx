import Header from "@/components/Header";
import useCustomTheme, { ThemeProps } from "@/utils/theme";
import { useIsFocused } from "@react-navigation/native";
import  CheckBox  from "react-native-check-box";
import { Dimensions, FlatList, Keyboard, Platform, Pressable, StatusBar, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Variants } from "./ProductScreen";
import React, { useRef, useState } from "react";
import BottomSheet from "@/components/BottomSheet";
import { FONT_FAMILY } from "@/utils/constants";
import Icon from '@/core/components/custom-icon/custom-icon';

const {height, width} = Dimensions.get('window');
const VariantTableScreen = ({route})=>{
    const {variantCombination,handleGlobalInputChange,globalData,unit,subUnits} = route.params;
    console.log("variants",variantCombination);

    const {theme}  = useCustomTheme(getStyles);
    const variantSubUnitModal = useRef(null);
    const {statusBar,styles, voucherBackground} = useCustomTheme(getStyles, 'PdfPreview');
    const [selectedBoxIndex, setSelectedBoxIndex] = useState(null);
    const _StatusBar = ({ statusBar }: { statusBar: string }) => {
        const isFocused = useIsFocused();
        return isFocused ? <StatusBar backgroundColor={statusBar} barStyle={Platform.OS === 'ios' ? "dark-content" : "light-content"} /> : null
    }
    const setBottomSheetVisible = (modalRef: React.Ref<BottomSheet>, visible: boolean) => {
        if(visible){
          Keyboard.dismiss();
          modalRef?.current?.open();
        } else {
          modalRef?.current?.close();
        }
    };
    const [archive, setArchive] = useState({});
    const [variantUnit, setVaiantUnit]= useState({});

    const handleVariantUnitSelect = (boxIndex,unit)=>{
        console.log("unit recevied",unit);
        // handleGlobalInputChange
        const stockUnitObj = {
            ...globalData?.variants?.[boxIndex]?.warehouseBalance?.[0]?.stockUnit,
            name : unit?.code,
            uniqueName: unit?.uniqueName
        } 
        const updatedObj = [...globalData?.variants]
        updatedObj[boxIndex]={
            ...updatedObj?.[boxIndex],
            warehouseBalance : [{
                ...updatedObj?.[boxIndex]?.warehouseBalance?.[0],
                stockUnit:stockUnitObj
            }]
        }
        handleGlobalInputChange('variants',updatedObj);
        console.log("stockunit obj",stockUnitObj);
        
        // handleGlobalInputChange(,stockUnitObj);
        console.log("global data after checked----------->",globalData?.variants?.[boxIndex]?.warehouseBalance);
        
        setVaiantUnit(prevUnits =>({
            ...prevUnits,
            [boxIndex] : unit
        }))

        
    }

    const toggleArchive = (boxIndex) => {
        setArchive(prevArchive => ({
            ...prevArchive,
            [boxIndex]: !prevArchive[boxIndex]
        }));
    };

    const handleUnitFocus = (index) => {
        setSelectedBoxIndex(index);
        setBottomSheetVisible(variantSubUnitModal,true);
    };

    const handleUnitSelect = (unit) => {
        if (selectedBoxIndex !== null) {
            handleVariantUnitSelect(selectedBoxIndex, unit);
        }
        setBottomSheetVisible(variantSubUnitModal,false);
        setSelectedBoxIndex(null);
    };

    const renderItem = ( {item ,index}) => {
        const combinedValues = item.map(subItem => subItem.value).join(' / ');

        const RenderVariantSubUnitModal = (
            <BottomSheet
            bottomSheetRef={variantSubUnitModal}
            headerText='Select Unit'
            headerTextColor='#084EAD'
            // onClose={() => {
            //   setSelectedUniqueTax()
            // }}
            flatListProps={{
                data: subUnits,
                renderItem: ({item}) => {
                return (
                    <TouchableOpacity 
                    style={styles.button}
                    onPress={() => {
                        handleUnitSelect({...item})
                        // handleVariantUnitSelect(index)
                        // setBottomSheetVisible(variantSubUnitModal, false);
                    }}
                    >
                    {/* <Icon name={purchaseSubUnits?.uniqueName == item?.uniqueName ? 'radio-checked2' : 'radio-unchecked'} color={"#864DD3"} size={16} /> */}
                    <Icon name={false ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                    <Text style={styles.radiobuttonText}>
                        {item?.code}
                    </Text>
                    </TouchableOpacity>
                );
                },
                ListEmptyComponent: () => {
                return (
                    <View style={styles.modalCancelView}>
                    <Text
                        style={styles.modalCancelText}>
                        No Unit Available
                    </Text>
                    </View>
    
                );
                }
            }}
            />
        )
    console.log("variana units",variantUnit);
    
        return(
            <View style={styles.box}>
                <View style={styles.titleContainer}>
                    <Text numberOfLines={1} style={[styles.combinedValues,{width:'75%'}]}>{combinedValues}</Text>
                    <Pressable 
                        onPress={()=>{
                            console.log("helw");
                            
                            toggleArchive(index);
                            const updatedObj = [...globalData?.variants]
                            updatedObj[index] = {
                                ...updatedObj?.[index],
                                archive: !updatedObj?.[index]?.archive
                            }
                            // {"archive": false, "customFields": [Array], "fixedAssetTaxInclusive": false, "name": "fasdf", "purchaseTaxInclusive": false, "salesTaxInclusive": false, "skuCode": "", "unitRates": [Array], "warehouseBalance": [Array]}
                            // globalData.variants[index]={
                            //     ...globalData?.variants?.[index],
                            //     archive: !globalData?.variants?.[index]?.archive
                            // }


                            handleGlobalInputChange('variants',updatedObj);
                            console.log("global data",globalData,"warehouse",globalData?.variants?.[index]?.warehouseBalance);
                            
                        }}
                        style={styles.checkboxContainer}>
                        <CheckBox
                            checkBoxColor={'blue'}
                            uncheckedCheckBoxColor={'blue'}
                            style={{marginLeft: -4}}
                            isChecked={globalData?.variants?.[index]?.archive ? globalData?.variants?.[index]?.archive : archive[index]}
                            onClick={()=>{
                                toggleArchive(index);
                                const updatedObj = [...globalData?.variants]
                                updatedObj[index] = {
                                    ...updatedObj?.[index],
                                    archive: !updatedObj?.[index]?.archive
                                }
                                // {"archive": false, "customFields": [Array], "fixedAssetTaxInclusive": false, "name": "fasdf", "purchaseTaxInclusive": false, "salesTaxInclusive": false, "skuCode": "", "unitRates": [Array], "warehouseBalance": [Array]}
                                // globalData.variants[index]={
                                //     ...globalData?.variants?.[index],
                                //     archive: !globalData?.variants?.[index]?.archive
                                // }


                                handleGlobalInputChange('variants',updatedObj);
                                console.log("global data",globalData,"warehouse",globalData?.variants?.[index]?.warehouseBalance);
                                
                            }}
                        />
                        <Text style={styles.checkboxLabel}>Archive</Text>
                    </Pressable>
                </View>
                <View style={styles.row}>
                    <TouchableOpacity
                        onPress={()=>{
                            if(!unit?.uniqueName){
                                ToastAndroid.show('Please select unit',ToastAndroid.SHORT)

                            }else
                            handleUnitFocus(index);
                            // setBottomSheetVisible(variantSubUnitModal,true);
                        }}
                        // onPress={() => {
                        //     unitName !== 'Unit' ? setBottomSheetVisible(unitModalRef,true) : ToastAndroid.show("Please select unit group",ToastAndroid.SHORT);
                        //     // this.setState({
                        //     // isCurrencyModalVisible: !this.state.isCurrencyModalVisible,
                        //     // filteredCurrencyData: this.state.allCurrency,
                        //     // })
                        // }} 
                        style={[styles.input,{justifyContent:'center'}]}>
                            {/* {
                                globalData?.variants?.[index]?.warehouseBalance?.[0]?.stockUnit?.name !== unit?.code 
                            } */}
                        { globalData?.variants?.[index]?.warehouseBalance?.[0]?.stockUnit?.uniqueName !== unit?.uniqueName   ? ( 
                        <Text style={{fontFamily:theme.typography.fontFamily.semiBold,color: '#084EAD' }}>
                            {globalData?.variants?.[index]?.warehouseBalance?.[0]?.stockUnit?.name ?globalData?.variants?.[index]?.warehouseBalance?.[0]?.stockUnit?.name  : unit?.name + " ("+ unit?.code +")" }
                        </Text>
                        ) : (
                        <Text style={{fontFamily:theme.typography.fontFamily.semiBold}}>
                            {unit?.uniqueName ? unit?.name + " ("+ unit?.code +")" : 'Unit'}
                        </Text>
                        )}
                    </TouchableOpacity>
                    <TextInput
                        style={styles.input}
                        placeholder={globalData?.variants?.[index]?.skuCode ? globalData?.variants?.[index]?.skuCode : (globalData?.skuCode ? globalData?.skuCode : 'SKU Code' )}
                        // value={globalData?.variants?.[index]?.skuCode ? globalData?.variants?.[index]?.skuCode : (globalData?.skuCode ? globalData?.skuCode : '' )}
                        onChangeText={text =>{
                            const updatedObj = [...globalData?.variants]
                            // globalData.variants[index] = {
                            //     ...globalData?.variants?.[index],
                            //     skuCode: text
                            // }
                            updatedObj[index] = {
                                ...updatedObj?.[index],
                                skuCode: text
                            }

                            handleGlobalInputChange('variants',updatedObj);
                        }}
                    />
                    
                </View>
                <View style={styles.row}>
                    <TextInput
                        style={styles.input}
                        keyboardType="number-pad"
                        placeholder={globalData?.variants?.[index]?.warehouseBalance[0]?.openingAmount ? globalData?.variants?.[index]?.warehouseBalance[0]?.openingAmount : "Opening Amount" }
                        // value={inputs[index]?.openingAmount || ''}
                        // onChangeText={text => handleInputChange(index, 'openingAmount', text)}
                        onChangeText={text =>{
                            const updatedObj = [...globalData?.variants]
                            // globalData.variants[index] = {
                            //     ...globalData?.variants?.[index],
                            //     warehouseBalance : {
                            //         ...globalData?.variants?.[index]?.warehouseBalance,
                            //         openingAmount:text
                            //     } 
                            // }

                            updatedObj[index]={
                                ...updatedObj?.[index],
                                warehouseBalance : [{
                                    ...updatedObj?.[index]?.warehouseBalance?.[0],
                                    openingAmount : text
                                }]
                            }
                            handleGlobalInputChange('variants',updatedObj);
                        }}
                    />
                    <TextInput
                        style={styles.input}
                        keyboardType="number-pad"
                        placeholder={globalData?.variants?.[index]?.warehouseBalance[0]?.openingQuantity ? globalData?.variants?.[index]?.warehouseBalance[0]?.openingQuantity : "Opening Quantity" }
                        // value={inputs[index]?.openingQuantity || ''}
                        // onChangeText={text => handleInputChange(index, 'openingQuantity', text)}
                        onChangeText={text =>{
                            const updatedObj = [...globalData?.variants]
                            // globalData.variants[index] = { 
                            //     ...globalData?.variants?.[index],
                            //     warehouseBalance : {
                            //         ...globalData?.variants?.[index]?.warehouseBalance,
                            //         openingQuantity:text
                            //     } 
                            // }
                            updatedObj[index] = {
                                ...updatedObj?.[index],
                                warehouseBalance : [{
                                    ...updatedObj?.[index]?.warehouseBalance?.[0],
                                    openingQuantity:text
                                }]
                            }
                            handleGlobalInputChange('variants',updatedObj);
                        }}
                    />
                </View>
                {RenderVariantSubUnitModal}
            </View>
        )
    };

    return (
        <SafeAreaView style={styles.container}>
            <_StatusBar statusBar={statusBar}/>
            <Header header={'Variants'} isBackButtonVisible={true} backgroundColor={voucherBackground} />
            <View style={{flex:1,padding:5}}>
                <FlatList
                    data={variantCombination}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => index.toString()}
                />
            </View>
        </SafeAreaView>
    )
}

const getStyles = (theme: ThemeProps)=> StyleSheet.create({
    container : {
        flex:1,
        marginTop:0,
        borderRadius:7 ,
        backgroundColor:'white'
    },
    title: {
        fontSize: 24,
        marginBottom: 10,
    },
    box: {
        marginBottom: 15,
        padding: 10,
        backgroundColor: '#ffffff',
        borderRadius: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    combinedValues: {
        fontSize: 18,
        fontFamily:theme.typography.fontFamily.bold
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    input: {
        flex: 1,
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 10,
        paddingLeft: 8,
        marginRight: 5,
        fontFamily:theme.typography.fontFamily.semiBold
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkboxLabel: {
        marginLeft: 8,
        fontFamily:theme.typography.fontFamily.semiBold
    },
    item: {
        fontSize: 18,
    },
    button: {
        flexDirection: "row", 
        justifyContent: "flex-start", 
        paddingHorizontal: 20,
        paddingVertical: 15
    },
    radiobuttonText:{
        color: '#1C1C1C', 
        fontFamily: theme.typography.fontFamily.regular,
        marginLeft: 10
    },
    modalCancelView :{
        height: height * 0.3, 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingVertical: 8
    },
    modalCancelText :{
        flex: 1,
        color: '#1C1C1C',
        paddingVertical: 4,
        fontFamily: theme.typography.fontFamily.semiBold,
        fontSize: 14,
        textAlign: 'center',
        alignSelf: 'center'
    }
})

export default React.memo(VariantTableScreen);