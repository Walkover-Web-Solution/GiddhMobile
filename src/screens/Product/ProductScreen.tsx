import Header from "@/components/Header";
import useCustomTheme, { DefaultTheme, ThemeProps } from "@/utils/theme";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { Alert, Animated, DeviceEventEmitter, Dimensions, Keyboard, Platform, StatusBar, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from '@/core/components/custom-icon/custom-icon';
import { useCallback, useEffect, useRef, useState } from "react";
import colžr from '@/utils/colors';
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
import makeStyles from "./style";
import Dialog from 'react-native-dialog';
import Award from '../../assets/images/icons/customer_success.svg';
import Faliure from '../../assets/images/icons/customer_faliure.svg';



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
    uniqueName: string,
    variants:Object[],
    options:Object[],
    variantsCreated:boolean,
    customFields:Object[]
}

interface UnitRate {
    rate: number,
    stockUnitName: string,
    stockUnitUniqueName: string,
    accountUniqueName: string
}

export interface Warehouse {
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

export interface CustomFields {
    uniqueName: string,
    value: string | number
}
export interface Variants {
    name: string,
    archive: boolean,
    skuCode: string,
    salesTaxInclusive: boolean,
    purchaseTaxInclusive: boolean,
    fixedAssetTaxInclusive: boolean,
    customFields: CustomFields[],
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
    const {statusBar,styles, theme,voucherBackground} = useCustomTheme(makeStyles, 'Stock');
    const {height, width} = Dimensions.get('window');
    const [selectedUniqueTax,setSelectedUniqueTax]:any = useState({});
    const [isLoading,setIsLoading] = useState(false);
    const [variantsChecked, setVariantsChecked] = useState(false);
    const [taxArr,setTaxArr] = useState([]);
    const [parentGroupArr,setParentGroupArr] = useState([]);
    const [unitGroupArr,setUnitGroupArr] = useState([]);
    const [purchaseAccountArr,setPurchaseAccountArr] = useState([]);
    const [variantCustomFields,setVariantCustomFields] = useState([]);
    const [requiredCustomFieldsUniqueName,setRequiredCustomFieldsUniqueName] = useState([]);
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
        uniqueName: '',
        variants: [],
        options: [],
        variantsCreated:false,
        customFields: []
    });

    const otherDataRef : any = useRef(otherData);
    const [childKeys ,setChildKeys]  = useState({
        key1:random(0,10,true),
        key2:random(0,10,true),
        key3:random(0,10,true),
        key4:random(0,10,true),
        key5:random(0,10,true),
        key6:random(0,10,true),
        key7:random(0,10,true)
    })
    const [successDialog,setSuccessDialog]=useState(false);
    const [failureDialog,setFailureDialog]=useState(false);
    const [failureMessage,setFailureMessage] = useState("");
    
    const branchList = useSelector((state) => state?.commonReducer?.branchList);

    const navigation = useNavigation();

    const handleInputChange = (name:string, value:any) => {
        otherDataRef.current[name] = value;
      };


    const fetchAllTaxes = async () => {
        const result = await InventoryService.fetchAllTaxes();
        if(result?.data && result?.data?.status == 'success'){
            setTaxArr(result?.data?.body);
        }
    }

    const fetchAllParentGroup = async () => {
        const result = await InventoryService.fetchAllParentGroup("PRODUCT");
        if(result?.data && result?.data?.status == 'success'){
          const results = result?.data?.body?.results
          setParentGroupArr(results);
          if(selectedGroup == ''){
            setSelectedGroup(results?.[0]?.name);
            setSelectedGroupUniqueName(results?.[0]?.uniqueName)
          }
        }
    }
    
    const fetchStockUnitGroup = async () => {
        const result = await InventoryService.fetchStockUnitGroup();
        if(result?.data && result?.data?.status == 'success'){
            const results = result?.data?.body
            setUnitGroupArr(results);
            setSelectedUnitGroup(results?.[0]?.name)
            setSelectedUnitGroupUniqueName(results?.[0]?.uniqueName)
            await fetchUnitGroupMappingDebounce(results?.[0]?.uniqueName)
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
            setUnitGroupMapping(result?.data?.body);
        }
    }

    const fetchLinkedUnitMapping = async (unitUniqueName:string) =>{
        const result = await InventoryService.fetchLinkedUnitMapping(unitUniqueName);
        if(result?.data && result?.data?.status == 'success'){
            setSubUnits(result?.data?.body);
        }
        
    }

    const fetchVariantCustomfields = async ()=>{
        const result = await InventoryService.fetchVariantCustomfields();
        if(result?.data && result?.data?.status == 'success'){
            setVariantCustomFields(result?.data?.body);
            const requiredFields = result?.data?.body?.results?.filter(field => field?.isMandatory);

            const customFieldsUniqueNameArr = requiredFields.map(item=>item?.uniqueName);
            setRequiredCustomFieldsUniqueName(customFieldsUniqueNameArr);
            
            const initialStateCustomFields:CustomFields[] = result?.data?.body?.results?.map((item)=>({
                uniqueName: item?.uniqueName,
                value: "" 
            }));
            
            handleInputChange('customFields',initialStateCustomFields)
        }
        
    }

    const requiredFieldsCheck = (payload) =>{
        if(requiredCustomFieldsUniqueName?.length == 0)return true;
        for(let i=0; i<payload?.variants?.length; i++){
            const tempCustomFields = payload?.variants?.[i]?.customFields;
            if(tempCustomFields.length == 0 )return false;
            const exists = requiredCustomFieldsUniqueName.some(uniqueName => 
                tempCustomFields.some(item => item.uniqueName === uniqueName)
            );
            if(!exists){
                return false;
            }
        }
        return true;
    }
    const createStockProduct = async (payload:any,selectedGroup:string) => {
        if(selectedGroup){
            setIsLoading(true);
            const result = await InventoryService.createStockProduct(payload,selectedGroup);
            if(result?.data && result?.data?.status == 'success'){
                setIsLoading(false);
                setSuccessDialog(true);
                await clearAll();
                // ToastAndroid.show("Stock created successfully!",ToastAndroid.LONG);
                // navigation.goBack();
            }else{
                setIsLoading(false);
                setFailureDialog(true);
                setFailureMessage(result?.data?.message)
                // ToastAndroid.show(result?.data?.message, ToastAndroid.LONG);                
            }
        }else{
            if(parentGroupArr?.length == 0){
                await fetchAllParentGroup();
                const body = {
                    name: selectedUnitGroup,
                    uniqueName: selectedUnitGroupUniqueName,
                    hsnNumber: "",
                    sacNumber: "",
                    type: "PRODUCT"
                }
                const groupResponse = await InventoryService.addStockGroup(body);
                if(groupResponse?.data && groupResponse?.data?.status == 'success'){
                    setIsLoading(true);
                    const result = await InventoryService.createStockProduct(payload,groupResponse?.data?.body?.uniqueName);
                    if(result?.data && result?.data?.status == 'success'){
                        setIsLoading(false);
                        setSuccessDialog(true);
                        await clearAll();
                        // ToastAndroid.show("Stock created successfully!",ToastAndroid.LONG);
                        // navigation.goBack();
                    }else{
                        setIsLoading(false);
                        setFailureDialog(true);
                        setFailureMessage(result?.data?.message)
                        // ToastAndroid.show(result?.data?.message, ToastAndroid.LONG);                
                    }
                }else{
                    setIsLoading(false);
                    ToastAndroid.show(groupResponse?.data?.message, ToastAndroid.LONG);
                }
            }else{
                ToastAndroid.show("Please select group",ToastAndroid.SHORT);
            }
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


    // const RenderTaxModal = (
    //     <BottomSheet
    //       bottomSheetRef={taxModalRef}
    //       headerText='Select Taxes'
    //       headerTextColor='#084EAD'
    //       flatListProps={{
    //         data: taxArr,
    //         renderItem: ({item}) => {
    //           return (
    //             <TouchableOpacity
    //               style={styles.renderConatiner}
    //               onPress={()=>{
    //                   let updatedSelectedUniqueTax = {...selectedUniqueTax};  
    //                   if(Object.keys(updatedSelectedUniqueTax).length == 0 ){
    //                       const Obj = {
    //                           [item?.taxType] : item
    //                       }
    //                       setSelectedUniqueTax(Obj);
    //                   }else{
    //                       if(updatedSelectedUniqueTax?.[item?.taxType]?.uniqueName === item?.uniqueName){
    //                           delete updatedSelectedUniqueTax?.[item?.taxType];
    //                           setSelectedUniqueTax({...updatedSelectedUniqueTax});
    //                       }
    //                       else{
    //                           if(updatedSelectedUniqueTax?.[item?.taxType]){
    //                               console.log("can't add this item");
                                  
    //                           }else{
    //                               updatedSelectedUniqueTax = { ...updatedSelectedUniqueTax, [item?.taxType]: item };
    //                               setSelectedUniqueTax({...updatedSelectedUniqueTax})
    //                           }
    //                       }
    //                   }
    //               }}
    //               >
    //               <View style={styles.modalRenderItem}>
    //                 <View
    //                   style={[styles.modalCheckBox,{ borderColor: selectedUniqueTax?.[item?.taxType] ? '#CCCCCC' : '#1C1C1C'}]}>
    //                   {selectedUniqueTax?.[item?.taxType]?.uniqueName === item?.uniqueName && (
    //                     <AntDesign name={'check'} size={10} color={'#1C1C1C'} />
    //                   )}
    //                 </View>
    //                 <Text
    //                   style={styles.modalText}>
    //                   {item.name}
    //                 </Text>
    //               </View>
    //             </TouchableOpacity>
    //           );
    //         },
    //         ListEmptyComponent: () => {
    //           return (
    //             <View style={styles.modalCancelView}>
    //               <Text
    //                 style={styles.modalCancelText}>
    //                 No Taxes Available
    //               </Text>
    //             </View>
  
    //           );
    //         }
    //       }}
    //     />
    // );

    // const RenderGroupModal = (
    //     <BottomSheet
    //     bottomSheetRef={groupModalRef}
    //     headerText='Select Group'
    //     headerTextColor='#084EAD'
    //     adjustToContentHeight={false}
    //     flatListProps={{
    //         data: parentGroupArr,
    //         renderItem: ({item}) => {
    //         return (
    //             <TouchableOpacity 
    //             style={styles.button}
    //             onPress={() => {
    //                 setSelectedGroup(item?.name)
    //                 setSelectedGroupUniqueName(item?.uniqueName)
    //                 setBottomSheetVisible(groupModalRef, false);
    //             }}
    //             >
    //             <Icon name={selectedGroup == item?.name ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
    //             <Text style={styles.radiobuttonText}
    //             >
    //                 {item?.name}
    //             </Text>
    //             </TouchableOpacity>
    //         );
    //         },
    //         ListEmptyComponent: () => {
    //         return (
    //             <View style={styles.modalCancelView}>
    //             <Text
    //                 style={styles.modalCancelText}>
    //                 No Group Available
    //             </Text>
    //             </View>

    //         );
    //         }
    //     }}
    //     />
    // );

    // const RenderUnitGroupModal = (
    //     <BottomSheet
    //     bottomSheetRef={unitGroupModalRef}
    //     headerText='Select Unit Group'
    //     headerTextColor='#084EAD'
    //     flatListProps={{
    //         data: unitGroupArr,
    //         renderItem: ({item}) => {
    //         return (
    //             <TouchableOpacity 
    //             style={styles.button}
    //             onPress={() => {
    //                 setSelectedUnitGroup(item?.name)
    //                 setSelectedUnitGroupUniqueName(item?.uniqueName)
    //                 setBottomSheetVisible(unitGroupModalRef, false);
    //                 fetchUnitGroupMappingDebounce(item?.uniqueName)
    //             }}
    //             >
    //             <Icon name={selectedUnitGroup == item?.name ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
    //             <Text style={styles.radiobuttonText}>
    //                 {item?.name}
    //             </Text>
    //             </TouchableOpacity>
    //         );
    //         },
    //         ListEmptyComponent: () => {
    //         return (
    //             <View style={styles.modalCancelView}>
    //             <Text
    //                 style={styles.modalCancelText}>
    //                 No Group Available
    //             </Text>
    //             </View>

    //         );
    //         }
    //     }}
    //     />
    // );

    // const RenderUnitMappingModal = (
    //     <BottomSheet
    //     bottomSheetRef={unitGroupMappingModalRef}
    //     headerText='Select Unit Group'
    //     headerTextColor='#084EAD'
    //     flatListProps={{
    //         data: unitGroupMapping,
    //         renderItem: ({item}) => {
    //         return (
    //             <TouchableOpacity 
    //             style={styles.button}
    //             onPress={() => {
    //                 setUnit({
    //                     code: item?.stockUnitX?.code, 
    //                     name: item?.stockUnitX?.name, 
    //                     uniqueName: item?.stockUnitX?.uniqueName
    //                 });
    //                 setBottomSheetVisible(unitGroupMappingModalRef, false);
    //                 fetchLinkedUnitMapping(item?.stockUnitX?.uniqueName)
    //             }}
    //             >
    //             <Icon name={unit?.name == item?.stockUnitX?.name ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
    //             <Text style={styles.radiobuttonText}>
    //                 {item?.stockUnitX?.name} ({item?.stockUnitX?.code})
    //             </Text>
    //             </TouchableOpacity>
    //         );
    //         },
    //         ListEmptyComponent: () => {
    //         return (
    //             <View style={styles.modalCancelView}>
    //             <Text
    //                 style={styles.modalCancelText}>
    //                 No Unit Available
    //             </Text>
    //             </View>

    //         );
    //         }
    //     }}
    //     />
    // )

    // const RenderPurchaseSubUnitMappingModal = (
    //     <BottomSheet
    //     bottomSheetRef={purchaseSubUnitMappingModalRef}
    //     headerText='Select Unit'
    //     headerTextColor='#084EAD'
    //     flatListProps={{
    //         data: subUnits,
    //         renderItem: ({item}) => {
    //         return (
    //             <TouchableOpacity 
    //             style={styles.button}
    //             onPress={() => {
    //                 setPurchaseSubUnits(item);
    //                 setBottomSheetVisible(purchaseSubUnitMappingModalRef, false);
    //             }}
    //             >
    //             {purchaseSubUnits?.uniqueName 
    //             ? <Icon name={purchaseSubUnits?.uniqueName == item?.uniqueName ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
    //             : <Icon name={unit?.uniqueName == item?.uniqueName ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />}
                
    //             <Text style={styles.radiobuttonText}>
    //                 {item?.code}
    //             </Text>
    //             </TouchableOpacity>
    //         );
    //         },
    //         ListEmptyComponent: () => {
    //         return (
    //             <View style={styles.modalCancelView}>
    //             <Text
    //                 style={styles.modalCancelText}>
    //                 No Unit Available
    //             </Text>
    //             </View>

    //         );
    //         }
    //     }}
    //     />
    // )

    // const RenderSalesSubUnitMappingModal = (
    //     <BottomSheet
    //     bottomSheetRef={salesSubUnitMappingModalRef}
    //     headerText='Select Unit'
    //     headerTextColor='#084EAD'
    //     flatListProps={{
    //         data: subUnits,
    //         renderItem: ({item}) => {
    //         return (
    //             <TouchableOpacity 
    //             style={styles.button}
    //             onPress={() => {
    //                 setSalesSubUnits(item);
    //                 setBottomSheetVisible(salesSubUnitMappingModalRef, false);
    //             }}
    //             >
    //             {salesSubUnits?.uniqueName ? <Icon name={salesSubUnits?.uniqueName == item?.uniqueName ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
    //             :<Icon name={unit?.uniqueName == item?.uniqueName ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />}
    //             <Text style={styles.radiobuttonText}>
    //                 {item?.code}
    //             </Text>
    //             </TouchableOpacity>
    //         );
    //         },
    //         ListEmptyComponent: () => {
    //         return (
    //             <View style={styles.modalCancelView}>
    //             <Text
    //                 style={styles.modalCancelText}>
    //                 No Unit Available
    //             </Text>
    //             </View>

    //         );
    //         }
    //     }}
    //     />
    // )

    // const RenderSalesAccModal = (
    //     <BottomSheet
    //     bottomSheetRef={salesAccModalRef}
    //     headerText='Select Unit'
    //     headerTextColor='#084EAD'
    //     adjustToContentHeight={false}
    //     flatListProps={{
    //         data: salesAccountArr,
    //         renderItem: ({item}) => {
    //         return (
    //             <TouchableOpacity 
    //             style={styles.button}
    //             onPress={() => {
    //                 setSalesAccount(item);
    //                 setBottomSheetVisible(salesAccModalRef, false);
    //             }}
    //             >
    //             <Icon name={salesAccount?.name == item?.name ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
    //             <Text style={styles.radiobuttonText}>
    //                 {item?.name}
    //             </Text>
    //             </TouchableOpacity>
    //         );
    //         },
    //         ListEmptyComponent: () => {
    //         return (
    //             <View style={styles.modalCancelView}>
    //             <Text
    //                 style={styles.modalCancelText}>
    //                 No Accounts Available
    //             </Text>
    //             </View>

    //         );
    //         }
    //     }}
    //     />
    // )

    // const RenderPurchaseAccModal = (
    //     <BottomSheet
    //     bottomSheetRef={purchaseAccModalRef}
    //     headerText='Select Unit'
    //     headerTextColor='#084EAD'
    //     flatListProps={{
    //         data: purchaseAccountArr,
    //         renderItem: ({item}) => {
    //         return (
    //             <TouchableOpacity 
    //             style={styles.button}
    //             onPress={() => {
    //                 setPurchaseAccount(item);
    //                 setBottomSheetVisible(purchaseAccModalRef, false);
    //             }}
    //             >
    //             <Icon name={purchaseAccount?.name == item?.name ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
    //             <Text style={styles.radiobuttonText}>
    //                 {item?.name}
    //             </Text>
    //             </TouchableOpacity>
    //         );
    //         },
    //         ListEmptyComponent: () => {
    //         return (
    //             <View style={styles.modalCancelView}>
    //             <Text
    //                 style={styles.modalCancelText}>
    //                 No Accounts Available
    //             </Text>
    //             </View>

    //         );
    //         }
    //     }}
    //     />
    // )


    const successBox = (
        successDialog
          ? <Dialog.Container
            onRequestClose={() => setSuccessDialog(false)}
            visible={successDialog} onBackdropPress={() => setSuccessDialog(false)} contentStyle={styles.dialogContainer}>
            <Award />
            <Text style={[{ color: '#229F5F'},styles.dialogTypeText]}>Success</Text>
            <Text style={styles.dialogMessage}>Stock Group created successfully.</Text>
            <TouchableOpacity
              style={[styles.dialogBtn,{backgroundColor: '#229F5F'}]}
              onPress={() => {
                setSuccessDialog(false);
                navigation.goBack();
              }}
            >
              <Text style={styles.dialogBtnText}>Done</Text>
            </TouchableOpacity>
          </Dialog.Container>
          : null
      );
    
    const failureBox = (
    failureDialog
        ? <Dialog.Container
            onRequestClose={() => { setFailureDialog(false) }}
            visible={failureDialog} onBackdropPress={() => setFailureDialog(false)} contentStyle={styles.dialogContainer}>
            <Faliure />
            <Text style={[{ color: '#F2596F'},styles.dialogTypeText]}>Error!</Text>
            <Text style={styles.dialogMessage}>{failureMessage}</Text>
            <TouchableOpacity
            style={[styles.dialogBtn,{backgroundColor: '#F2596F'}]}
            onPress={() => {
                setFailureDialog(false);
            }}
            >
            <Text style={styles.dialogBtnText}>Try Again</Text>
            </TouchableOpacity>
        </Dialog.Container>
        : null
    );


    const createPayload = async() => {
        let taxesArr:string[] = [];
        Object.keys(selectedUniqueTax).map((item)=>{
          taxesArr.push(selectedUniqueTax?.[item]?.uniqueName);
        })
        
        
        const { wareHouseName, wareHouseUniqueName } = await getWareHouseDetails();
        
        const variants:Variants = {
            name: otherDataRef?.current?.name,
            archive: false,
            skuCode: otherDataRef?.current?.skuCode ? otherDataRef?.current?.skuCode : "",
            salesTaxInclusive: otherDataRef?.current?.salesMRPChecked ? otherDataRef?.current?.salesMRPChecked : false,
            purchaseTaxInclusive: otherDataRef?.current?.purchaseMRPChecked ? otherDataRef?.current?.purchaseMRPChecked : false,
            fixedAssetTaxInclusive: false,
            customFields: otherDataRef?.current?.customFields?.filter(item => (item?.value !== "")) || [],
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
        
        const updatedVariantsWithUnitRates = otherDataRef?.current?.variants?.map(variant => {
            const updatedWarehouseBalance = variant.warehouseBalance.map(warehouse => {
                if (warehouse.stockUnit.name === "" && warehouse.stockUnit.name === "") {
                  return {
                    ...warehouse,
                    stockUnit: {
                      name: unit?.name,
                      uniqueName: unit?.uniqueName
                    }
                  };
                }
                return warehouse;
              });
            return {
                ...variant,
                salesTaxInclusive: otherDataRef?.current?.salesMRPChecked ? otherDataRef?.current?.salesMRPChecked : false,
                purchaseTaxInclusive: otherDataRef?.current?.purchaseMRPChecked ? otherDataRef?.current?.purchaseMRPChecked : false,
                customFields: variant.customFields.filter(item => (item?.value !== "")),
                unitRates: variant.unitRates.filter(item => item.rate !== null && item.rate !== undefined),
                warehouseBalance:updatedWarehouseBalance
            }}
        );
          
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
            variants: otherDataRef?.current?.variantsCreated && otherDataRef?.current?.variants?.length > 0 ? updatedVariantsWithUnitRates : [variants],
            options: otherDataRef?.current?.variantsCreated && otherDataRef?.current?.options?.length > 0 ? otherDataRef?.current?.options : [],
            customFields: [],
            purchaseAccountUniqueNames: purchaseAccount?.uniqueName ? [purchaseAccount?.uniqueName]: [],
            salesAccountUniqueNames: salesAccount?.uniqueName ? [salesAccount?.uniqueName] : []
        }
        return payload;
    }

    const onClickCreateStock = async() => {
        const payload = await createPayload();
        if(payload?.name?.length > 0 ){
            if(payload?.stockUnitGroup?.uniqueName){
                if(payload?.stockUnitUniqueName){
                    if(payload?.variants?.length == 1 && payload?.variants?.[0]?.unitRates?.length > 0){
                        if(payload?.variants?.[0]?.unitRates?.[0]?.accountUniqueName && payload?.variants?.[0]?.unitRates?.[1]?.accountUniqueName ){
                            if(payload?.variants?.[0]?.unitRates?.[0]?.rate && payload?.variants?.[0]?.unitRates?.[1]?.rate){
                                if(!requiredFieldsCheck(payload)){
                                    ToastAndroid.show("Required custom fields can't be empty",ToastAndroid.LONG);
                                    return;
                                }
                                await createStockProduct(payload,selectedGroupUniqueName);
                            }else{
                               ToastAndroid.show("Specify rates for linked accounts.",ToastAndroid.LONG);
                            }
                        }else{
                            ToastAndroid.show("Linking account is mandatory if rates/unit is entered.",ToastAndroid.LONG);
                        }
                    }else{
                        if(!requiredFieldsCheck(payload)){
                            ToastAndroid.show("Required custom fields can't be empty",ToastAndroid.LONG);
                            return;
                        }
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

    const CreateButton = (
        // <TouchableOpacity
        //     style={[styles.createButton,{backgroundColor: isLoading ? '#E6E6E6' :'#5773FF'}]}
        //     disabled = {isLoading}
        //     onPress={onClickCreateStock}>
        //     <Text
        //     style={styles.createBtn}>
        //     Create
        //     </Text>
        // </TouchableOpacity>
        <TouchableOpacity
            onPress={onClickCreateStock}
            disabled = {isLoading}
            style={[styles.updatedCreateBtn,{borderColor: voucherBackground}]}>
            <Text style={[{color:voucherBackground},styles.updatedCreateBtnText]}> Create</Text>
        </TouchableOpacity>
    )

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
            uniqueName: '',
            variants:[],
            options:[],
            variantsCreated:false,
            customFields:[]
        }
        const newObjectKeys = {
            key1:random(0,10,true),
            key2:random(0,10,true),
            key3:random(0,10,true),
            key4:random(0,10,true),
            key5:random(0,10,true),
            key6:random(0,10,true),
            key7:random(0,10,true)
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
        setChildKeys(newObjectKeys);
        setOthersData(newObj)
        otherDataRef.current = {}
    }

    const clearAll = ()=>{
        resetState();
        // fetchAllTaxes();
        // fetchAllParentGroup();
        // fetchStockUnitGroup();
        // fetchPurchaseAccounts();
        // fetchSalesAccounts();
        fetchVariantCustomfields();
    }

    useEffect(() => {
        fetchAllTaxes();
        fetchAllParentGroup();
        fetchStockUnitGroup();
        fetchPurchaseAccounts();
        fetchSalesAccounts();
        fetchVariantCustomfields();
        DeviceEventEmitter.addListener(APP_EVENTS.ProductScreenRefresh, async () => {
            fetchAllParentGroup();
            fetchAllTaxes();
            fetchStockUnitGroup();
            fetchPurchaseAccounts();
            fetchSalesAccounts();
            fetchVariantCustomfields();
        });
    }, []);
    
    
    return (
        <SafeAreaView style={[styles.container,styles.backGround]}>
            <View>
                <Animated.ScrollView
                    style={styles.backGround}
                    bounces={false}>
                    <_StatusBar statusBar={statusBar}/>
                    <Header header={'Create Stock'} isBackButtonVisible={true} backgroundColor={voucherBackground} />
                    <RenderStockName
                        key={childKeys.key1}
                        handleInputChange={handleInputChange}
                        allData={otherDataRef}
                        clearAll={clearAll}
                        type="PRODUCT"
                    />
                    <RenderUnitGroup 
                        key={childKeys.key2} 
                        unit ={unit} 
                        unitGroupName={selectedUnitGroup} 
                        unitGroupModalRef={unitGroupModalRef} 
                        setBottomSheetVisible={setBottomSheetVisible} 
                        unitGroupMappingModalRef={unitGroupMappingModalRef} 
                        unitGroupArr={unitGroupArr} 
                        setSelectedUnitGroup={setSelectedUnitGroup} 
                        setSelectedUnitGroupUniqueName={setSelectedUnitGroupUniqueName} 
                        fetchUnitGroupMappingDebounce={fetchUnitGroupMappingDebounce} 
                        selectedUnitGroup={selectedUnitGroup} 
                        unitGroupMapping={unitGroupMapping}
                        setUnit={setUnit}
                        fetchLinkedUnitMapping={fetchLinkedUnitMapping}/>
                    <RenderTaxes 
                        key={childKeys.key3} 
                        selectedUniqueTax={selectedUniqueTax} 
                        taxModalRef={taxModalRef} 
                        setBottomSheetVisible={setBottomSheetVisible} 
                        taxArr={taxArr} 
                        setSelectedUniqueTax={setSelectedUniqueTax}
                    />
                    <RenderGroups 
                        key={childKeys.key4} 
                        groupName={selectedGroup}
                        groupModalRef={groupModalRef} 
                        setBottomSheetVisible={setBottomSheetVisible} 
                        fetchAllParentGroup={fetchAllParentGroup} 
                        parentGroupArr={parentGroupArr}
                        setSelectedGroup={setSelectedGroup} 
                        setSelectedGroupUniqueName={setSelectedGroupUniqueName}
                    />
                    <RenderLinkedAcc 
                        key={childKeys.key5}
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
                        handleRateChange={handleInputChange}
                        variantsChecked={variantsChecked}
                        setPurchaseSubUnits={setPurchaseSubUnits}
                        setSalesSubUnits={setSalesSubUnits}
                        subUnits={subUnits}
                        salesAccountArr={salesAccountArr}
                        purchaseAccountArr={purchaseAccountArr}
                        setPurchaseAccount={setPurchaseAccount}
                        setSalesAccount={setSalesAccount}
                    />
                    <RenderVariants 
                        key={childKeys.key7} 
                        setVariantsChecked={setVariantsChecked} 
                        handleGlobalInputChange={handleInputChange} 
                        unit={unit} 
                        globalData={otherDataRef?.current} 
                        subUnits={subUnits} 
                        purchaseAccount={purchaseAccount}
                        salesAccount={salesAccount}
                        variantCustomFields={variantCustomFields}
                    />
                    <RenderOtherInfo 
                        key={childKeys.key6} 
                        handleInputChange={handleInputChange} 
                        variantsChecked={variantsChecked} 
                        variantCustomFields={variantCustomFields} 
                        globalData={otherDataRef?.current}
                    />
                    {CreateButton}
                </Animated.ScrollView>
            </View>
            <Loader isLoading={isLoading}/>
            {/* {RenderTaxModal} */}
            {/* {RenderGroupModal} */}
            {/* {RenderUnitGroupModal} */}
            {/* {RenderUnitMappingModal} */}
            {/* {RenderPurchaseSubUnitMappingModal} */}
            {/* {RenderSalesSubUnitMappingModal} */}
            {/* {RenderSalesAccModal} */}
            {/* {RenderPurchaseAccModal} */}
            {successBox}
            {failureBox}
        </SafeAreaView>
    )
}

export default ProductScreen;
