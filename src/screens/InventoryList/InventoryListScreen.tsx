import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform, KeyboardAvoidingView, DeviceEventEmitter, RefreshControl, Keyboard, Dimensions } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { useIsFocused } from '@react-navigation/native';
import useCustomTheme, { ThemeProps } from '@/utils/theme';
import Header from '@/components/Header';
import { InventoryService } from '@/core/services/inventory/inventory.service';
import { APP_EVENTS, FONT_FAMILY } from '@/utils/constants';
import Loader from '@/components/Loader';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Icon from '@/core/components/custom-icon/custom-icon';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomSheet from '@/components/BottomSheet';
import InputField from '@/components/InputField';
import MatButton from '@/components/OutlinedButton';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';


interface FilterObject {
    expression: string,
    filterBy: string,
    rate: number,
    sortBy:string,
    sort:string,
    searchBy:string,
    search:string
}

const getColumnNames = (t: any) => ({
    variant_name : t('inventoryList.variantName'),
    variant_unique_name: t('inventoryList.variantUN'),
    stock_name: t('inventoryList.stockName'),
    stock_unique_name: t('inventoryList.stockUN'),
    stock_group_name: t('inventoryList.stockGroupName'),
    hsn: t('inventoryList.hsn'),
    sac: t('inventoryList.sac'),
    sku: t('inventoryList.skuCode')
})


const { height, width } = Dimensions.get('window');
const _Card = ({ item,index, onPress }) => {
    const { t } = useTranslation();
    const {statusBar,styles, theme} = useCustomTheme(style);
    
    return(
    <TouchableOpacity activeOpacity={0.6} onPress={()=>onPress(item)} style={styles.card}>
        <View style={{flex:1}}>
            <Text style={styles.title}>{item.variantName}</Text>
            <View style={styles.cardView}>
                <View style={{maxWidth:'70%'}}>
                    <Text style={[styles.subtitle,{fontFamily:theme.typography.fontFamily.semiBold}]}>{t('inventoryList.stock')}: <Text style={styles.subtitle}>{item.stockName}</Text></Text>
                </View>
                <View style={{maxWidth:'30%'}}>
                    <Text style={[styles.subtitle,{fontSize:theme.typography.fontSize.small.size}]}>{item.stockUnitName+'('+item.stockUnitCode+')'}</Text>
                </View>
            </View>
        </View>
    </TouchableOpacity>)}

const Card = React.memo(_Card)

