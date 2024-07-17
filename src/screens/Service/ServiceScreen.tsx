import Header from "@/components/Header";
import useCustomTheme, { DefaultTheme, ThemeProps } from "@/utils/theme";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { Animated, DeviceEventEmitter, Dimensions, Keyboard, KeyboardAvoidingView, Platform, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { useEffect, useRef, useState } from "react";
import { APP_EVENTS, STORAGE_KEYS } from "@/utils/constants";
import { InventoryService } from "@/core/services/inventory/inventory.service";
import _, { random } from "lodash";
import { useSelector } from "react-redux";
import AsyncStorage from "@react-native-community/async-storage";
import Loader from "@/components/Loader";
import makeStyles from "../Product/style";
import Dialog from 'react-native-dialog';
import Award from '../../assets/images/icons/customer_success.svg';
import Faliure from '../../assets/images/icons/customer_faliure.svg';
import RenderStockName from "../Product/RenderStockName";
import RenderUnitGroup from "../Product/RenderUnitGroup";
import RenderTaxes from "../Product/RenderTaxes";
import RenderGroups from "../Product/RenderGroups";
import RenderLinkedAcc from "../Product/RenderLinkedAcc";
import RenderVariants from "../Product/RenderVariants";
import RenderOtherInfo from "../Product/RenderOtherInfo";
import Toast from "@/components/Toast";



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
  
const ServiceScreen = ()=>{
    
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
        key7:random(0,10,true),
        key8:random(0,10,true)
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
        const result = await InventoryService.fetchAllParentGroup("SERVICE");
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
                    type: "SERVICE"
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
                    Toast({message: groupResponse?.data?.message, position:'BOTTOM',duration:'LONG'}) 
                }
            }else{
                Toast({message: "Please select group", position:'BOTTOM',duration:'SHORT'})
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


    const successBox = (
        successDialog
          ? <Dialog.Container
            onRequestClose={() => setSuccessDialog(false)}
            visible={successDialog} onBackdropPress={() => setSuccessDialog(false)} contentStyle={styles.dialogContainer}>
            <Award />
            <Text style={[{ color: '#229F5F'},styles.dialogTypeText]}>Success</Text>
            <Text style={styles.dialogMessage}>Stock created successfully.</Text>
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
            type: "SERVICE",
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
                                    Toast({message: "Required custom fields can't be empty", position:'BOTTOM',duration:'LONG'})
                                    return;
                                }
                                await createStockProduct(payload,selectedGroupUniqueName);
                            }else{
                                Toast({message:"Specify rates for linked accounts.", position:'BOTTOM',duration:'LONG'})
                            }
                        }else{
                            Toast({message: "Linking account is mandatory if rates/unit is entered.", position:'BOTTOM',duration:'LONG'})
                        }
                    }else{
                        if(!requiredFieldsCheck(payload)){
                            Toast({message: "Required custom fields can't be empty", position:'BOTTOM',duration:'LONG'})
                            return;
                        }
                        await createStockProduct(payload,selectedGroupUniqueName);
                    }
                }else{
                    Toast({message: "No unit selected!", position:'BOTTOM',duration:'SHORT'})
                }
            }else{
                Toast({message: "Select Unit group!", position:'BOTTOM',duration:'SHORT'})
            }
        }else{
            Toast({message: "Enter stock name!", position:'BOTTOM',duration:'SHORT'})
        }
    }

    const CreateButton = (
        <TouchableOpacity
            style={[styles.createButton,{backgroundColor: isLoading ? '#E6E6E6' :'#5773FF'}]}
            disabled = {isLoading}
            onPress={onClickCreateStock}>
            <Text
            style={styles.createBtn}>
            Create
            </Text>
        </TouchableOpacity>
        // <TouchableOpacity
        //     onPress={onClickCreateStock}
        //     disabled = {isLoading}
        //     style={[styles.updatedCreateBtn,{borderColor: voucherBackground}]}>
        //     <Text style={[{color:voucherBackground},styles.updatedCreateBtnText]}> Create</Text>
        // </TouchableOpacity>
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
            key7:random(0,10,true),
            key8:random(0,10,true)
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
        DeviceEventEmitter.addListener(APP_EVENTS.ServiceScreenRefresh, async () => {
            fetchAllParentGroup();
            fetchAllTaxes();
            fetchStockUnitGroup();
            fetchPurchaseAccounts();
            fetchSalesAccounts();
            fetchVariantCustomfields();
        });
    }, []);
    
    
    return (
        // <View style={[styles.container,styles.backGround]}>
        <KeyboardAvoidingView behavior={ Platform.OS == 'ios' ? "padding" : undefined } style={[styles.container,styles.backGround]}>
            <View>
                <Animated.ScrollView
                    style={styles.backGround}
                    bounces={false}>
                    <_StatusBar statusBar={statusBar}/>
                    <Header header={'Create Stock'} isBackButtonVisible={true} backgroundColor={voucherBackground} 
                        headerRightContent={
                            <>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                hitSlop={{ top: 10, bottom: 10 }}
                                style={{ padding: 8 }}
                                onPress={() => {
                                    clearAll();
                                }}
                            >
                                {/* <Feather name="save" size={22} color={'#FFFFFF'} /> */}
                                <Text style={styles.smallText}>Clear</Text>
                            </TouchableOpacity>
                            </>
                        }
                    />
                    <RenderStockName
                        key={childKeys.key1}
                        handleInputChange={handleInputChange}
                        allData={otherDataRef}
                        clearAll={clearAll}
                        type="SERVICE"
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
                        setUnitGroupMapping={setUnitGroupMapping}
                        fetchLinkedUnitMapping={fetchLinkedUnitMapping}/>
                    <View style={{flexDirection:'row',width:'100%',marginBottom:5,paddingHorizontal:16,justifyContent:'space-between'}}>
                        <View style={{width:'48%'}}>
                            <RenderTaxes 
                                key={childKeys.key3} 
                                selectedUniqueTax={selectedUniqueTax} 
                                taxModalRef={taxModalRef} 
                                setBottomSheetVisible={setBottomSheetVisible} 
                                taxArr={taxArr} 
                                setSelectedUniqueTax={setSelectedUniqueTax}
                            />
                        </View>
                        <View style={{width:'48%'}}>
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
                        </View>
                    </View>
                    <RenderLinkedAcc 
                        key={childKeys.key5}
                        unit={unit} 
                        type="purchase"
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
                    <RenderLinkedAcc 
                        key={childKeys.key8}
                        unit={unit} 
                        type="sales"
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
            {successBox}
            {failureBox}
        </KeyboardAvoidingView>
        // </View>
    )
}

export default ServiceScreen;
