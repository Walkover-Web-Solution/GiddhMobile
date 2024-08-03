// App.js
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform, KeyboardAvoidingView, DeviceEventEmitter, RefreshControl, Keyboard } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { Modalize } from 'react-native-modalize';
import { useIsFocused } from '@react-navigation/native';
import useCustomTheme, { ThemeProps } from '@/utils/theme';
import Header from '@/components/Header';
import { InventoryService } from '@/core/services/inventory/inventory.service';
import { APP_EVENTS, FONT_FAMILY } from '@/utils/constants';
import Loader from '@/components/Loader';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Icon from '@/core/components/custom-icon/custom-icon';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import BottomSheet from '@/components/BottomSheet';
import InputField from '@/components/InputField';
import MatButton from '@/components/OutlinedButton';


interface FilterObject {
    expression: string,
    filterBy: string,
    rate: number,
    sortBy:string,
    sort:string,
    searchBy:string,
    search:string
}

const _Card = ({ item,index, onPress }) => {
    console.log("list render", index);
    const {statusBar,styles, theme} = useCustomTheme(style);
    
    return(
    <TouchableOpacity activeOpacity={0.7} onPress={()=>onPress(item)}>
        <View style={styles.card}>
            <View style={{flex:1}}>
                <Text style={styles.title}>{item.variantName}</Text>
                <View style={{flexDirection:'row',justifyContent:'space-between',paddingTop:5}}>
                    <Text style={styles.subtitle}>Stock: {item.stockName}</Text>
                    <Text style={[styles.subtitle,{fontSize:theme.typography.fontSize.small.size}]}>{item.stockUnitName+'('+item.stockUnitCode+')'}</Text>
                </View>
            </View>
            {/* <View>
                <Text style={styles.subtitle}>Unit</Text>
                <Text style={[styles.subtitle,{fontSize:theme.typography.fontSize.small.size}]}>{item.stockUnitName+'('+item.stockUnitCode+')'}</Text>
            </View> */}
            {/* <View>
                <Text style={styles.subtitle}>{item.stockUnitName}</Text>
                <Text style={[styles.subtitle,{fontSize:theme.typography.fontSize.small.size,textAlign:'right'}]}>{'('+item.stockUnitCode+')'}</Text>
            </View> */}
            {/* <Text style={[styles.subtitle,{fontSize:theme.typography.fontSize.small.size}]}>{item.stockUnitName+'('+item.stockUnitCode+')'}</Text> */}
        </View>
    </TouchableOpacity>)}

const Card = React.memo(_Card)