const InventoryListScreen = (props) => {
    const { t } = useTranslation();
    const [dataArr,setDataArr] = useState<any[]>([]);
    const [selectedItem, setSelectedItem]:any = useState(null);
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
    const [isRefreshing, setIsRefreshing] = useState(false);
    
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
        }),
        setFilterFlag(false);
    }

    const throttleLoadMore = _.debounce(() => {
        if (hasMore) {
            setPage(prevPage => prevPage + 1);
        }else{
            setLoading(false);
        }
    },2000);

    const loadMore = () => {
        throttleLoadMore();
    };


    const renderFooter = () => {
        if (!loading) return null;
        return (
            <View style={styles.footer}>
                <ActivityIndicator />
            </View>
        );
    };

    const onRefresh = () => {
        setIsRefreshing(true)
        DeviceEventEmitter.emit(APP_EVENTS?.[props?.route?.params?.params?.name === 'Inventory' ? 'ProductInventoryListRefresh' : 'ServiceInventoryListRefresh'], {})
        _.delay(() => { setIsRefreshing(false) }, 500)
    }

    const fetchAllVariants = async (type:string,flag:boolean) => {
        
        if (!flag && !hasMore) return;
        setLoading(true);
        const body = {
            search: filterObject?.search,
            searchBy: filterObject?.searchBy,
            filterBy: filterObject?.filterBy ? filterObject?.filterBy : "",
            sortBy: filterObject?.sortBy,
            sort: filterObject?.sort,
            expression: filterObject?.expression ? filterObject?.expression : "GREATER_THAN" ,
            rate: filterObject?.rate > 0 ? filterObject?.rate : 0
        }
        
        const result = await InventoryService.fetchAllVariants(type, flag ? 1 : page, body);
        if(result?.data && result?.data?.status == 'success'){
            setLoading(false);
            const newData = result?.data?.body?.results;
            setDataArr(prevData => [...prevData, ...newData]);
            setHasMore(((flag ? 1: page) * result?.data?.body?.count) < result?.data?.body?.totalItems);
            if(!hasMore || result?.data?.body?.totalItems == 0){
                setRefresh(false);
            }
        } else{
            setLoading(false);
            setRefresh(false);
            console.error("error");
        }
    }
    

    useEffect(()=>{
        if(page == 1){
            //eat 5Start & do nothing
        }
        else if(hasMore)
        fetchAllVariants(props?.route?.params?.params?.name === 'Inventory' ? 'PRODUCT' : 'SERVICE',false);
        
    },[page])

    useEffect(()=>{
        fetchAllVariants(props?.route?.params?.params?.name === 'Inventory' ? 'PRODUCT' : 'SERVICE',false);
        DeviceEventEmitter.addListener(APP_EVENTS.ServiceInventoryListRefresh, async () => {
            await clearAll();
            fetchAllVariants("SERVICE",false);
        });
        DeviceEventEmitter.addListener(APP_EVENTS.ProductInventoryListRefresh, async () => {
            await clearAll();
            fetchAllVariants("PRODUCT",false);
        });
    },[])
    
    const VariantDetails = [
        { label: t('inventoryList.variantName'), value: selectedItem?.variantName },
        { label: t('inventoryList.variantUniqueName'), value: selectedItem?.variantUniqueName },
        { label: t('inventoryList.stockName'), value: selectedItem?.stockName },
        { label: t('inventoryList.stockUniqueName'), value: selectedItem?.stockUniqueName },
        { label: t('inventoryList.stockGroupName'), value: selectedItem?.stockGroupName },
        { label: t('inventoryList.stockGroupUniqueName'), value: selectedItem?.stockGroupUniqueName },
        { label: t('inventoryList.stockUnit'), value: `${selectedItem?.stockUnitName} (${selectedItem?.stockUnitCode})` },
        { label: t('inventoryList.hsn'), value: selectedItem?.hsnNo },
        { label: t('inventoryList.sac'), value: selectedItem?.sacNo },
        { label: t('inventoryList.skuCode'), value: selectedItem?.skuCode },
        { label: t('inventoryList.purchasesAccountName'), value: selectedItem?.purchaseAccountName },
        { label: t('inventoryList.purchaseAccountUN'), value: selectedItem?.purchaseAccountUniqueName },
        { label: t('inventoryList.purchaseRate'), value: selectedItem?.purchaseRate },
        { label: t('inventoryList.purchaseUnit'), value: selectedItem?.purchaseUnits?.[0]?.uniqueName },
        { label: t('inventoryList.salesAccountName'), value: selectedItem?.salesAccountName },
        { label: t('inventoryList.salesAccountUN'), value: selectedItem?.salesAccountUniqueName },
        { label: t('inventoryList.salesRate'), value: selectedItem?.salesRate },
        { label: t('inventoryList.salesUnit'), value: selectedItem?.salesUnits?.[0]?.uniqueName },
        { label: t('inventoryList.archive'), value: selectedItem?.archive ? t('common.yes') : t('common.no') },
        { label: t('inventoryList.tax'), value: selectedItem?.taxes?.join(', ') },
        { label: t('inventoryList.salesTaxInclusive'), value: selectedItem?.salesTaxInclusive ? t('common.yes') : t('common.no') },
        { label: t('inventoryList.purchaseTaxInclusive'), value: selectedItem?.purchaseTaxInclusive ? t('common.yes') : t('common.no') }
    ];
    
    const DetailModal = (
        <BottomSheet
        bottomSheetRef={modalizeRef}
        headerText={t('inventoryList.details')}
        headerTextColor={voucherBackground}
        adjustToContentHeight={false}
        modalTopOffset={height/4}
        >
        {selectedItem && (
        <View style={styles.modalContent}>
            {VariantDetails.map((item, index)=>(
                <View style={styles.innerCardRow} key={index}>
                    <Text style={styles.columnTitle} >{item?.label}</Text>
                    <Text style={styles.columnValue} >{item?.value ? item?.value : "-"}</Text>
                </View>
            ))}
        </View>
        )}
        </BottomSheet>
    )

    const FilterModal = (
        <BottomSheet
            bottomSheetRef={filterModalizeRef}
            headerText={t('inventoryList.advancedFilter')}
            headerTextColor={voucherBackground}
            >
            <View style={styles.modalContent}>
                <View style={styles.row}>
                    <View style={{width:'48%'}}>
                        <MatButton 
                            lable={t('inventoryList.filterBy')}
                            value={filterObject?.filterBy?.length > 0 && (filterObject?.filterBy === "sales_rate" ? t('inventoryList.salesRate') : t('inventoryList.purchaseRate')) }
                            onPress={()=>{
                                setBottomSheetVisible(filterByModalizeRef,true)
                            }}
                        />
                    </View>
                    <View style={{width:'48%'}}>
                        <MatButton 
                            lable={t('inventoryList.type')}
                            value={t('inventoryList.rate')}
                            onPress={()=>{
                                setBottomSheetVisible(filterTypeModalizeRef,true)
                            }}
                            />
                    </View>
                </View>
                <View style={styles.row}>
                    <View style={{width:'48%'}}>
                        <MatButton 
                            lable={t('inventoryList.expression')}
                            value={filterObject?.expression?.length > 0 && (filterObject?.expression) }
                            onPress={() => {
                                setBottomSheetVisible(filterExpModalizeRef,true)
                            }}
                        />
                    </View>
                    <View style={{width:'48%'}}>
                        <InputField 
                            lable={t('inventoryList.amount')}
                            keyboardType="numeric"
                            value={filterObject?.rate > 0 ? filterObject?.rate : ""}
                            isRequired={false}
                            containerStyle={{marginVertical:5}}
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
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.doneBtn}
                        onPress={() => {
                            if(filterObject?.expression?.length > 0 && filterObject?.filterBy?.length > 0 && filterObject?.rate > 0){
                                setFilterFlag(true);
                                setDataArr([]);
                                setRefresh(true);
                                setHasMore(true);
                                setLoading(true);
                                setTimeout(()=>{setPage(1);fetchAllVariants(props?.route?.params?.params?.name === 'Inventory' ? 'PRODUCT' : 'SERVICE',true);},2000);
                                setBottomSheetVisible(filterModalizeRef,false);
                            }
                        }}
                        >
                        <Text style={styles.doneBtnText}>{t('inventoryList.filter')}</Text>
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
                        <Text style={styles.doneBtnText}>{t('inventoryList.reset')}</Text>
                    </TouchableOpacity>
                    {filterFlag && <TouchableOpacity
                        activeOpacity={0.7}
                        hitSlop={{ top: 10, bottom: 10 }}
                        style={{marginHorizontal:20}}
                        onPress={() => {
                            setBottomSheetVisible(filterModalizeRef,false)
                            setFilterFlag(false);
                            DeviceEventEmitter.emit(APP_EVENTS?.[props?.route?.params?.params?.name === 'Inventory' ? 'ProductInventoryListRefresh' : 'ServiceInventoryListRefresh'], {})
                        }}
                    >
                        <Text style={[styles.smallText,{color:voucherBackground,fontSize:theme.typography.fontSize.large.size}]}>{t('inventoryList.clearFilter')}</Text>
                    </TouchableOpacity>}
                </View>
            </View>
        </BottomSheet>
    )

    const FilterByModal = (
        <BottomSheet
        bottomSheetRef={filterByModalizeRef}
        headerText={t('inventoryList.filterBy')}
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
                    {t('inventoryList.purchaseRate')}
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
                    {t('inventoryList.salesRate')}
                </Text>
            </TouchableOpacity>
        </BottomSheet>
    )

    const FilterTypeModal = (
        <BottomSheet
        bottomSheetRef={filterTypeModalizeRef}
        headerText={t('inventoryList.type')}
        headerTextColor={voucherBackground}
        >
            <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    setBottomSheetVisible(filterTypeModalizeRef, false);
                }}
                >
                <Icon name={true ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                
                <Text style={styles.radiobuttonText}>
                    {t('inventoryList.rate')}
                </Text>
            </TouchableOpacity>
        </BottomSheet>
    )

    const FilterExpModal = (
        <BottomSheet
        bottomSheetRef={filterExpModalizeRef}
        headerText={t('inventoryList.expression')}
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
                    {t('inventoryList.equals')}
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
                    {t('inventoryList.notEquals')}
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
                    {t('inventoryList.greaterThan')}
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
                    {t('inventoryList.greaterThanOrEquals')}
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
                    {t('inventoryList.lessThan')}
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
                    {t('inventoryList.lessThanOrEquals')}
                </Text>
            </TouchableOpacity>
        </BottomSheet>
    )

    const SortByModal = (
        <BottomSheet
        bottomSheetRef={sortModalizeRef}
        headerText={t('inventoryList.sortBy')}
        headerTextColor={voucherBackground}
        >
            <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    const tempObj:FilterObject = {
                        ...filterObject,
                        sortBy: "variant_name",
                        sort: (filterObject?.sort?.length == 3) ? "desc" : "asc"
                    }
                    setFilterObject(tempObj)
                    setBottomSheetVisible(sortByTypeModalizeRef,true);
                }}
                >
                <Icon name={filterObject?.sortBy === "variant_name" ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                
                <Text style={styles.radiobuttonText}>
                    {t('inventoryList.variantName')}
                </Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    const tempObj:FilterObject = {
                        ...filterObject,
                        sortBy: "variant_unique_name",
                        sort: (filterObject?.sort?.length == 3) ? "desc" : "asc"
                    }
                    setFilterObject(tempObj)
                    setBottomSheetVisible(sortByTypeModalizeRef,true);
                }}
                >
                <Icon name={filterObject?.sortBy === "variant_unique_name" ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                
                <Text style={styles.radiobuttonText}>
                    {t('inventoryList.variantUN')}
                </Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    const tempObj:FilterObject = {
                        ...filterObject,
                        sortBy: "stock_name",
                        sort: (filterObject?.sort?.length == 3) ? "desc" : "asc"
                    }
                    setFilterObject(tempObj)
                    setBottomSheetVisible(sortByTypeModalizeRef,true);
                }}
                >
                <Icon name={filterObject?.sortBy === "stock_name" ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                
                <Text style={styles.radiobuttonText}>
                    {t('inventoryList.stockName')}
                </Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    const tempObj:FilterObject = {
                        ...filterObject,
                        sortBy: "stock_unique_name",
                        sort: (filterObject?.sort?.length == 3) ? "desc" : "asc"
                    }
                    setFilterObject(tempObj)
                    setBottomSheetVisible(sortByTypeModalizeRef,true);
                }}
                >
                <Icon name={filterObject?.sortBy === "stock_unique_name" ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                
                <Text style={styles.radiobuttonText}>
                    {t('inventoryList.stockUN')}
                </Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    const tempObj:FilterObject = {
                        ...filterObject,
                        sortBy: "stock_group_name",
                        sort: (filterObject?.sort?.length == 3) ? "desc" : "asc"
                    }
                    setFilterObject(tempObj)
                    setBottomSheetVisible(sortByTypeModalizeRef,true);
                }}
                >
                <Icon name={filterObject?.sortBy === "stock_group_name" ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                
                <Text style={styles.radiobuttonText}>
                    {t('inventoryList.stockGroupName')}
                </Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    const tempObj:FilterObject = {
                        ...filterObject,
                        sortBy: "purchase_rate",
                        sort: (filterObject?.sort?.length == 3) ? "desc" : "asc"
                    }
                    setFilterObject(tempObj)
                    setBottomSheetVisible(sortByTypeModalizeRef,true);
                }}
                >
                <Icon name={filterObject?.sortBy === "purchase_rate" ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                
                <Text style={styles.radiobuttonText}>
                    {t('inventoryList.purchaseRate')}
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
                }}
                >
                <Icon name={filterObject?.sortBy === "sales_rate" ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                
                <Text style={styles.radiobuttonText}>
                    {t('inventoryList.salesRate')}
                </Text>
            </TouchableOpacity>
        </BottomSheet>
    )

    const SortByTypeModal = (
        <BottomSheet
        bottomSheetRef={sortByTypeModalizeRef}
        headerText={t('inventoryList.sort')}
        headerTextColor={voucherBackground}
        >
            <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    const tempObj:FilterObject = {
                        ...filterObject,
                        sort: "asc"
                    }
                    setFilterObject(tempObj)
                    setDataArr([]);
                    setRefresh(true);
                    setHasMore(true);
                    setLoading(true);
                    setTimeout(()=>{setPage(1);fetchAllVariants(props?.route?.params?.params?.name === 'Inventory' ? 'PRODUCT' : 'SERVICE',true);},2000);
                    setBottomSheetVisible(sortByTypeModalizeRef, false);
                    setBottomSheetVisible(sortModalizeRef, false);
                }}
                >
                <Icon name={filterObject?.sort === "desc" ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                
                <Text style={styles.radiobuttonText}>
                    {t('inventoryList.ascending')}
                </Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    const tempObj:FilterObject = {
                        ...filterObject,
                        sort: "desc"
                    }
                    setFilterObject(tempObj)
                    setDataArr([]);
                    setRefresh(true);
                    setHasMore(true);
                    setLoading(true);
                    setTimeout(()=>{setPage(1);fetchAllVariants(props?.route?.params?.params?.name === 'Inventory' ? 'PRODUCT' : 'SERVICE',true);},2000);
                    setBottomSheetVisible(sortByTypeModalizeRef, false);
                    setBottomSheetVisible(sortModalizeRef, false);
                }}
                >
                <Icon name={filterObject?.sort === "asc" ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                
                <Text style={styles.radiobuttonText}>
                    {t('inventoryList.descending')}
                </Text>
            </TouchableOpacity>
        </BottomSheet>
    )

    const SearchByModal = (
        <BottomSheet
        bottomSheetRef={searchModalizeRef}
        headerText={t('inventoryList.searchBy')}
        headerTextColor={voucherBackground}
        >
            <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    const tempObj:FilterObject = {
                        ...filterObject,
                        searchBy: "variant_name",
                    }
                    setFilterObject(tempObj);
                    setBottomSheetVisible(searchModalizeRef, false);
                    setBottomSheetVisible(searchSubModalizeRef, true);
                }}
                >
                <Icon name={filterObject?.searchBy === 'variant_name' ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                <Text style={styles.radiobuttonText}>
                    {t('inventoryList.variantName')}
                </Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    const tempObj:FilterObject = {
                        ...filterObject,
                        searchBy: "variant_unique_name",
                    }
                    setFilterObject(tempObj);
                    setBottomSheetVisible(searchModalizeRef, false);
                    setBottomSheetVisible(searchSubModalizeRef, true);
                }}
                >
                <Icon name={filterObject?.searchBy === 'variant_unique_name' ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                <Text style={styles.radiobuttonText}>
                    {t('inventoryList.variantUN')}
                </Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    const tempObj:FilterObject = {
                        ...filterObject,
                        searchBy: "stock_name",
                    }
                    setFilterObject(tempObj);
                    setBottomSheetVisible(searchModalizeRef, false);
                    setBottomSheetVisible(searchSubModalizeRef, true);
                }}
                >
                <Icon name={filterObject?.searchBy === 'stock_name' ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                <Text style={styles.radiobuttonText}>
                    {t('inventoryList.stockName')}
                </Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    const tempObj:FilterObject = {
                        ...filterObject,
                        searchBy: "stock_unique_name",
                    }
                    setFilterObject(tempObj);
                    setBottomSheetVisible(searchModalizeRef, false);
                    setBottomSheetVisible(searchSubModalizeRef, true);
                }}
                >
                <Icon name={filterObject?.searchBy === 'stock_unique_name' ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                <Text style={styles.radiobuttonText}>
                    {t('inventoryList.stockUN')}
                </Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    const tempObj:FilterObject = {
                        ...filterObject,
                        searchBy: "stock_group_name",
                    }
                    setFilterObject(tempObj);
                    setBottomSheetVisible(searchModalizeRef, false);
                    setBottomSheetVisible(searchSubModalizeRef, true);
                }}
                >
                <Icon name={filterObject?.searchBy === 'stock_group_name' ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                <Text style={styles.radiobuttonText}>
                    {t('inventoryList.stockGroupName')}
                </Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    const tempObj:FilterObject = {
                        ...filterObject,
                        searchBy: "hsn",
                    }
                    setFilterObject(tempObj);
                    setBottomSheetVisible(searchModalizeRef, false);
                    setBottomSheetVisible(searchSubModalizeRef, true);
                }}
                >
                <Icon name={filterObject?.searchBy === 'hsn' ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                <Text style={styles.radiobuttonText}>
                    {t('inventoryList.hsn')}
                </Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    const tempObj:FilterObject = {
                        ...filterObject,
                        searchBy: "sac",
                    }
                    setFilterObject(tempObj);
                    setBottomSheetVisible(searchModalizeRef, false);
                    setBottomSheetVisible(searchSubModalizeRef, true);
                }}
                >
                <Icon name={filterObject?.searchBy === 'sac' ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                <Text style={styles.radiobuttonText}>
                    {t('inventoryList.sac')}
                </Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    const tempObj:FilterObject = {
                        ...filterObject,
                        searchBy: "sku",
                    }
                    setFilterObject(tempObj);
                    setBottomSheetVisible(searchModalizeRef, false);
                    setBottomSheetVisible(searchSubModalizeRef, true);
                }}
                >
                <Icon name={filterObject?.searchBy === 'sku' ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                <Text style={styles.radiobuttonText}>
                    {t('inventoryList.skuCode')}
                </Text>
            </TouchableOpacity>
        </BottomSheet>
    )
    
    const SearchSubModal = (
        <BottomSheet
        bottomSheetRef={searchSubModalizeRef}
        headerText={t('common.search')}
        headerTextColor={voucherBackground}
        >
            <View style={styles.searchContainer}>
                <InputField 
                    lable= {getColumnNames(t)[filterObject?.searchBy]}
                    isRequired={false}
                    containerStyle={{marginVertical:5}}
                    onChangeText={(text)=>{
                        const tempObj = {
                            ...filterObject,
                            search:text
                        }
                        setFilterObject(tempObj);
                    }}
                />
                <TouchableOpacity
                    style={styles.doneBtn}
                    onPress={() => {
                        if(filterObject?.search?.length > 0){
                            setDataArr([]);
                            setRefresh(true);
                            setHasMore(true);
                            setLoading(true);
                            setTimeout(()=>{setPage(1);fetchAllVariants(props?.route?.params?.params?.name === 'Inventory' ? 'PRODUCT' : 'SERVICE',true);},2000);
                            setBottomSheetVisible(searchSubModalizeRef,false);
                        }
                    }}
                    >
                    <Text style={styles.doneBtnText}>{t('common.search')}</Text>
                </TouchableOpacity>
            </View>
        </BottomSheet>
    )

    const HeaderRightComponent = (
    <><View style={styles.headerRightContainer}>
        <TouchableOpacity
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10 }}
            style={{ padding: 8 }}
            onPress={() => {
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
                setBottomSheetVisible(filterModalizeRef,true);
            }}
        >
            <AntDesign name={'filter'} size={20} color={'#FFFFFF'} />
            {filterFlag && <View style={styles.filterIcon}>
            </View>}
        </TouchableOpacity>
    </View></>
    )

    const renderItem = ({item,index})=><Card item={item} index={index} onPress={onOpen}/>
    
    return (
        <View style={styles.container}>
            <Header 
              header={t('AddButton.Inventory')} 
              isBackButtonVisible={true} 
              backgroundColor={voucherBackground} 
              headerRightContent={HeaderRightComponent}
            />
            <View style={{flex:1}}>   
                {dataArr.length == 0 && !(refresh) && <View style={{alignItems:'center',paddingVertical:20}}>
                    <Text style={styles.title}>{t('inventoryList.noDataFound')}</Text>
                    <TouchableOpacity
                        style={[{marginTop:20}]}
                        onPress={() => {
                            DeviceEventEmitter.emit(APP_EVENTS?.[props?.route?.params?.params?.name === 'Inventory' ? 'ProductInventoryListRefresh' : 'ServiceInventoryListRefresh'], {})
                        }}
                        >
                        <Text style={{color:voucherBackground,fontFamily:theme.typography.fontFamily.regular,fontSize:theme.typography.fontSize.large.size}}>{t('inventoryList.clickToReset')}</Text>
                    </TouchableOpacity>
                </View>}            
                {dataArr.length > 0 ? <View>
                    <View style={styles.columnHeader}>
                        <Text style={styles.columnHeading}>{t('inventoryList.variantName')}</Text>
                        <Text style={styles.columnHeading}>{t('inventoryList.unit')}</Text>
                    </View>
                    {filterObject?.search !== "" && 
                    <View style={styles.clearFilter}>
                        <TouchableOpacity
                            style={[styles.buttonContainer, styles.clearButton, {borderColor:voucherBackground}]}
                            onPress={() => {DeviceEventEmitter.emit(APP_EVENTS?.[props?.route?.params?.params?.name === 'Inventory' ? 'ProductInventoryListRefresh' : 'ServiceInventoryListRefresh'], {})}}
                            >
                            <Text style={[styles.clearText, {color:voucherBackground}]}>{t('inventoryList.clearFilter')}</Text>
                            <AntDesign name="closecircleo" size={13} color={voucherBackground} />
                        </TouchableOpacity>
                    </View>
                    }
                    <FlatList
                    data={dataArr}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={{paddingHorizontal:10,paddingBottom:45}}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                    refreshControl={ 
                        <RefreshControl 
                            refreshing={isRefreshing} 
                            progressViewOffset={15}
                            onRefresh={onRefresh} 
                        />
                    }
                    />
                </View>: <Loader isLoading={refresh}/>}
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
        </View>
    );
};

