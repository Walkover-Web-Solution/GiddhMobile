import Header from "@/components/Header";
import useCustomTheme, { DefaultTheme, ThemeProps } from "@/utils/theme";
import { useIsFocused } from "@react-navigation/native";
import { Animated, DeviceEventEmitter, Dimensions, Keyboard, Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from '@/core/components/custom-icon/custom-icon';
import { useCallback, useEffect, useRef, useState } from "react";
import style from './style';
import color from '@/utils/colors';
import { APP_EVENTS, FONT_FAMILY } from "@/utils/constants";
import AntDesign from 'react-native-vector-icons/AntDesign';
import RadioForm, { RadioButton, RadioButtonInput, RadioButtonLabel } from "react-native-simple-radio-button";
import RenderStockName from "./RenderStockName";
import RenderUnitGroup from "./RenderUnitGroup";
import RenderTaxes from "./RenderTaxes";
import RenderGroups from "./RenderGroups";
import RenderLinkedAcc from "./RenderLinkedAcc";
import RenderVariants from "./RenderVariants";
import RenderOtherInfo from "./RenderOtherInfo";
import { InventoryService } from "@/core/services/inventory/inventory.service";
import BottomSheet from "@/components/BottomSheet";
import _ from "lodash";

const ProductScreen = ()=>{
    const _StatusBar = ({ statusBar }: { statusBar: string }) => {
        const isFocused = useIsFocused();
        return isFocused ? <StatusBar backgroundColor={statusBar} barStyle={Platform.OS === 'ios' ? "dark-content" : "light-content"} /> : null
    }
    const taxModalRef = useRef(null);
    const groupModalRef = useRef(null);
    const unitGroupModalRef = useRef(null);
    const unitGroupMappingModalRef = useRef(null);
    const {statusBar,styles, voucherBackground} = useCustomTheme(getStyles, 'Stock');
    const {height, width} = Dimensions.get('window');
    const [expandAcc, setExpandAcc] = useState(false);
    const [selectedUniqueTax,setSelectedUniqueTax]:any = useState({});
    const [stockName, setStockName] = useState('');
    const [stockUniqueName, setStockUniqueName] = useState('');
    const [selectedCode,setSelectedCode] = useState('hsn');
    const [taxArr,setTaxArr] = useState([]);
    const [parentGroupArr,setParentGroupArr] = useState([]);
    const [unitGroupArr,setUnitGroupArr] = useState([]);
    const [purchaseAccountArr,setPurchaseAccountArr] = useState([]);
    const [salesAccountArr,setSalesAccountArr] = useState([]);
    const [selectedGroup,setSelectedGroup] = useState('');
    const [selectedGroupUniqueName,setSelectedGroupUniqueName] = useState('');
    const [selectedUnitGroup,setSelectedUnitGroup] = useState('');
    const [selectedUnitGroupUniqueName,setSelectedUnitGroupUniqueName] = useState('');
    const [unitGroupMapping, setUnitGroupMapping] = useState([]);
    const [unit,setUnit] = useState('');


    const fetchAllTaxes = async () => {
        console.log("ye new wala");
        
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
    
    const fetchStockUnitGroup = async () => {
        const result = await InventoryService.fetchStockUnitGroup();
        if(result?.data && result?.data?.status == 'success'){
            // console.log("print--->",result);
            setUnitGroupArr(result?.data?.body);
        }
    }

    const fetchPurchaseAccounts = async () => {
        const result = await InventoryService.fetchPurchaseAccounts();
        if(result?.data && result?.data?.status == 'success'){
            setPurchaseAccountArr(result?.data?.body?.results);
        }
    }


    const fetchSalesAccounts = async () => {
        const result = await InventoryService.fetchSalesAccounts();
        if(result?.data && result?.data?.status == 'success'){
            setSalesAccountArr(result?.data?.body?.results);
        }
    }

    const fetchUnitGroupMapping = async (uniqueName:string) => {
        const result = await InventoryService.fetchUnitGroupMapping([uniqueName])
        if(result?.data && result?.data?.status == 'success'){
            // console.log("mapping api",result);
            setUnitGroupMapping(result?.data?.body);
        }
    }

    const fetchLinkedUnitMapping = async (unitUniqueName:string) =>{
        const result = await InventoryService.fetchLinkedUnitMapping(unitUniqueName);
        console.log("result of linked unit",result);
        
    }

    const fetchUnitGroupMappingDebounce = _.debounce(fetchUnitGroupMapping,600);


    const setBottomSheetVisible = (modalRef: React.Ref<BottomSheet>, visible: boolean) => {
        if(visible){
          Keyboard.dismiss();
          modalRef?.current?.open();
        } else {
          modalRef?.current?.close();
        }
    };


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

    const RenderGroupModal = (
        <BottomSheet
        bottomSheetRef={groupModalRef}
        headerText='Select Group'
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
                    setBottomSheetVisible(groupModalRef, false);
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
                    No Group Available
                </Text>
                </View>

            );
            }
        }}
        />
    );

    const RenderUnitGroupModal = (
        <BottomSheet
        bottomSheetRef={unitGroupModalRef}
        headerText='Select Unit Group'
        headerTextColor='#00B795'
        // onClose={() => {
        //   setSelectedUniqueTax()
        // }}
        flatListProps={{
            data: unitGroupArr,
            renderItem: ({item}) => {
            return (
                <TouchableOpacity 
                style={style.button}
                onPress={() => {
                    setSelectedUnitGroup(item?.name)
                    setSelectedUnitGroupUniqueName(item?.uniqueName)
                    setBottomSheetVisible(unitGroupModalRef, false);
                    fetchUnitGroupMappingDebounce(item?.uniqueName)
                }}
                >
                <Icon name={selectedUnitGroup == item?.name ? 'radio-checked2' : 'radio-unchecked'} color={"#864DD3"} size={16} />
                <Text style={style.radiobuttonText}>
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
                    No Group Available
                </Text>
                </View>

            );
            }
        }}
        />
    );

    const RenderUnitMappingModal = (
        <BottomSheet
        bottomSheetRef={unitGroupMappingModalRef}
        headerText='Select Unit Group'
        headerTextColor='#00B795'
        // onClose={() => {
        //   setSelectedUniqueTax()
        // }}
        flatListProps={{
            data: unitGroupMapping,
            renderItem: ({item}) => {
            return (
                <TouchableOpacity 
                style={style.button}
                onPress={() => {
                    setUnit(item?.stockUnitX);
                    // setSelectedUnitGroup(item?.name)
                    // setSelectedUnitGroupUniqueName(item?.uniqueName)
                    setBottomSheetVisible(unitGroupMappingModalRef, false);
                    // fetchUnitGroupMappingDebounce(item?.uniqueName)
                    fetchLinkedUnitMapping(item?.stockUnitX?.uniqueName)
                }}
                >
                <Icon name={unit?.name == item?.stockUnitX?.name ? 'radio-checked2' : 'radio-unchecked'} color={"#864DD3"} size={16} />
                <Text style={style.radiobuttonText}>
                    {item?.stockUnitX?.name} ({item?.stockUnitX?.code})
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
                    No Unit Available
                </Text>
                </View>

            );
            }
        }}
        />
    )

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

    const clearAll = ()=>{

    }

    useEffect(() => {
        fetchAllTaxes();
        fetchAllParentGroup();
        fetchStockUnitGroup();
        fetchPurchaseAccounts();
        fetchSalesAccounts();
        DeviceEventEmitter.addListener(APP_EVENTS.ProductScreenRefresh, async () => {
            fetchAllParentGroup();
            fetchAllTaxes();
            fetchStockUnitGroup();
            fetchPurchaseAccounts();
            fetchSalesAccounts();
        });
    }, []);
    
    console.log("purchase",unitGroupMapping);
    
    return (
        <SafeAreaView style={{flex:1,backgroundColor:'white'}}>
            <View>
                <Animated.ScrollView
                    keyboardShouldPersistTaps="never"
                    style={{ backgroundColor: 'white', marginBottom:70}}
                    bounces={false}>
                    <_StatusBar statusBar={statusBar}/>
                    <Header header={'Create Stock'} isBackButtonVisible={true} backgroundColor={voucherBackground} />
                    <RenderStockName stockName={stockName} setStockName={setStockName} stockUniqueName={stockUniqueName} setStockUniqueName={setStockUniqueName} clearAll={clearAll}/>
                    <RenderUnitGroup unit ={unit} unitGroupName={selectedUnitGroup} unitGroupModalRef={unitGroupModalRef} setBottomSheetVisible={setBottomSheetVisible} unitGroupMappingModalRef={unitGroupMappingModalRef}/>
                    <RenderTaxes selectedUniqueTax={selectedUniqueTax} taxModalRef={taxModalRef} setBottomSheetVisible={setBottomSheetVisible}/>
                    <RenderGroups groupName={selectedGroup} groupModalRef={groupModalRef} setBottomSheetVisible={setBottomSheetVisible} />
                    <RenderLinkedAcc unit={unit} expandAcc={expandAcc} setExpandAcc={setExpandAcc}/>
                    <RenderVariants />
                    <RenderOtherInfo expandAcc={expandAcc} setExpandAcc={setExpandAcc} selectedCode={selectedCode} setSelectedCode={setSelectedCode}/>
                </Animated.ScrollView>
            </View>
            <CreateButton />
            {RenderTaxModal}
            {RenderGroupModal}
            {RenderUnitGroupModal}
            {RenderUnitMappingModal}
        </SafeAreaView>
    )
}

export default ProductScreen;

const getStyles = (theme: ThemeProps)=> StyleSheet.create({

})