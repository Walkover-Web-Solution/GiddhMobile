import Header from "@/components/Header"
import useCustomTheme, { DefaultTheme, ThemeProps } from "@/utils/theme"
import { useIsFocused, useNavigation } from "@react-navigation/native"
import { Animated, DeviceEventEmitter, Keyboard, Platform, Pressable, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Icon from '@/core/components/custom-icon/custom-icon';
import { Dimensions } from "react-native"
import { useEffect, useRef, useState } from "react"
import style from "../ProductGroup/style"
import color from '@/utils/colors';

import Entypo from 'react-native-vector-icons/Entypo'
import { InventoryService } from "@/core/services/inventory/inventory.service"
import { useSelector } from "react-redux"
import AsyncStorage from "@react-native-community/async-storage"
import { APP_EVENTS, FONT_FAMILY, STORAGE_KEYS } from "@/utils/constants"
import BottomSheet from "@/components/BottomSheet"
import AntDesign from 'react-native-vector-icons/AntDesign';
import RenderGroupName from "./RenderGroupName"
import RenderRadioBtn from "./RenderRadioBtn"
import RenderTaxes from "./RenderTaxes"
import RenderChildGroup from "./RenderChildGroup"


const ProductGroupScreen = ()=>{
    const _StatusBar = ({ statusBar }: { statusBar: string }) => {
        const isFocused = useIsFocused();
        return isFocused ? <StatusBar backgroundColor={statusBar} barStyle={Platform.OS === 'ios' ? "dark-content" : "light-content"} /> : null
    }
    // const { companyDetails } = useSelector((state)=>({
    //     companyDetails : state?.commonReducer?.companyDetails
    // }))

    const taxModalRef = useRef(null);
    const childGroupModalRef = useRef(null);
    const [taxArr,setTaxArr] = useState([]);
    const [parentGroupArr,setParentGroupArr] = useState([]);
    const [selectedUniqueTax, setSelectedUniqueTax]:any = useState({});
    const {statusBar,styles, voucherBackground} = useCustomTheme(getStyles, 'Group');
    const {height, width} = Dimensions.get('window');
    const [isChecked,setIsChecked] = useState(false);
    const [selectedGroup,setSelectedGroup] = useState('');
    const [selectedGroupUniqueName,setSelectedGroupUniqueName] = useState('');
    const [selectedCode,setSelectedCode] = useState('hsn');
    const [groupName,setGroupName] = useState('');
    const [groupUniqueName,setGroupUniqueName] = useState('');
    const [codeNumber,setCodeNumber] = useState('');

    const setBottomSheetVisible = (modalRef: React.Ref<BottomSheet>, visible: boolean) => {
        if(visible){
          Keyboard.dismiss();
          modalRef?.current?.open();
        } else {
          modalRef?.current?.close();
        }
      };
    const fetchAllTaxes = async () => {
        const result = await InventoryService.fetchAllTaxes();
        if(result?.data && result?.data?.status == 'success'){
            setTaxArr(result?.data?.body);
        }
    }
    
    const fetchAllParentGroup = async () => {
        const result = await InventoryService.fetchAllParentGroup();
        if(result?.data && result?.data?.status == 'success'){
            setParentGroupArr(result?.data?.body?.results);
        }
    }
    const resetState = ()=>{

    }
    const clearAll = () => {
      resetState();
      // this.resetState();
      // this.resetOnUncheckTax();
      // this.searchCalls();
      // this.setActiveCompanyCountry();
      // this.getAllTaxes();
      // this.getAllPaymentModes();
      // this.getCompanyVersionNumber();
    };
        
    useEffect(() => {
        fetchAllTaxes();
        fetchAllParentGroup();
        DeviceEventEmitter.addListener(APP_EVENTS.ProductGroupRefresh, async () => {
            fetchAllParentGroup();
            fetchAllTaxes();
        });
    }, []);


    const RenderTaxModal = (
          <BottomSheet
            bottomSheetRef={taxModalRef}
            headerText='Select Taxes'
            headerTextColor='#00B795'
            // onClose={() => {
            //   setSelectedUniqueTax()
            // }}
            flatListProps={{
              data: taxArr,
              renderItem: ({item}) => {
                return (
                  <TouchableOpacity
                    style={{paddingHorizontal: 20}}
                    onPress={()=>{
                        let updatedSelectedUniqueTax = {...selectedUniqueTax};  
                        if(Object.keys(updatedSelectedUniqueTax).length == 0 ){
                            const Obj = {
                                [item?.taxType] : item
                            }
                            // mapping = Obj;
                            setSelectedUniqueTax(Obj);
                        }else{
                            if(updatedSelectedUniqueTax?.[item?.taxType]?.uniqueName === item?.uniqueName){
                                delete updatedSelectedUniqueTax?.[item?.taxType];
                                setSelectedUniqueTax({...updatedSelectedUniqueTax});
                            }
                            else{
                                if(updatedSelectedUniqueTax?.[item?.taxType]){
                                    console.log("can't add this item");
                                    
                                }else{
                                    updatedSelectedUniqueTax = { ...updatedSelectedUniqueTax, [item?.taxType]: item };
                                    setSelectedUniqueTax({...updatedSelectedUniqueTax})
                                }
                            }
                        }
                    }}
                    >
                    <View style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 8}}>
                      <View
                        style={{
                          borderRadius: 1,
                          borderWidth: 1,
                          borderColor: selectedUniqueTax?.[item?.taxType] ? '#CCCCCC' : '#1C1C1C',
                          width: 18,
                          height: 18,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                        {selectedUniqueTax?.[item?.taxType]?.uniqueName === item?.uniqueName && (
                          <AntDesign name={'check'} size={10} color={'#1C1C1C'} />
                        )}
                      </View>
                      <Text
                        style={{
                          color: '#1C1C1C',
                          paddingVertical: 4,
                          fontFamily: FONT_FAMILY.semibold,
                          fontSize: 14,
                          textAlign: 'center',
                          marginLeft: 20,
                        }}>
                        {item.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              },
              ListEmptyComponent: () => {
                return (
                  <View style={{height: height * 0.3, flexDirection: 'row', alignItems: 'center', paddingVertical: 8}}>
                    <Text
                      style={{
                        flex: 1,
                        color: '#1C1C1C',
                        paddingVertical: 4,
                        fontFamily: FONT_FAMILY.semibold,
                        fontSize: 14,
                        textAlign: 'center',
                        alignSelf: 'center'
                      }}>
                      No Taxes Available
                    </Text>
                  </View>
    
                );
              }
            }}
          />
    );

    const RenderChildGroupModal = (
        <BottomSheet
          bottomSheetRef={childGroupModalRef}
          headerText='Select Parent Group'
          headerTextColor='#00B795'
          // onClose={() => {
          //   setSelectedUniqueTax()
          // }}
          flatListProps={{
            data: parentGroupArr,
            renderItem: ({item}) => {
              return (
                <TouchableOpacity 
                  style={style.button}
                  onPress={() => {
                    setSelectedGroup(item?.name)
                    setSelectedGroupUniqueName(item?.uniqueName)
                    setBottomSheetVisible(childGroupModalRef, false);
                  }}
                >
                  <Icon name={selectedGroup == item?.name ? 'radio-checked2' : 'radio-unchecked'} color={"#864DD3"} size={16} />
                  <Text style={style.radiobuttonText}
                  >
                    {item?.name}
                  </Text>
                </TouchableOpacity>
              );
            },
            ListEmptyComponent: () => {
              return (
                <View style={{height: height * 0.3, flexDirection: 'row', alignItems: 'center', paddingVertical: 8}}>
                  <Text
                    style={{
                      flex: 1,
                      color: '#1C1C1C',
                      paddingVertical: 4,
                      fontFamily: FONT_FAMILY.semibold,
                      fontSize: 14,
                      textAlign: 'center',
                      alignSelf: 'center'
                    }}>
                    No Taxes Available
                  </Text>
                </View>
  
              );
            }
          }}
        />
  );

      console.log("map--->",selectedUniqueTax);
    return (
        <SafeAreaView style={{flex:1,backgroundColor:'white'}}>
            <View>
                <Animated.ScrollView
                    keyboardShouldPersistTaps="never"
                    style={{ backgroundColor: 'white', marginBottom:70}}
                    bounces={false}>
                    <_StatusBar statusBar={statusBar}/>
                    <Header header={'Create Stock'} isBackButtonVisible={true} backgroundColor={voucherBackground} />
                    <RenderGroupName setGroupName={setGroupName} setGroupUniqueName={setGroupUniqueName}/>
                    <RenderRadioBtn selectedCode={selectedCode} setSelectedCode={setSelectedCode} setCodeNumber={setCodeNumber}/>
                    <RenderTaxes selectedUniqueTax={selectedUniqueTax} taxModalRef={taxModalRef} setBottomSheetVisible={setBottomSheetVisible}/>
                    <RenderChildGroup groupName={selectedGroup} childGroupModalRef={childGroupModalRef} setBottomSheetVisible={setBottomSheetVisible} isChecked={isChecked} setIsChecked={setIsChecked} />
                </Animated.ScrollView>
            </View>
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
            {RenderTaxModal}
            {RenderChildGroupModal}
        </SafeAreaView>

    )
}

const getStyles = (theme: ThemeProps)=> StyleSheet.create({

})

export default ProductGroupScreen;