const style = (theme:ThemeProps)=> StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    value: {
        fontWeight: 'normal',
        color: '#555',
    },
    title: {
        fontFamily:theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize.large.size,
        color: theme.colors.text,
        marginBottom: 5,
    },
    subtitle: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.regular.size,
        color: theme.colors.secondary,
    },
    modalContent: {
        paddingHorizontal: 20,
        paddingVertical:10,
        backgroundColor: '#fff',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    smallText: {
        fontFamily: theme.typography.fontFamily.semiBold,
        fontSize: theme.typography.fontSize.regular.size,
        color: theme.colors.text
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
        marginVertical:7
      },
      doneBtnText : {
        fontFamily: theme.typography.fontFamily.bold,
        color: '#fff',
        fontSize: theme.typography.fontSize.large.size,
      },
      innerCardRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        maxWidth: width,
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    innerCardText: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.fontSize.regular.size,
        color: theme.colors.text,
        alignItems: 'center',
        paddingVertical: 2,
        maxWidth: '70%',
    },
    columnTitle:{
        fontFamily:theme.typography.fontFamily.semiBold,
        // fontWeight:'700',
        fontSize:theme.typography.fontSize.regular.size,
        color:theme.colors.text,
        paddingVertical:5,
        maxWidth:'60%'
    },
    columnValue:{
        fontFamily:theme.typography.fontFamily.semiBold,
        fontSize:theme.typography.fontSize.regular.size,
        color:theme.colors.secondary,
        paddingVertical:3,
        maxWidth:'40%'
    },
    columnHeader:{
        flexDirection:'row',
        paddingHorizontal:20,
        paddingVertical:10,
        justifyContent:'space-between'
    },
    cardView :{
        flexDirection:'row',
        justifyContent:'space-between',
        paddingTop:5
    },
    buttonContainer:{
        flexDirection:'row',
        alignItems:'center'
    },
    searchContainer : {
        padding:10,
        marginHorizontal:10
    },
    headerRightContainer:{
        flexDirection:'row',
        justifyContent:'center'
    },
    filterIcon:{
        position:'absolute',
        width:7,
        height:7,
        borderRadius:5,
        backgroundColor:theme.colors.solids.red.dark,
        top:12,
        right:8
    },
    columnHeading:{
        fontFamily:theme.typography.fontFamily.bold,
        color:theme.colors.secondary
    },
    clearFilter: {alignItems:'flex-end',paddingHorizontal:7, paddingBottom:7 },
    clearButton: {borderWidth:1, borderRadius:25, padding:5},
    clearText: {fontFamily:theme.typography.fontFamily.regular,fontSize:theme.typography.fontSize.regular.size, marginRight:5}
});

export default InventoryListScreen;