const InventoryListScreen = (props) => {
    const [dataArr,setDataArr] = useState<any[]>([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [page, setPage] = useState(1);
    const [refresh,setRefresh] = useState(true);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [filterFlag, setFilterFlag] = useState(false);
    const [filterObject,setFilterObject] = useState<FilterObject>({
        expression:"",
        filterBy:"",
        rate:0,
        searchBy:"",
        search:"",
        sort:"",
        sortBy:""
    })
    const modalizeRef = useRef(null);
    const filterModalizeRef = useRef(null);
    const filterByModalizeRef = useRef(null);
    const filterTypeModalizeRef = useRef(null);
    const filterExpModalizeRef = useRef(null);
    const searchModalizeRef = useRef(null);
    const searchSubModalizeRef = useRef(null);
    const sortModalizeRef = useRef(null);
    const sortByTypeModalizeRef = useRef(null);
    // const [name,setName] = useState(props?.route?.params?.params?.name);
    console.log("name",props?.route?.params?.params?.name);
    
    const {statusBar,styles, theme, voucherBackground} = useCustomTheme(style, props?.route?.params?.params?.name === 'Product Group' ? 'Group' : 'Stock');
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

    const onOpen = useCallback((item) => {
        setSelectedItem(item);
        modalizeRef.current?.open();
    },[]);


    const clearAll = () => {
        resetState();
    };

    const resetState = ()=> {
        setDataArr([]);
        setPage(1);
        setHasMore(true);
        setLoading(false);
        setHasMore(true);
        setRefresh(true);
        setFilterObject({
            expression:"",
            filterBy:"",
            rate:0,
            searchBy:"",
            search:"",
            sort:"",
            sortBy:""
        })
    }

    const loadMore = () => {
        if (hasMore) {
            setPage(prevPage => prevPage + 1);
        }else{
            setLoading(false);
            // setHasMore(false);
        }
    };

    const renderFooter = () => {
        if (!loading) return null;
        return (
            <View style={styles.footer}>
                {/* <Loader isLoading={loading}/> */}
                <ActivityIndicator />
            </View>
        );
    };

    const pageChange = (page:number)=>{
        setPage(1);
        setHasMore(true);
        setRefresh(true);
    }

    const fetchAllVariants = async (type:string,flag:boolean) => {
        console.log("call----------------->",type,loading,hasMore);
        
        if (!flag && !hasMore) return;
        const body = {
            search: "",
            searchBy: "",
            filterBy: filterObject?.filterBy ? filterObject?.filterBy : "",
            sortBy: filterObject?.sortBy,
            sort: filterObject?.sort,
            expression: filterObject?.expression ? filterObject?.expression : "GREATER_THAN" ,
            rate: filterObject?.rate > 0 ? filterObject?.rate : 0
        }
        setLoading(true);
        
        const result = await InventoryService.fetchAllVariants(type, flag ? 1 : page, body);
        if(result?.data && result?.data?.status == 'success'){
            const newData = result?.data?.body?.results;
            setRefresh(false);
            setDataArr(prevData => [...prevData, ...newData]);
            setHasMore(((flag ? 1: page) * result?.data?.body?.count) < result?.data?.body?.totalItems);
        } else{
            setLoading(false);
            console.error("error");
        }
    }
    

    useEffect(()=>{
        console.log("flag value",filterFlag,hasMore,page);
        if(page == 1){

        }
        else if(hasMore)
        fetchAllVariants(props?.route?.params?.params?.name === 'Product Inventory' ? 'PRODUCT' : 'SERVICE',false);
        
    },[page])

    useEffect(()=>{
        fetchAllVariants(props?.route?.params?.params?.name === 'Product Inventory' ? 'PRODUCT' : 'SERVICE',false);
        DeviceEventEmitter.addListener(APP_EVENTS.ServiceInventoryListRefresh, async () => {
            console.log("emitter");
            await clearAll();
            fetchAllVariants("SERVICE",false);

            // fetchAllVariants("SERVICE");
        });
        DeviceEventEmitter.addListener(APP_EVENTS.ProductInventoryListRefresh, async () => {
            console.log("emitter");
            await clearAll();
            fetchAllVariants("PRODUCT",false);
            // fetchAllVariants("PRODUCT");
        });
    },[])

    const DetailModal = (
        <BottomSheet
        bottomSheetRef={modalizeRef}
        headerText='Details'
        headerTextColor={voucherBackground}
        >
            {selectedItem && (
                <View style={styles.modalContent}>
                    <Text>Variant Unique Name: {selectedItem.variantUniqueName}</Text>
                    <Text>Stock Unique Name: {selectedItem.stockUniqueName}</Text>
                    <Text>Stock Group Unique Name: {selectedItem.stockGroupUniqueName}</Text>
                    <Text>Stock Unit Unique Name: {selectedItem.stockUnitUniqueName}</Text>
                    <Text>Unit Group Name: {selectedItem.unitGroupName}</Text>
                    <Text>Unit Group Unique Name: {selectedItem.unitGroupUniqueName}</Text>
                    <Text>Sales Tax Inclusive: {selectedItem.salesTaxInclusive ? 'Yes' : 'No'}</Text>
                    <Text>Purchase Tax Inclusive: {selectedItem.purchaseTaxInclusive ? 'Yes' : 'No'}</Text>
                    <Text>Fixed Asset Tax Inclusive: {selectedItem.fixedAssetTaxInclusive ? 'Yes' : 'No'}</Text>
                    <Text>Archive: {selectedItem.archive ? 'Yes' : 'No'}</Text>
                    <Text>System Generated: {selectedItem.systemGenerated ? 'Yes' : 'No'}</Text>
                </View>
            )}
        </BottomSheet>
    )

    const FilterModal = (
        <BottomSheet
            bottomSheetRef={filterModalizeRef}
            headerText='Advanced Filter'
            headerTextColor={voucherBackground}
            // adjustToContentHeight={false}
            // snapPoint={250}
            >
            <View style={styles.modalContent}>
                <View style={styles.row}>
                    <View style={{width:'48%'}}>
                        <MatButton 
                            lable="Filter By"
                            value={filterObject?.filterBy?.length > 0 && (filterObject?.filterBy === "sales_rate" ? "Sales Rate" : "Purchase Rate") }
                            onPress={()=>{
                                setBottomSheetVisible(filterByModalizeRef,true)
                            }}
                        />
                    </View>
                    <View style={{width:'48%'}}>
                        <MatButton 
                            lable="Type"
                            value="Rate"
                            onPress={()=>{
                                setBottomSheetVisible(filterTypeModalizeRef,true)
                            }}
                            />
                    </View>
                </View>
                <View style={styles.row}>
                    <View style={{width:'48%'}}>
                        <MatButton 
                            lable="Expression"
                            value={filterObject?.expression?.length > 0 && (filterObject?.expression) }
                            onPress={() => {
                                setBottomSheetVisible(filterExpModalizeRef,true)
                                // unitName !== 'Unit' ? setBottomSheetVisible(unitModalRef,true) : Toast({message: "Please select unit group", position:'BOTTOM',duration:'SHORT'});
                            }}
                        />
                    </View>
                    <View style={{width:'48%'}}>
                        <InputField 
                            lable="Amount"
                            keyboardType="numeric"
                            value={filterObject?.rate > 0 ? filterObject?.rate : ""}
                            isRequired={false}
                            placeholderTextColor={'#808080'}
                            onChangeText={(val:number) => {
                                const tempObj:FilterObject = {
                                    ...filterObject,
                                    rate: val
                                }
                                setFilterObject(tempObj)
                            }}
                        />    
                    </View>
                </View>
                <View style={{flexDirection:'row'}}>
                    <TouchableOpacity
                        style={styles.doneBtn}
                        onPress={() => {
                            console.log("object create",filterObject);
                            if(filterObject?.expression?.length > 0 && filterObject?.filterBy?.length > 0 && filterObject?.rate > 0){
                                // pageChange(1);
                                // setFilterFlag(true);
                                setDataArr([]);
                                setRefresh(true);
                                setHasMore(true);
                                setLoading(true);
                                // setPage(1);
                                // if(page == 1)
                                setTimeout(()=>{setPage(1);fetchAllVariants(props?.route?.params?.params?.name === 'Product Inventory' ? 'PRODUCT' : 'SERVICE',true);},2000);
                                setBottomSheetVisible(filterModalizeRef,false);
                            }
                        }}
                        >
                        <Text style={styles.doneBtnText}>Filter</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.doneBtn,{marginLeft:10}]}
                        onPress={() => {
                            const tempObj:FilterObject = {
                                expression:"",
                                filterBy:"",
                                rate:0
                            }
                            setFilterObject(tempObj);
                        }}
                        >
                        <Text style={styles.doneBtnText}>Reset</Text>
                    </TouchableOpacity>
                </View>
            </View>
            </BottomSheet>
    )

    const FilterByModal = (
        <BottomSheet
        bottomSheetRef={filterByModalizeRef}
        headerText='Filter by'
        headerTextColor={voucherBackground}
        >
            <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    const tempObj:FilterObject = {
                        ...filterObject,
                        filterBy: "purchase_rate"
                    }
                    setFilterObject(tempObj)
                    setBottomSheetVisible(filterByModalizeRef, false);
                }}
                >
                <Icon name={filterObject?.filterBy === 'purchase_rate' ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />                
                <Text style={styles.radiobuttonText}>
                    Purchase Rate
                </Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    const tempObj:FilterObject = {
                        ...filterObject,
                        filterBy: "sales_rate"
                    }
                    setFilterObject(tempObj)
                    setBottomSheetVisible(filterByModalizeRef, false);
                }}
                >
                <Icon name={filterObject?.filterBy === 'sales_rate' ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                <Text style={styles.radiobuttonText}>
                    Sales Rate
                </Text>
            </TouchableOpacity>
        </BottomSheet>
    )

    const FilterTypeModal = (
        <BottomSheet
        bottomSheetRef={filterTypeModalizeRef}
        headerText='Type'
        headerTextColor={voucherBackground}
        >
            <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    // setSubUnits(item);
                    setBottomSheetVisible(filterTypeModalizeRef, false);
                }}
                >
                <Icon name={true ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                
                <Text style={styles.radiobuttonText}>
                    Rate
                </Text>
            </TouchableOpacity>
        </BottomSheet>
    )

    const FilterExpModal = (
        <BottomSheet
        bottomSheetRef={filterExpModalizeRef}
        headerText='Expression'
        headerTextColor={voucherBackground}
        >
            <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    const tempObj:FilterObject = {
                        ...filterObject,
                        expression:"EQUAL"
                    }
                    setFilterObject(tempObj)
                    setBottomSheetVisible(filterExpModalizeRef, false);
                }}
                >
                <Icon name={filterObject?.expression === "EQUAL" ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                <Text style={styles.radiobuttonText}>
                    Equals
                </Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    const tempObj:FilterObject = {
                        ...filterObject,
                        expression:"NOT_EQUALS"
                    }
                    setFilterObject(tempObj)
                    setBottomSheetVisible(filterExpModalizeRef, false);
                }}
                >
                <Icon name={filterObject?.expression === "NOT_EQUALS" ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                <Text style={styles.radiobuttonText}>
                    Not Equals
                </Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    const tempObj:FilterObject = {
                        ...filterObject,
                        expression:"GREATER_THAN"
                    }
                    setFilterObject(tempObj)
                    setBottomSheetVisible(filterExpModalizeRef, false);
                }}
                >
                <Icon name={filterObject?.expression === "GREATER_THAN" ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                <Text style={styles.radiobuttonText}>
                    Greater Than
                </Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    const tempObj:FilterObject = {
                        ...filterObject,
                        expression:"GREATER_THAN_OR_EQUAL"
                    }
                    setFilterObject(tempObj)
                    setBottomSheetVisible(filterExpModalizeRef, false);
                }}
                >
                <Icon name={filterObject?.expression === "GREATER_THAN_OR_EQUAL" ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                <Text style={styles.radiobuttonText}>
                Greater Than or Equals
                </Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    const tempObj:FilterObject = {
                        ...filterObject,
                        expression:"LESS_THAN"
                    }
                    setFilterObject(tempObj)
                    setBottomSheetVisible(filterExpModalizeRef, false);
                }}
                >
                <Icon name={filterObject?.expression === "LESS_THAN" ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                <Text style={styles.radiobuttonText}>
                Less Than
                </Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    const tempObj:FilterObject = {
                        ...filterObject,
                        expression:"LESS_THAN_OR_EQUAL"
                    }
                    setFilterObject(tempObj)
                    setBottomSheetVisible(filterExpModalizeRef, false);
                }}
                >
                <Icon name={filterObject?.expression === "LESS_THAN_OR_EQUAL" ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                <Text style={styles.radiobuttonText}>
                Less Than or Equals
                </Text>
            </TouchableOpacity>
        </BottomSheet>
    )

    const SortByModal = (
        <BottomSheet
        bottomSheetRef={sortModalizeRef}
        headerText='Sort By'
        headerTextColor={voucherBackground}
        >
            <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    const tempObj:FilterObject = {
                        ...filterObject,
                        sortBy: "variant_name",
                        sort: ((filterObject?.sort.length == 0) ? ("asc") : ((filterObject?.sort?.length == 3) ? "desc" : "asc"))
                    }
                    setFilterObject(tempObj)
                    setBottomSheetVisible(sortByTypeModalizeRef,true);
                    // setBottomSheetVisible(sortModalizeRef, false);
                }}
                >
                <Icon name={filterObject?.sortBy === "variant_name" ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                
                <Text style={styles.radiobuttonText}>
                    Variant Name
                </Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    const tempObj:FilterObject = {
                        ...filterObject,
                        sortBy: "variant_unique_name",
                        sort: ((filterObject?.sort.length == 0) ? ("asc") : ((filterObject?.sort?.length == 3) ? "desc" : "asc"))
                    }
                    setFilterObject(tempObj)
                    setBottomSheetVisible(sortByTypeModalizeRef,true);
                    // setBottomSheetVisible(sortModalizeRef, false);
                }}
                >
                <Icon name={filterObject?.sortBy === "variant_unique_name" ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                
                <Text style={styles.radiobuttonText}>
                    Variant UN
                </Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    const tempObj:FilterObject = {
                        ...filterObject,
                        sortBy: "stock_name",
                        sort: ((filterObject?.sort.length == 0) ? ("asc") : ((filterObject?.sort?.length == 3) ? "desc" : "asc"))
                    }
                    setFilterObject(tempObj)
                    setBottomSheetVisible(sortByTypeModalizeRef,true);
                    // setBottomSheetVisible(sortModalizeRef, false);
                }}
                >
                <Icon name={filterObject?.sortBy === "stock_name" ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                
                <Text style={styles.radiobuttonText}>
                    Stock Name
                </Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    const tempObj:FilterObject = {
                        ...filterObject,
                        sortBy: "stock_unique_name",
                        sort: ((filterObject?.sort.length == 0) ? ("asc") : ((filterObject?.sort?.length == 3) ? "desc" : "asc"))
                    }
                    setFilterObject(tempObj)
                    setBottomSheetVisible(sortByTypeModalizeRef,true);
                    // setBottomSheetVisible(sortModalizeRef, false);
                }}
                >
                <Icon name={filterObject?.sortBy === "stock_unique_name" ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                
                <Text style={styles.radiobuttonText}>
                Stock UN
                </Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    const tempObj:FilterObject = {
                        ...filterObject,
                        sortBy: "stock_group_name",
                        sort: ((filterObject?.sort.length == 0) ? ("asc") : ((filterObject?.sort?.length == 3) ? "desc" : "asc"))
                    }
                    setFilterObject(tempObj)
                    setBottomSheetVisible(sortByTypeModalizeRef,true);
                    // setBottomSheetVisible(sortModalizeRef, false);
                }}
                >
                <Icon name={filterObject?.sortBy === "stock_group_name" ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                
                <Text style={styles.radiobuttonText}>
                Stock Group Name
                </Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    const tempObj:FilterObject = {
                        ...filterObject,
                        sortBy: "purchase_rate",
                        sort: ((filterObject?.sort.length == 0) ? ("asc") : ((filterObject?.sort?.length == 3) ? "desc" : "asc"))
                    }
                    setFilterObject(tempObj)
                    setBottomSheetVisible(sortByTypeModalizeRef,true);
                    // setBottomSheetVisible(sortModalizeRef, false);
                }}
                >
                <Icon name={filterObject?.sortBy === "purchase_rate" ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                
                <Text style={styles.radiobuttonText}>
                Purchase Rate
                </Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    const tempObj:FilterObject = {
                        ...filterObject,
                        sortBy: "sales_rate",
                        sort: ((filterObject?.sort.length == 0) ? ("asc") : ((filterObject?.sort?.length == 3) ? "desc" : "asc"))
                    }
                    setFilterObject(tempObj)
                    setBottomSheetVisible(sortByTypeModalizeRef,true);
                    // setBottomSheetVisible(sortModalizeRef, false);
                }}
                >
                <Icon name={filterObject?.sortBy === "sales_rate" ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                
                <Text style={styles.radiobuttonText}>
                Sales Rate
                </Text>
            </TouchableOpacity>
        </BottomSheet>
    )

    const SortByTypeModal = (
        <BottomSheet
        bottomSheetRef={sortByTypeModalizeRef}
        headerText='Sort'
        headerTextColor={voucherBackground}
        >
            <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    setDataArr([]);
                    setRefresh(true);
                    setHasMore(true);
                    setLoading(true);
                    setTimeout(()=>{setPage(1);fetchAllVariants(props?.route?.params?.params?.name === 'Product Inventory' ? 'PRODUCT' : 'SERVICE',true);},2000);
                    setBottomSheetVisible(sortByTypeModalizeRef, false);
                    setBottomSheetVisible(sortModalizeRef, false);
                }}
                >
                <Icon name={filterObject?.sort === "desc" ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                
                <Text style={styles.radiobuttonText}>
                    Ascending
                </Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    setDataArr([]);
                    setRefresh(true);
                    setHasMore(true);
                    setLoading(true);
                    setTimeout(()=>{setPage(1);fetchAllVariants(props?.route?.params?.params?.name === 'Product Inventory' ? 'PRODUCT' : 'SERVICE',true);},2000);
                    setBottomSheetVisible(sortByTypeModalizeRef, false);
                    setBottomSheetVisible(sortModalizeRef, false);
                }}
                >
                <Icon name={filterObject?.sort === "asc" ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                
                <Text style={styles.radiobuttonText}>
                    Descending
                </Text>
            </TouchableOpacity>
        </BottomSheet>
    )


    const SearchByModal = (
        <BottomSheet
        bottomSheetRef={searchModalizeRef}
        headerText='Search By'
        headerTextColor={voucherBackground}
        >
            <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    // setSubUnits(item);
                    setBottomSheetVisible(searchModalizeRef, false);
                    setBottomSheetVisible(searchSubModalizeRef, true);
                }}
                >
                {/* {subUnits?.uniqueName 
                ? <Icon name={subUnits?.uniqueName == item?.uniqueName ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                : <Icon name={unit?.uniqueName == item?.uniqueName ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />} */}
                <Icon name={false ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                
                <Text style={styles.radiobuttonText}>
                    Variant Name
                </Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    // setSubUnits(item);
                    setBottomSheetVisible(searchModalizeRef, false);
                    setBottomSheetVisible(searchSubModalizeRef, true);
                }}
                >
                {/* {subUnits?.uniqueName 
                ? <Icon name={subUnits?.uniqueName == item?.uniqueName ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                : <Icon name={unit?.uniqueName == item?.uniqueName ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />} */}
                <Icon name={false ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                
                <Text style={styles.radiobuttonText}>
                    Variant UN
                </Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    // setSubUnits(item);
                    setBottomSheetVisible(searchModalizeRef, false);
                    setBottomSheetVisible(searchSubModalizeRef, true);
                }}
                >
                {/* {subUnits?.uniqueName 
                ? <Icon name={subUnits?.uniqueName == item?.uniqueName ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                : <Icon name={unit?.uniqueName == item?.uniqueName ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />} */}
                <Icon name={false ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                
                <Text style={styles.radiobuttonText}>
                    Stock Name
                </Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    // setSubUnits(item);
                    setBottomSheetVisible(searchModalizeRef, false);
                    setBottomSheetVisible(searchSubModalizeRef, true);
                }}
                >
                {/* {subUnits?.uniqueName 
                ? <Icon name={subUnits?.uniqueName == item?.uniqueName ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                : <Icon name={unit?.uniqueName == item?.uniqueName ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />} */}
                <Icon name={false ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                
                <Text style={styles.radiobuttonText}>
                Stock UN
                </Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    // setSubUnits(item);
                    setBottomSheetVisible(searchModalizeRef, false);
                    setBottomSheetVisible(searchSubModalizeRef, true);
                }}
                >
                {/* {subUnits?.uniqueName 
                ? <Icon name={subUnits?.uniqueName == item?.uniqueName ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                : <Icon name={unit?.uniqueName == item?.uniqueName ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />} */}
                <Icon name={false ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                
                <Text style={styles.radiobuttonText}>
                Stock Group Name
                </Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    // setSubUnits(item);
                    setBottomSheetVisible(searchModalizeRef, false);
                    setBottomSheetVisible(searchSubModalizeRef, true);
                }}
                >
                {/* {subUnits?.uniqueName 
                ? <Icon name={subUnits?.uniqueName == item?.uniqueName ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                : <Icon name={unit?.uniqueName == item?.uniqueName ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />} */}
                <Icon name={false ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                
                <Text style={styles.radiobuttonText}>
                HSN
                </Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    // setSubUnits(item);
                    setBottomSheetVisible(searchModalizeRef, false);
                    setBottomSheetVisible(searchSubModalizeRef, true);
                }}
                >
                {/* {subUnits?.uniqueName 
                ? <Icon name={subUnits?.uniqueName == item?.uniqueName ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                : <Icon name={unit?.uniqueName == item?.uniqueName ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />} */}
                <Icon name={false ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                
                <Text style={styles.radiobuttonText}>
                SAC
                </Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    // setSubUnits(item);
                    setBottomSheetVisible(searchModalizeRef, false);
                    setBottomSheetVisible(searchSubModalizeRef, true);
                }}
                >
                {/* {subUnits?.uniqueName 
                ? <Icon name={subUnits?.uniqueName == item?.uniqueName ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                : <Icon name={unit?.uniqueName == item?.uniqueName ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />} */}
                <Icon name={false ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                
                <Text style={styles.radiobuttonText}>
                SKU Code
                </Text>
            </TouchableOpacity>
        </BottomSheet>
    )
    
    const SearchSubModal = (
        <BottomSheet
        bottomSheetRef={searchSubModalizeRef}
        headerText={'Searching by:'+'Voucher Name'}
        headerTextColor={voucherBackground}
        >
            <View style={{padding:10,marginBottom:10}}>
                <InputField 
                    lable='Search'
                />
            </View>
        </BottomSheet>
    )

    const HeaderRightComponent = (
    <><View style={{flexDirection:'row',justifyContent:'center'}}>
        <TouchableOpacity
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10 }}
            style={{ padding: 8 }}
            onPress={() => {
                // clearAll();
                setBottomSheetVisible(searchModalizeRef,true);
            }}
        >
            <AntDesign name={'search1'} size={20} color={'#FFFFFF'} />
            
        </TouchableOpacity>
        <TouchableOpacity
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10 }}
            style={{ padding: 8 }}
            onPress={() => {
                // clearAll();
                setBottomSheetVisible(sortModalizeRef,true);
            }}
        >
            <MaterialCommunityIcons name={'sort'} size={20} color={'#FFFFFF'} />
        </TouchableOpacity>
        <TouchableOpacity
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10 }}
            style={{ padding: 8 }}
            onPress={() => {
                // clearAll();
                setBottomSheetVisible(filterModalizeRef,true);
            }}
        >
            <AntDesign name={'filter'} size={20} color={'#FFFFFF'} />
        </TouchableOpacity>
    </View></>
    )

    const renderItem = ({item,index})=><Card item={item} index={index} onPress={onOpen}/>
    
    return (
        <KeyboardAvoidingView behavior={ Platform.OS == 'ios' ? "padding" : undefined } style={styles.container}>
            <_StatusBar statusBar={statusBar}/>
            <Header 
              header={'Inventory'} 
              isBackButtonVisible={true} 
              backgroundColor={voucherBackground} 
              headerRightContent={HeaderRightComponent}
            />
            <View style={{flex:1}}>  
                {dataArr.length > 0 ? <FlatList
                    data={dataArr}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={{padding:10}}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                />: <Loader isLoading={refresh}/>}
            </View>
            {DetailModal}
            {FilterModal}
            {FilterByModal}
            {FilterTypeModal}
            {FilterExpModal}
            {SortByModal}
            {SortByTypeModal}
            {SearchByModal}
            {SearchSubModal}
        </KeyboardAvoidingView>
    );
};

