import Header from "@/components/Header";
import useCustomTheme, { ThemeProps } from "@/utils/theme";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { Dimensions, FlatList, Keyboard, Platform, Pressable, ScrollViewComponent, StatusBar, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomFields, Variants } from "./ProductScreen";
import React, { useRef, useState } from "react";
import BottomSheet from "@/components/BottomSheet";
import { FONT_FAMILY } from "@/utils/constants";
import Icon from '@/core/components/custom-icon/custom-icon';
import { ScrollView } from "react-native-gesture-handler";

const {height, width} = Dimensions.get('window');
const VariantTableScreen = ({route})=>{
    
    const {variantCombination,handleGlobalInputChange,globalData,unit,subUnits,purchaseAccount,salesAccount,variantCustomFields} = route.params;
    const navigation = useNavigation();
    const { results:customFields } = variantCustomFields;
    const {statusBar,styles, voucherBackground,theme} = useCustomTheme(getStyles, 'PdfPreview');
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

    const handleVariantPurchaseUnitSelect = (boxIndex,unit)=>{
        const updatedObj = [...globalData?.variants]
        const tempUnitRates = updatedObj?.[boxIndex]?.unitRates?.filter((item)=>item?.accountUniqueName !== purchaseAccount?.uniqueName);
        tempUnitRates.push({
            rate: globalData?.variants?.[boxIndex]?.unitRates?.filter(item=>item?.accountUniqueName == purchaseAccount?.uniqueName)?.[0]?.rate 
                ? globalData?.variants?.[boxIndex]?.unitRates?.filter(item=>item?.accountUniqueName == purchaseAccount?.uniqueName)?.[0]?.rate
                : null,
            stockUnitName: unit?.code ,
            stockUnitUniqueName: unit?.uniqueName,
            accountUniqueName: purchaseAccount?.uniqueName
        })

        updatedObj[boxIndex]={
            ...updatedObj?.[boxIndex],
            unitRates : [...tempUnitRates]
        }
        handleGlobalInputChange('variants',updatedObj);
        
        

    }

    const handleVariantSalesUnitSelect = (boxIndex,unit)=>{
        const updatedObj = [...globalData?.variants]
        const tempUnitRates = updatedObj?.[boxIndex]?.unitRates?.filter((item)=>item?.accountUniqueName !== salesAccount?.uniqueName);
        tempUnitRates.push({
            rate: globalData?.variants?.[boxIndex]?.unitRates?.filter(item=>item?.accountUniqueName == salesAccount?.uniqueName)?.[0]?.rate 
                ? globalData?.variants?.[boxIndex]?.unitRates?.filter(item=>item?.accountUniqueName == salesAccount?.uniqueName)?.[0]?.rate
                : null ,
            stockUnitName: unit?.code ,
            stockUnitUniqueName: unit?.uniqueName,
            accountUniqueName: salesAccount?.uniqueName
        })

        updatedObj[boxIndex]={
            ...updatedObj?.[boxIndex],
            unitRates : [...tempUnitRates]
        }
        handleGlobalInputChange('variants',updatedObj);
    }

    const handleTextCustomFields = (boxIndex,value,fieldUniqueName)=>{
        const updatedObj = [...globalData?.variants]
        const tempCustomFields:CustomFields[] = [...globalData?.variants?.[boxIndex]?.customFields];
        
        const updatedFieldObj:CustomFields[] = tempCustomFields?.map(item=>{
            if(item?.uniqueName === fieldUniqueName){
                return {
                    ...item,
                    value:value
                }
            }else{
                return item
            }
        })
        
        updatedObj[boxIndex] = {
            ...updatedObj?.[boxIndex],
            customFields : [...updatedFieldObj]
        }
        handleGlobalInputChange('variants',updatedObj);
    }

    const VariantCard = React.memo(({item,index}) => {
        const variantSubUnitModal = useRef(null);
        const variantPurchaseSubUnitModal = useRef(null);
        const variantSalesSubUnitModal = useRef(null);
        const [selectedBoxIndex, setSelectedBoxIndex] = useState(null);
        const combinedValues = item.map(subItem => subItem.value).join(' / ');
        const [archive, setArchive] = useState({});
        const [variantUnit, setVaiantUnit]= useState({});
        const [tempCustomFieldsArr, setTempCustomFieldsArr]:any = useState({});

        const handleVariantUnitSelect = (boxIndex,unit)=>{
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
            
            setVaiantUnit(prevUnits =>({
                ...prevUnits,
                [boxIndex] : unit
            }))
    
            
        }
    
        const handleTempCustomFields = (boxIndex,value,fieldUniqueName)=>{
            const updatedObj = [...globalData?.variants]
            const tempCustomFields:CustomFields[] = [...globalData?.variants?.[boxIndex]?.customFields];
            
            const updatedFieldObj:CustomFields[] = tempCustomFields?.map(item=>{
                if(item?.uniqueName === fieldUniqueName){
                    return {
                        ...item,
                        value:value
                    }
                }else{
                    return item
                }
            })
            
            updatedObj[boxIndex] = {
                ...updatedObj?.[boxIndex],
                customFields : [...updatedFieldObj]
            }
            handleGlobalInputChange('variants',updatedObj);
            setTempCustomFieldsArr((prevState)=>({
                ...prevState,
                [boxIndex]:{
                    ...prevState?.[boxIndex],
                    [fieldUniqueName] : value
                }
            }));
        }
    
        const toggleArchive = (boxIndex) => {
            setArchive(prevArchive => ({
                ...prevArchive,
                [boxIndex]: !prevArchive[boxIndex]
            }));
        };
    
        const handleUnitFocus = (index,modalRef) => {
            setSelectedBoxIndex(index);
            setBottomSheetVisible(modalRef,true);
        };
    
        const handleUnitSelect = (unit,type) => {
            if (selectedBoxIndex !== null) {
                if(type === 'variantUnit'){
                    handleVariantUnitSelect(selectedBoxIndex, unit);
                    setBottomSheetVisible(variantSubUnitModal,false);
                }else if(type === 'variantPurchaseUnit'){
                    handleVariantPurchaseUnitSelect(selectedBoxIndex, unit);
                    setBottomSheetVisible(variantPurchaseSubUnitModal,false);
                }else if(type === 'variantSalesUnit'){
                    handleVariantSalesUnitSelect(selectedBoxIndex, unit);
                    setBottomSheetVisible(variantSalesSubUnitModal,false);
                }
            }
            setSelectedBoxIndex(null);
        };

        const RenderVariantSubUnitModal = (
            <BottomSheet
            bottomSheetRef={variantSubUnitModal}
            headerText='Select Unit'
            headerTextColor='#084EAD'
            flatListProps={{
                data: subUnits,
                renderItem: ({item}) => {
                return (
                    <TouchableOpacity 
                    style={styles.button}
                    onPress={() => {
                        handleUnitSelect({...item},'variantUnit')
                    }}
                    >
                        {
                        globalData?.variants?.[selectedBoxIndex ? selectedBoxIndex : 0]?.warehouseBalance?.[0]?.stockUnit?.uniqueName 
                            ? <Icon name={globalData?.variants?.[selectedBoxIndex ? selectedBoxIndex : 0]?.warehouseBalance?.[0]?.stockUnit?.uniqueName == item?.uniqueName ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} /> 
                            : <Icon name={unit?.uniqueName == item?.uniqueName ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                        }
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

        const RenderVariantPurchaseSubUnitModal = (
            <BottomSheet
            bottomSheetRef={variantPurchaseSubUnitModal}
            headerText='Select Unit'
            headerTextColor='#084EAD'
            flatListProps={{
                data: subUnits,
                renderItem: ({item}) => {
                return (
                    <TouchableOpacity 
                    style={styles.button}
                    onPress={() => {
                        handleUnitSelect({...item},'variantPurchaseUnit')
                    }}
                    >
                    {
                        globalData?.variants?.[selectedBoxIndex ? selectedBoxIndex : 0]?.unitRates?.filter(item=>item?.accountUniqueName == purchaseAccount?.uniqueName)?.[0]?.stockUnitUniqueName 
                        ? <Icon name={globalData?.variants?.[selectedBoxIndex ? selectedBoxIndex : 0]?.unitRates?.filter(item=>item?.accountUniqueName == purchaseAccount?.uniqueName)?.[0]?.stockUnitUniqueName == item?.uniqueName ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} /> 
                        : <Icon name={unit?.uniqueName == item?.uniqueName ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                    }
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
        
        const RenderVariantSalesSubUnitModal = (
            <BottomSheet
            bottomSheetRef={variantSalesSubUnitModal}
            headerText='Select Unit'
            headerTextColor='#084EAD'
            flatListProps={{
                data: subUnits,
                renderItem: ({item}) => {
                return (
                    <TouchableOpacity 
                    style={styles.button}
                    onPress={() => {
                        handleUnitSelect({...item},'variantSalesUnit')
                    }}
                    >
                    {
                    globalData?.variants?.[selectedBoxIndex ? selectedBoxIndex : 0]?.unitRates?.filter(item=>item?.accountUniqueName == salesAccount?.uniqueName)?.[0]?.stockUnitName 
                    ? <Icon name={globalData?.variants?.[selectedBoxIndex ? selectedBoxIndex : 0]?.unitRates?.filter(item=>item?.accountUniqueName == salesAccount?.uniqueName)?.[0]?.stockUnitUniqueName == item?.uniqueName ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} /> 
                    : <Icon name={unit?.uniqueName == item?.uniqueName ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                    }
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
    
        return(
            <View style={styles.box}>
                <View style={styles.titleContainer}>
                    <Text numberOfLines={1} style={[styles.combinedValues,{width:'75%'}]}>{combinedValues}</Text>
                        <TouchableOpacity 
                            onPress={()=>{    
                                toggleArchive(index);
                                const updatedObj = [...globalData?.variants]
                                updatedObj[index] = {
                                    ...updatedObj?.[index],
                                    archive: !updatedObj?.[index]?.archive
                                }
                                handleGlobalInputChange('variants',updatedObj);
                            }} 
                            style={styles.checkBoxView}>
                            <View style={[styles.checkView,{borderColor:voucherBackground}]}>
                            {
                                archive[index] 
                                ? <View style={[styles.tickBox, globalData?.variants?.[index]?.archive && {backgroundColor:voucherBackground}]} />
                                : globalData?.variants?.[index]?.archive 
                                    ? <View style={[styles.tickBox, globalData?.variants?.[index]?.archive && {backgroundColor:voucherBackground}]} />
                                    : <></> 
                            }
                            </View>
                            <Text style={styles.checkboxLabel}>Archive</Text>
                        </TouchableOpacity>
                </View>
                <View style={styles.row}>
                    <TouchableOpacity
                        onPress={()=>{
                            if(!unit?.uniqueName){
                                ToastAndroid.show('Please select unit',ToastAndroid.SHORT)

                            }else
                            handleUnitFocus(index,variantSubUnitModal);
                        }}
                        style={[styles.input,{justifyContent:'center'}]}>
                        { globalData?.variants?.[index]?.warehouseBalance?.[0]?.stockUnit?.uniqueName !== unit?.uniqueName   ? ( 
                        <Text style={{fontFamily:theme.typography.fontFamily.semiBold,color: '#084EAD' }}>
                            {globalData?.variants?.[index]?.warehouseBalance?.[0]?.stockUnit?.name ?globalData?.variants?.[index]?.warehouseBalance?.[0]?.stockUnit?.name  : unit?.name + " ("+ unit?.code +")" }
                        </Text>
                        ) : (
                        <Text style={{fontFamily:theme.typography.fontFamily.semiBold,color:unit?.uniqueName ? voucherBackground : '#000'}}>
                            {unit?.uniqueName ? unit?.name + " ("+ unit?.code +")" : 'Unit'}
                        </Text>
                        )}
                    </TouchableOpacity>
                    <TextInput
                        style={styles.input}
                        placeholder={globalData?.variants?.[index]?.skuCode ? globalData?.variants?.[index]?.skuCode : (globalData?.skuCode ? globalData?.skuCode : 'SKU Code' )}
                        placeholderTextColor={'#000'}
                        onChangeText={text =>{
                            const updatedObj = [...globalData?.variants]
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
                        placeholderTextColor={'#000'}
                        onChangeText={text =>{
                            const updatedObj = [...globalData?.variants]

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
                        placeholderTextColor={'#000'}
                        onChangeText={text =>{
                            const updatedObj = [...globalData?.variants]
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
                {/* purchase unit */}
                {purchaseAccount?.uniqueName && <><Text style={[styles.unitRateHeading,{width:'75%'}]}>Purchase Unit Rates</Text>
                    <View style={styles.row}>
                        <TouchableOpacity
                            onPress={()=>{
                                if(!unit?.uniqueName){
                                    ToastAndroid.show('Please select unit',ToastAndroid.SHORT)

                                }else
                                handleUnitFocus(index,variantPurchaseSubUnitModal);
                            }}
                            style={[styles.input,{justifyContent:'center'}]}>
                            { globalData?.variants?.[index]?.unitRates?.some((item)=>item?.accountUniqueName == purchaseAccount?.uniqueName) ? ( 
                            <Text style={{fontFamily:theme.typography.fontFamily.semiBold,color: '#084EAD' }}>
                                {globalData?.variants?.[index]?.unitRates?.filter(item=>item?.accountUniqueName == purchaseAccount?.uniqueName)?.[0]?.stockUnitName}
                            </Text>
                            ) : (
                            <Text style={{fontFamily:theme.typography.fontFamily.semiBold,color:unit?.uniqueName ? voucherBackground : '#000'}}>
                                {unit?.uniqueName ? unit?.name + " ("+ unit?.code +")" : 'Unit'}
                            </Text>
                            )}
                        </TouchableOpacity>
                        <TextInput
                            style={styles.input}
                            keyboardType='number-pad'
                            placeholder={globalData?.variants?.[index]?.unitRates?.some(item=>item?.accountUniqueName === purchaseAccount?.uniqueName && item?.rate != null ) 
                                ? globalData?.variants?.[index]?.unitRates?.filter(item=>item?.accountUniqueName == purchaseAccount?.uniqueName)?.[0]?.rate 
                                : 'Rate' }
                            placeholderTextColor={'#000'}
                            onChangeText={text =>{
                                const updatedObj = [...globalData?.variants]
                                const updatedUnitRates = updatedObj?.[index]?.unitRates?.some(item=>item?.accountUniqueName == purchaseAccount.uniqueName) 
                                ? updatedObj?.[index]?.unitRates?.map(item => item.accountUniqueName === purchaseAccount?.uniqueName ? {...item,rate: text.length == 0 ? null : text} : item) 
                                : [...updatedObj?.[index]?.unitRates
                                    ,{
                                    rate: text.length == 0 ? null : text ,
                                    stockUnitName: unit?.code ,
                                    stockUnitUniqueName: unit?.uniqueName,
                                    accountUniqueName: purchaseAccount?.uniqueName    
                                }];
                                
                                updatedObj[index] = {
                                    ...updatedObj?.[index],
                                    unitRates: updatedUnitRates
                                }
                                
                                handleGlobalInputChange('variants',updatedObj);
                            }}
                        />
                        
                    </View></>}
                {/* sales unit */}
                {salesAccount?.uniqueName && <><Text style={[styles.unitRateHeading,{width:'75%'}]}>Sales Unit Rates</Text>
                <View style={styles.row}>
                    <TouchableOpacity
                        onPress={()=>{
                            if(!unit?.uniqueName){
                                ToastAndroid.show('Please select unit',ToastAndroid.SHORT)

                            }else
                            handleUnitFocus(index,variantSalesSubUnitModal);
                        }}
                        style={[styles.input,{justifyContent:'center'}]}>
                        { globalData?.variants?.[index]?.unitRates?.some((item)=>item?.accountUniqueName == salesAccount?.uniqueName)   ? ( 
                        <Text style={{fontFamily:theme.typography.fontFamily.semiBold,color: '#084EAD' }}>
                            {globalData?.variants?.[index]?.unitRates?.filter(item=>item?.accountUniqueName == salesAccount?.uniqueName)?.[0]?.stockUnitName}
                        </Text>
                        ) : (
                        <Text style={{fontFamily:theme.typography.fontFamily.semiBold,color:unit?.uniqueName ? voucherBackground : '#000'}}>
                            {unit?.uniqueName ? unit?.name + " ("+ unit?.code +")" : 'Unit'}
                        </Text>
                        )}
                    </TouchableOpacity>
                    <TextInput
                        style={styles.input}
                        keyboardType='number-pad'
                        placeholder={globalData?.variants?.[index]?.unitRates?.some(item=>item?.accountUniqueName === salesAccount?.uniqueName && item?.rate != null ) 
                            ? globalData?.variants?.[index]?.unitRates?.filter(item=>item?.accountUniqueName == salesAccount?.uniqueName)?.[0]?.rate 
                            : 'Rate' }
                        placeholderTextColor={'#000'}
                        onChangeText={text =>{
                            const updatedObj = [...globalData?.variants]
                            const updatedUnitRates = updatedObj?.[index]?.unitRates?.some(item=>item?.accountUniqueName == salesAccount.uniqueName) 
                                ? updatedObj?.[index]?.unitRates?.map(item => item.accountUniqueName === salesAccount?.uniqueName ? {...item,rate: text.length == 0 ? null : text} : item) 
                                : [...updatedObj?.[index]?.unitRates,
                                    {
                                    rate: text.length == 0 ? null : text,
                                    stockUnitName: unit?.code ,
                                    stockUnitUniqueName: unit?.uniqueName,
                                    accountUniqueName: salesAccount?.uniqueName    
                                }];
                            updatedObj[index] = {
                                ...updatedObj?.[index],
                                unitRates: updatedUnitRates
                            }

                            handleGlobalInputChange('variants',updatedObj);
                            
                        }}
                    />
                    
                </View></>}
                {customFields.length > 0 && 
                <>
                    <Text style={styles.unitRateHeading}>Custom Fields</Text>
                    <ScrollView 
                        horizontal
                        style={{height:60}}
                        contentContainerStyle={[styles.scrollViewContainer,{flex:customFields?.length == 1 ? 1 :0}]}
                    >
                    {customFields.map((field)=>{
                        switch (field?.fieldType?.type) {
                            case "BOOLEAN":
                                return (
                                <View key={field.uniqueName} style={[styles.input,styles.booleanCustomField,{width:customFields?.length !==1 ? 250 :'auto'}]}>
                                    <Text style={styles.fieldTitle}>{field?.isMandatory ? field?.fieldName+'*' : field?.fieldName}</Text>
                                    <View style={[styles.radioBtnView,{marginTop:0}]}>
                                        <TouchableOpacity
                                        style={styles.radioBtn}
                                        onPress={() => {
                                            handleTempCustomFields(index,"true",field?.uniqueName);
                                        }}
                                        >
                                        {
                                            tempCustomFieldsArr?.[index]?.[field?.uniqueName] ? (tempCustomFieldsArr?.[index]?.[field?.uniqueName] !==null && tempCustomFieldsArr?.[index]?.[field?.uniqueName] !==undefined && tempCustomFieldsArr?.[index]?.[field?.uniqueName] == "true" && <View style={styles.selectedRadioBtn} />) 
                                            : globalData?.variants?.[index]?.customFields?.some(item=> item?.uniqueName == field?.uniqueName && item?.value !=="" && item?.value == "true" ) ? <View style={styles.selectedRadioBtn} /> : <></>
                                        }
                                        </TouchableOpacity>
                                        <Pressable onPress={() => {
                                            handleTempCustomFields(index,"true",field?.uniqueName);
                                        }}>
                                            <Text style={styles.radioBtnText}>True</Text>
                                        </Pressable>
                                    </View>
                                    <View style={[styles.radioBtnView,{marginTop:0}]}>
                                        <TouchableOpacity
                                        style={styles.radioBtn}
                                        onPress={() =>{
                                            handleTempCustomFields(index,"false",field?.uniqueName);
                                        }}
                                        >
                                        {
                                            tempCustomFieldsArr?.[index]?.[field?.uniqueName] ? (tempCustomFieldsArr?.[index]?.[field?.uniqueName] !==null && tempCustomFieldsArr?.[index]?.[field?.uniqueName] !==undefined && tempCustomFieldsArr?.[index]?.[field?.uniqueName] == "false" && <View style={styles.selectedRadioBtn} />) 
                                            : globalData?.variants?.[index]?.customFields?.some(item=> item?.uniqueName == field?.uniqueName && item?.value !=="" && item?.value == "false" ) ? <View style={styles.selectedRadioBtn} /> : <></>
                                        }
                                        </TouchableOpacity>
                                        <Pressable onPress={() =>{
                                            handleTempCustomFields(index,"false",field?.uniqueName);
                                        }}>
                                            <Text style={styles.radioBtnText}>False</Text>
                                        </Pressable>
                                    </View>
                                </View>
                                )
                            default:
                                return (
                                    <TextInput
                                        key={field.uniqueName}
                                        placeholder={ globalData?.variants?.[index]?.customFields?.some(item => item?.uniqueName == field?.uniqueName && item?.value !=="" ) 
                                        ? globalData?.variants?.[index]?.customFields?.filter(item => item?.uniqueName == field?.uniqueName)?.[0]?.value  
                                        : field?.isMandatory ? field?.fieldName+'(Required*)' : field?.fieldName }
                                        keyboardType={field?.fieldType?.type == 'NUMBER' ? 'number-pad' : 'default'}
                                        placeholderTextColor={'#000'}
                                        style={[styles.input,{width:field?.fieldType?.type != 'BOOLEAN' ? (width-72)/2 : 250}]}
                                        onChangeText={(text)=>{
                                            handleTextCustomFields(index,text,field?.uniqueName);
                                        }}
                                    />
                                )
                        }
                    })}
                    </ScrollView>
                </>}
                {RenderVariantSubUnitModal}
                {RenderVariantPurchaseSubUnitModal}
                {RenderVariantSalesSubUnitModal}
            </View>
        )
    });
    

    const renderItem = ({item ,index}) => <VariantCard item={item} index={index}/>

    return (
        <SafeAreaView style={styles.container}>
            <_StatusBar statusBar={statusBar}/>
            <Header header={'Variants'} isBackButtonVisible={true} backgroundColor={voucherBackground} 
            headerRightContent={
                <>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10 }}
                    style={{ padding: 8 }}
                    onPress={() => {
                        navigation.goBack();
                    }}
                  >
                    <Text style={styles.smallText}>Done</Text>
                  </TouchableOpacity>
                </>
              }/>
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
        marginBottom: 20,
        padding: 15,
        backgroundColor: '#ffffff',
        borderRadius: 10,
        borderColor: '#ddd',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
        marginHorizontal: 10,
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
    unitRateHeading : {
        fontSize: 14,
        fontFamily:theme.typography.fontFamily.semiBold,
        padding:3
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
    },
    radioGroupContainer :{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        width:'75%',
        alignSelf:'center' 
    },
    radioBtnView:{ 
        flexDirection: 'row', 
        alignItems: 'center',
        marginTop: 15,
    },
    radioBtn:{
        height: 20,
        width: 20,
        borderRadius: 10,
        backgroundColor: '#c4c4c4',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioBtnText:{ 
        marginLeft: 10, 
        fontFamily:theme.typography.fontFamily.semiBold 
    },
    selectedRadioBtn:{ 
        height: 14, 
        width: 14, 
        borderRadius: 7, 
        backgroundColor: '#084EAD' 
    },
    scrollViewContainer: {
        alignItems:'center'
    },
    booleanCustomField: {
        marginTop:0,
        flexDirection:'row',
        alignItems:'center'
        ,justifyContent:'space-evenly'
    },
    fieldTitle:{
        color:'#000',
        fontFamily:theme.typography.fontFamily.semiBold
    },
    checkBoxView: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkView:{
        width: 16,
        height: 16,
        borderWidth: 1,
        borderColor: 'blue',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 3,
    },
    tickBox:{
        width: 10,
        height: 10,
    },
    smallText: {
        fontFamily: FONT_FAMILY.bold,
        fontSize: 16,
        color: '#FFFFFF'
    }
})

export default React.memo(VariantTableScreen);