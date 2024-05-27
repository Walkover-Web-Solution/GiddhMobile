import Header from "@/components/Header";
import useCustomTheme, { DefaultTheme, ThemeProps } from "@/utils/theme";
import { useIsFocused } from "@react-navigation/native";
import { Animated, DeviceEventEmitter, Dimensions, Keyboard, Platform, StatusBar, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from '@/core/components/custom-icon/custom-icon';
import { useCallback, useEffect, useRef, useState } from "react";
import style from './style';
import color from '@/utils/colors';
import { APP_EVENTS, FONT_FAMILY, STORAGE_KEYS } from "@/utils/constants";
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
import _, { random } from "lodash";
import { useSelector } from "react-redux";
import AsyncStorage from "@react-native-community/async-storage";
import Loader from "@/components/Loader";



interface RefDataMap {
    customField1Heading: string, 
    customField1Value: string, 
    customField2Heading: string, 
    customField2Value: string, 
    hsnChecked: boolean, 
    hsnNumber: string, 
    name: string, 
    openingAmount: number, 
    openingQuantity: number, 
    purchaseMRPChecked: boolean, 
    purchaseRate: number, 
    sacChecked: boolean, 
    sacNumber: string, 
    salesMRPChecked: boolean, 
    salesRate: number, 
    skuCode: string, 
    uniqueName: string
}

interface UnitRate {
    rate: number,
    stockUnitName: string,
    stockUnitUniqueName: string,
    accountUniqueName: string
}

interface Warehouse {
    warehouse: {
      name: string,
      uniqueName: string
    },
    stockUnit: {
      name: string,
      uniqueName: string
    },
    openingQuantity: number,
    openingAmount: number
  }
interface Variants {
    name: string,
    archive: boolean,
    skuCode: string,
    salesTaxInclusive: boolean,
    purchaseTaxInclusive: boolean,
    fixedAssetTaxInclusive: boolean,
    customFields: [],
    warehouseBalance: Warehouse[],
    unitRates: UnitRate[],
  }

interface Unit {
    code: string, 
    name: string, 
    uniqueName: string
}
interface Payload {
    type: string,
    name: string,
    uniqueName: string,
    stockUnitGroup: {
      name: string,
      uniqueName: string
    },
    stockUnitCode: string | null,
    stockUnitUniqueName: string,
    hsnNumber: string,
    sacNumber: string,
    taxes: string[],
    skuCode: string | null,
    openingQuantity: number | null,
    openingAmount: number | null,
    skuCodeHeading: string | null,
    customField1Heading: "Custom Field 1",
    customField1Value: string,
    customField2Heading: "Custom Field 2",
    customField2Value: string,
    isFsStock: boolean | null,
    manufacturingDetails:[] | null,
    accountGroup: string | null,
    lowStockAlertCount: 0,
    outOfStockSelling: boolean,
    variants: [Variants],
    options: [],
    customFields: [],
    purchaseAccountUniqueNames: string[],
    salesAccountUniqueNames: string[]
  }
  
const ProductScreen = ()=>{
    const _StatusBar = ({ statusBar }: { statusBar: string }) => {
        const isFocused = useIsFocused();
        return isFocused ? <StatusBar backgroundColor={statusBar} barStyle={Platform.OS === 'ios' ? "dark-content" : "light-content"} /> : null
    }
    const taxModalRef = useRef(null);
    const groupModalRef = useRef(null);
    const unitGroupModalRef = useRef(null);
    const unitGroupMappingModalRef = useRef(null);
    const purchaseSubUnitMappingModalRef = useRef(null);
    const salesSubUnitMappingModalRef = useRef(null);
    const salesAccModalRef = useRef(null);
    const purchaseAccModalRef = useRef(null);
    const {statusBar,styles, voucherBackground} = useCustomTheme(getStyles, 'Stock');
    const {height, width} = Dimensions.get('window');
    const [selectedUniqueTax,setSelectedUniqueTax]:any = useState({});
    const [isLoading,setIsLoading] = useState(false);
    // const [stockName, setStockName] = useState('');
    // const [stockUniqueName, setStockUniqueName] = useState('');
    // const [selectedCode,setSelectedCode] = useState('hsn');
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
    const [unit,setUnit] = useState<Unit>({
        code: "", 
        name: "", 
        uniqueName: ""
    });
    const [subUnits, setSubUnits] = useState([]);
    const [purchaseSubUnits, setPurchaseSubUnits]:any = useState({});
    const [salesSubUnits, setSalesSubUnits]:any = useState({});
    const [salesAccount,setSalesAccount]:any = useState({});
    const [purchaseAccount,setPurchaseAccount]:any = useState({});
    const [purchaseRate,setPurchaseRate] = useState(0);
    const [salesRate,setSalesRate] = useState(0);
    const [purchaseRadioBtn, setPurchaseRadioBtn] = useState(1);
    const [salesRadioBtn, setSalesRadioBtn] = useState(1);
    const [otherData,setOthersData] = useState<RefDataMap>({
        customField1Heading: '', 
        customField1Value: '', 
        customField2Heading: '', 
        customField2Value: '', 
        hsnChecked: true, 
        hsnNumber: '', 
        name: '', 
        openingAmount: 0, 
        openingQuantity: 0, 
        purchaseMRPChecked: false, 
        purchaseRate: 0, 
        sacChecked: false, 
        sacNumber: '', 
        salesMRPChecked: false, 
        salesRate: 0, 
        skuCode: '', 
        uniqueName: ''
    });

    const otherDataRef : any = useRef(otherData);
    // const [key1,setKey1]=useState(random);
    const [key1,setKey1] = useState(random(0,10,true));
    const [key2,setKey2] = useState(random(0,10,true));
    const [key3,setKey3] = useState(random(0,10,true));
    const [key4,setKey4] = useState(random(0,10,true));
    const [key5,setKey5] = useState(random(0,10,true));
    const [key6,setKey6] = useState(random(0,10,true));
    console.log("random",key1);
    
    const {branchList} = useSelector((state)=>({
        branchList:state?.commonReducer?.branchList
    }))




    const handleInputChange = (name:string, value:string) => {
        otherDataRef.current[name] = value;
      };


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
        if(result?.data && result?.data?.status == 'success'){
            setSubUnits(result?.data?.body);
        }
        
    }

    const createStockProduct = async (payload:any,selectedGroup:string) => {
        if(selectedGroup){
            setIsLoading(true);
            const result = await InventoryService.createStockProduct(payload,selectedGroup);
            if(result?.data && result?.data?.status == 'success'){
                setIsLoading(false);
                await clearAll();
                ToastAndroid.show("Stock created successfully!",ToastAndroid.LONG);
            }
        }else{
            ToastAndroid.show("Please select group",ToastAndroid.SHORT);
        }
        
    }

    const getWareHouseDetails = async () => {
        const activeBranchUniqueName = await AsyncStorage.getItem(STORAGE_KEYS.activeBranchUniqueName);
        const selectedBranch = branchList.filter((item:any)=>item?.uniqueName === activeBranchUniqueName);
        const { warehouseResource } = selectedBranch?.[0];
        const defaultWareHouse = warehouseResource?.filter((item:any)=>item?.isDefault == true);
        const { name:wareHouseName , uniqueName:wareHouseUniqueName } = defaultWareHouse?.[0];

        return { wareHouseName, wareHouseUniqueName};
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
                    setUnit({
                        code: item?.stockUnitX?.code, 
                        name: item?.stockUnitX?.name, 
                        uniqueName: item?.stockUnitX?.uniqueName
                    });
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

    const RenderPurchaseSubUnitMappingModal = (
        <BottomSheet
        bottomSheetRef={purchaseSubUnitMappingModalRef}
        headerText='Select Unit'
        headerTextColor='#00B795'
        // onClose={() => {
        //   setSelectedUniqueTax()
        // }}
        flatListProps={{
            data: subUnits,
            renderItem: ({item}) => {
            return (
                <TouchableOpacity 
                style={style.button}
                onPress={() => {
                    setPurchaseSubUnits(item);
                    setBottomSheetVisible(purchaseSubUnitMappingModalRef, false);
                }}
                >
                <Icon name={purchaseSubUnits?.uniqueName == item?.uniqueName ? 'radio-checked2' : 'radio-unchecked'} color={"#864DD3"} size={16} />
                <Text style={style.radiobuttonText}>
                    {item?.code}
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

    const RenderSalesSubUnitMappingModal = (
        <BottomSheet
        bottomSheetRef={salesSubUnitMappingModalRef}
        headerText='Select Unit'
        headerTextColor='#00B795'
        // onClose={() => {
        //   setSelectedUniqueTax()
        // }}
        flatListProps={{
            data: subUnits,
            renderItem: ({item}) => {
            return (
                <TouchableOpacity 
                style={style.button}
                onPress={() => {
                    setSalesSubUnits(item);
                    setBottomSheetVisible(salesSubUnitMappingModalRef, false);
                }}
                >
                <Icon name={salesSubUnits?.uniqueName == item?.uniqueName ? 'radio-checked2' : 'radio-unchecked'} color={"#864DD3"} size={16} />
                <Text style={style.radiobuttonText}>
                    {item?.code}
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

    const RenderSalesAccModal = (
        <BottomSheet
        bottomSheetRef={salesAccModalRef}
        headerText='Select Unit'
        headerTextColor='#00B795'
        // onClose={() => {
        //   setSelectedUniqueTax()
        // }}
        adjustToContentHeight={false}
        flatListProps={{
            data: salesAccountArr,
            renderItem: ({item}) => {
            return (
                <TouchableOpacity 
                style={style.button}
                onPress={() => {
                    setSalesAccount(item);
                    setBottomSheetVisible(salesAccModalRef, false);
                }}
                >
                <Icon name={salesAccount?.name == item?.name ? 'radio-checked2' : 'radio-unchecked'} color={"#864DD3"} size={16} />
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
                    No Accounts Available
                </Text>
                </View>

            );
            }
        }}
        />
    )

    const RenderPurchaseAccModal = (
        <BottomSheet
        bottomSheetRef={purchaseAccModalRef}
        headerText='Select Unit'
        headerTextColor='#00B795'
        // onClose={() => {
        //   setSelectedUniqueTax()
        // }}
        flatListProps={{
            data: purchaseAccountArr,
            renderItem: ({item}) => {
            return (
                <TouchableOpacity 
                style={style.button}
                onPress={() => {
                    setPurchaseAccount(item);
                    setBottomSheetVisible(purchaseAccModalRef, false);
                }}
                >
                <Icon name={purchaseAccount?.name == item?.name ? 'radio-checked2' : 'radio-unchecked'} color={"#864DD3"} size={16} />
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
                    No Accounts Available
                </Text>
                </View>

            );
            }
        }}
        />
    )



    const createPayload = async() => {
        let taxesArr:string[] = [];
        Object.keys(selectedUniqueTax).map((item)=>{
          taxesArr.push(selectedUniqueTax?.[item]?.uniqueName);
        })
        
        
        const { wareHouseName, wareHouseUniqueName } = await getWareHouseDetails();
        console.log("ware housr",wareHouseName,wareHouseUniqueName);
        
        const variants:Variants = {
            name: otherDataRef?.current?.name,
            archive: false,
            skuCode: otherDataRef?.current?.skuCode ? otherDataRef?.current?.skuCode : "",
            salesTaxInclusive: otherDataRef?.current?.salesMRPChecked ? otherDataRef?.current?.salesMRPChecked : false,
            purchaseTaxInclusive: otherDataRef?.current?.purchaseMRPChecked ? otherDataRef?.current?.purchaseMRPChecked : false,
            fixedAssetTaxInclusive: false,
            customFields: [],
            unitRates: (otherDataRef?.current?.purchaseRate || otherDataRef?.current?.salesRate) ? [
                {
                    rate: otherDataRef?.current?.purchaseRate,
                    stockUnitName: purchaseSubUnits?.uniqueName ? purchaseSubUnits?.uniqueName :  unit?.name ,
                    stockUnitUniqueName: purchaseSubUnits?.uniqueName ? purchaseSubUnits?.uniqueName : unit?.uniqueName,
                    accountUniqueName: purchaseAccount?.uniqueName
                },
                {
                    rate: otherDataRef?.current?.salesRate,
                    stockUnitName: salesSubUnits?.uniqueName ? salesSubUnits?.uniqueName : unit?.name,
                    stockUnitUniqueName:  salesSubUnits?.uniqueName ? salesSubUnits?.uniqueName : unit?.uniqueName,
                    accountUniqueName: salesAccount?.uniqueName   
                }
            ] : [],
            warehouseBalance:[
                {
                    warehouse: {
                        name: wareHouseName,
                        uniqueName: wareHouseUniqueName
                    },
                    stockUnit: {
                        name: unit?.name,
                        uniqueName: unit?.uniqueName
                    },
                    openingQuantity: otherDataRef?.current?.openingQuantity ? otherDataRef?.current?.openingQuantity : 0,
                    openingAmount: otherDataRef?.current?.openingAmount ? otherDataRef?.current?.openingAmount : 0
                }
            ]
        }
        
        const payload = {
            type: "PRODUCT",
            name: otherDataRef?.current?.name,
            uniqueName: otherDataRef?.current?.uniqueName ? otherDataRef?.current?.uniqueName : "",
            stockUnitGroup: {
              name: selectedUnitGroup ? selectedUnitGroup : "",
              uniqueName: selectedUnitGroupUniqueName ? selectedUnitGroupUniqueName : ""
            },
            stockUnitCode: null,
            stockUnitUniqueName: unit?.uniqueName,
            hsnNumber: otherDataRef?.current?.hsnChecked ? otherDataRef?.current?.hsnNumber : "",
            sacNumber: otherDataRef?.current?.sacChecked ? otherDataRef?.current?.sacNumber : "",
            taxes: taxesArr,
            skuCode: null,
            openingQuantity: null,
            openingAmount: null,
            skuCodeHeading: null,
            customField1Heading: "Custom Field 1",
            customField1Value: otherDataRef?.current?.customField1Value ? otherDataRef?.current?.customField1Value : "",
            customField2Heading: "Custom Field 2",
            customField2Value:  otherDataRef?.current?.customField2Value ? otherDataRef?.current?.customField2Value : "",
            isFsStock: null,
            manufacturingDetails:null,
            accountGroup: null,
            lowStockAlertCount: 0,
            outOfStockSelling: true,
            variants: [variants],
            options: [],
            customFields: [],
            purchaseAccountUniqueNames: purchaseAccount?.uniqueName ? [purchaseAccount?.uniqueName]: [],
            salesAccountUniqueNames: salesAccount?.uniqueName ? [salesAccount?.uniqueName] : []
        }
        console.log("units",variants?.unitRates);
        console.log("units",variants?.warehouseBalance);
        
        return payload;
    }

    const onClickCreateStock = async() => {
        const payload = await createPayload();
        console.log("payload",payload);
        if(payload?.name?.length > 0 ){
            if(payload?.stockUnitGroup?.uniqueName){
                if(payload?.stockUnitUniqueName){
                    if(payload?.variants?.[0]?.unitRates?.length > 0){
                        if(payload?.variants?.[0]?.unitRates?.[0]?.accountUniqueName && payload?.variants?.[0]?.unitRates?.[1]?.accountUniqueName ){
                            if(payload?.variants?.[0]?.unitRates?.[0]?.rate && payload?.variants?.[0]?.unitRates?.[1]?.rate){
                                await createStockProduct(payload,selectedGroupUniqueName);
                            }else{
                               ToastAndroid.show("Specify rates for linked accounts.",ToastAndroid.LONG);
                            }
                        }else{
                            ToastAndroid.show("Linking account is mandatory if rates/unit is entered.",ToastAndroid.LONG);
                        }
                    }else{
                        await createStockProduct(payload,selectedGroupUniqueName);
                    }
                }else{
                    ToastAndroid.show("No unit selected!",ToastAndroid.SHORT);
                }
            }else{
                ToastAndroid.show("Select Unit group!",ToastAndroid.SHORT);
            }
        }else{
            ToastAndroid.show("Enter stock name!",ToastAndroid.SHORT);
        }
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
                onPress={onClickCreateStock}>
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

    const resetState = ()=>{
        const newObj = {
            customField1Heading: '', 
            customField1Value: '', 
            customField2Heading: '', 
            customField2Value: '', 
            hsnChecked: true, 
            hsnNumber: '', 
            name: '', 
            openingAmount: 0, 
            openingQuantity: 0, 
            purchaseMRPChecked: false, 
            purchaseRate: 0, 
            sacChecked: false, 
            sacNumber: '', 
            salesMRPChecked: false, 
            salesRate: 0, 
            skuCode: '', 
            uniqueName: ''
        }
        setSelectedUniqueTax({})
        setSelectedGroup('');
        setSelectedGroupUniqueName('');
        setSelectedUnitGroup('');
        setSelectedUnitGroupUniqueName('');
        setUnit({
            code: "", 
            name: "", 
            uniqueName: ""
        });
        setPurchaseSubUnits({});
        setSalesSubUnits({});
        setPurchaseAccount({});
        setSalesAccount({});
        setKey1(random(0,10,true));
        setKey2(random(0,10,true));
        setKey3(random(0,10,true));
        setKey4(random(0,10,true));
        setKey5(random(0,10,true));
        setKey6(random(0,10,true));
        setOthersData(newObj)
        otherDataRef.current = {}
    }

    const clearAll = ()=>{
        resetState();
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
    
    // useEffect(()=>{

    // },[otherData])
    console.log("purchase",unitGroupMapping);
    console.log("subunits",subUnits);
    console.log("purchase acc",purchaseAccountArr);
    console.log("prate",purchaseRate);
    console.log("srate",salesRate);
    console.log("branch list",branchList);
    console.log("unit group",selectedUnitGroup);
    
    
    
    return (
        <SafeAreaView style={{flex:1,backgroundColor:'white'}}>
            <View>
                <Animated.ScrollView
                    keyboardShouldPersistTaps="never"
                    style={{ backgroundColor: 'white', marginBottom:70}}
                    bounces={false}>
                    <_StatusBar statusBar={statusBar}/>
                    <Header header={'Create Stock'} isBackButtonVisible={true} backgroundColor={voucherBackground} />
                    <RenderStockName
                        key={key1}
                        handleInputChange={handleInputChange}
                        allData={otherDataRef}
                        // stockName={stockName} 
                        // setStockName={setStockName} 
                        // stockUniqueName={stockUniqueName} 
                        // setStockUniqueName={setStockUniqueName} 
                        clearAll={clearAll}
                    />
                    <RenderUnitGroup key={key2} unit ={unit} unitGroupName={selectedUnitGroup} unitGroupModalRef={unitGroupModalRef} setBottomSheetVisible={setBottomSheetVisible} unitGroupMappingModalRef={unitGroupMappingModalRef}/>
                    <RenderTaxes key={key3} selectedUniqueTax={selectedUniqueTax} taxModalRef={taxModalRef} setBottomSheetVisible={setBottomSheetVisible}/>
                    <RenderGroups key={key4} groupName={selectedGroup} groupModalRef={groupModalRef} setBottomSheetVisible={setBottomSheetVisible} />
                    <RenderLinkedAcc 
                        key={key5}
                        unit={unit} 
                        purchaseSubUnitMappingModalRef={purchaseSubUnitMappingModalRef} 
                        salesSubUnitMappingModalRef={salesSubUnitMappingModalRef}
                        setBottomSheetVisible={setBottomSheetVisible} 
                        purchaseSubUnits={purchaseSubUnits} 
                        salesSubUnits={salesSubUnits}
                        salesAccModalRef={salesAccModalRef}
                        purchaseAccModalRef={purchaseAccModalRef}
                        purchaseAccount={purchaseAccount}
                        salesAccount={salesAccount}
                        // setPurchaseRate={setPurchaseRate}
                        // setSalesRate={setSalesRate}
                        handleRateChange={handleInputChange}
                        // setPurchaseRadioBtn={setPurchaseRadioBtn}
                        // setSalesRadioBtn={setSalesRadioBtn}
                        // purchaseRadioBtn={purchaseRadioBtn}
                        // salesRadioBtn={salesRadioBtn}
                    />
                    <RenderVariants />
                    <RenderOtherInfo key={key6} handleInputChange={handleInputChange} />
                </Animated.ScrollView>
            </View>
            <Loader isLoading={isLoading}/>
            <CreateButton />
            {RenderTaxModal}
            {RenderGroupModal}
            {RenderUnitGroupModal}
            {RenderUnitMappingModal}
            {RenderPurchaseSubUnitMappingModal}
            {RenderSalesSubUnitMappingModal}
            {RenderSalesAccModal}
            {RenderPurchaseAccModal}
        </SafeAreaView>
    )
}

export default ProductScreen;

const getStyles = (theme: ThemeProps)=> StyleSheet.create({

})