const style = (theme:ThemeProps)=> StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    // card: {
    //     marginBottom: 10,
    //     borderRadius: 8,
    //     elevation: 3,
    //     backgroundColor: '#fff',
    //     shadowColor: '#000',
    //     shadowOpacity: 0.1,
    //     shadowRadius: 10,
    //     shadowOffset: { width: 0, height: 5 },
    // },
    title: {
        fontFamily: theme.typography.fontFamily.semiBold,
        fontSize: theme.typography.fontSize.large.size,
        fontWeight: 'bold',
        color: '#333',
    },
    subtitle: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.regular.size,
        color: '#666',
    },
    modalContent: {
        padding: 20,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    smallText: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 16,
        color: '#FFFFFF'
    },
    footer: {
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        marginBottom: 10,
        paddingVertical: 10,
        paddingHorizontal:12,
        backgroundColor: '#ffffff',
        borderRadius: 10,
        borderColor: '#ddd',
        borderWidth: 1,
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 3 },
        // shadowOpacity: 0.3,
        // shadowRadius: 5,
        // elevation: 5,
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center'
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
    button: {
        flexDirection: "row", 
        justifyContent: "flex-start", 
        paddingHorizontal: 20,
        paddingVertical: 15
      },
      radiobuttonText:{
        color: '#1C1C1C', 
        fontFamily: FONT_FAMILY.regular,
        marginLeft: 10
      },
      doneBtn:{
        height: 35,
        width: 80,
        borderRadius: 16,
        backgroundColor: '#084EAD',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop:15
      },
      doneBtnText : {
        fontFamily: theme.typography.fontFamily.bold,
        color: '#fff',
        fontSize: 16,
      }
});

export default InventoryListScreen;
