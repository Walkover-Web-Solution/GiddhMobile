import Header from "@/components/Header"
import useCustomTheme, { DefaultTheme, ThemeProps } from "@/utils/theme"
import { useIsFocused, useNavigation } from "@react-navigation/native"
import { Animated, DeviceEventEmitter, Keyboard, Platform, Pressable, StatusBar, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from "react-native"
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
import makeStyle from "../ProductGroup/style"
import Loader from "@/components/Loader"


const ProductGroupScreen = ()=>{
    const navigation = useNavigation();
    const _StatusBar = ({ statusBar }: { statusBar: string }) => {
        const isFocused = useIsFocused();
        return isFocused ? <StatusBar backgroundColor={statusBar} barStyle={Platform.OS === 'ios' ? "dark-content" : "light-content"} /> : null
    }
    const [isLoading,setIsLoading] = useState(false);
    const taxModalRef = useRef(null);
    const childGroupModalRef = useRef(null);
    const [taxArr,setTaxArr] = useState([]);
    const [parentGroupArr,setParentGroupArr] = useState([]);
    const [selectedUniqueTax, setSelectedUniqueTax]:any = useState({});
    const {statusBar,styles, theme, voucherBackground} = useCustomTheme(makeStyle, 'Group');
    const {height, width} = Dimensions.get('window');
    const [isChecked,setIsChecked] = useState(false);
    const [selectedGroup,setSelectedGroup] = useState('');
    const [selectedGroupUniqueName,setSelectedGroupUniqueName] = useState('');
    const [isGroupUniqueNameEdited,setIsGroupUniqueNameEdited] = useState(false);
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

    const createStockGroup = async () => {
      setIsLoading(true);
      let taxesArr:string[] = [];
      Object.keys(selectedUniqueTax).map((item)=>{
        taxesArr.push(selectedUniqueTax?.[item]?.uniqueName);
      })
      const payload = {
        hsnNumber : selectedCode === 'hsn' ? codeNumber : null,
        isSubGroup : isChecked,
        name : groupName, 
        parentStockGroupUniqueName : selectedGroupUniqueName,
        sacNumber : selectedCode === 'sac' ? codeNumber : null,
        showCodeType : selectedCode,
        taxes : taxesArr,
        type : "PRODUCT",
        uniqueName : groupUniqueName
      }
      const result = await InventoryService.createStockGroup(payload);
      if(result?.data && result?.data?.status == 'success'){
        setIsLoading(false);
        ToastAndroid.show("Stock Group Created Successfully!", ToastAndroid.LONG)
        navigation.goBack();
        await clearAll();
      }else{
        setIsLoading(false);
        ToastAndroid.show(result?.data?.message, ToastAndroid.LONG)
      }
      
    }
    const resetState = ()=>{
      setTaxArr([])
      setParentGroupArr([])
      setSelectedUniqueTax({})
      setIsChecked(false)
      setSelectedGroup('')
      setSelectedGroupUniqueName('')
      setSelectedCode('hsn')
      setGroupName('')
      setGroupUniqueName('')
      setCodeNumber('')
      setIsGroupUniqueNameEdited(false)
    }
    const clearAll = () => {
      resetState();
      fetchAllTaxes();
      fetchAllParentGroup();
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
            headerTextColor='#084EAD'
            flatListProps={{
              data: taxArr,
              renderItem: ({item}) => {
                return (
                  <TouchableOpacity
                    style={styles.renderConatiner}
                    onPress={()=>{
                        let updatedSelectedUniqueTax = {...selectedUniqueTax};  
                        if(Object.keys(updatedSelectedUniqueTax).length == 0 ){
                            const Obj = {
                                [item?.taxType] : item
                            }
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
                    <View style={styles.modalRenderItem}>
                      <View
                        style={[styles.modalCheckBox,{ borderColor: selectedUniqueTax?.[item?.taxType] ? '#CCCCCC' : '#1C1C1C'}]}>
                        {selectedUniqueTax?.[item?.taxType]?.uniqueName === item?.uniqueName && (
                          <AntDesign name={'check'} size={10} color={'#1C1C1C'} />
                        )}
                      </View>
                      <Text
                        style={styles.modalText}>
                        {item.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              },
              ListEmptyComponent: () => {
                return (
                  <View style={styles.modalCancelView}>
                    <Text
                      style={styles.modalCancelText}>
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
          headerTextColor='#084EAD'
          flatListProps={{
            data: parentGroupArr,
            renderItem: ({item}) => {
              return (
                <TouchableOpacity 
                  style={styles.button}
                  onPress={() => {
                    setSelectedGroup(item?.name)
                    setSelectedGroupUniqueName(item?.uniqueName)
                    setBottomSheetVisible(childGroupModalRef, false);
                  }}
                >
                  <Icon name={selectedGroup == item?.name ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                  <Text style={styles.radiobuttonText}
                  >
                    {item?.name}
                  </Text>
                </TouchableOpacity>
              );
            },
            ListEmptyComponent: () => {
              return (
                <View style={styles.modalCancelView}>
                  <Text
                    style={styles.modalCancelText}>
                    No Group Available
                  </Text>
                </View>
  
              );
            }
          }}
        />
  );

    return (
        <SafeAreaView style={styles.containerView}>
            <View>
                <Animated.ScrollView
                    keyboardShouldPersistTaps="never"
                    style={styles.animatedView}
                    bounces={false}>
                    <_StatusBar statusBar={statusBar}/>
                    <Header header={'Create Stock'} isBackButtonVisible={true} backgroundColor={voucherBackground} />
                    <RenderGroupName isGroupUniqueNameEdited={isGroupUniqueNameEdited} setIsGroupUniqueNameEdited={setIsGroupUniqueNameEdited} groupName={groupName} groupUniqueName={groupUniqueName} setGroupName={setGroupName} setGroupUniqueName={setGroupUniqueName} clearAll={clearAll}/>
                    <RenderRadioBtn codeNumber = {codeNumber} selectedCode={selectedCode} setSelectedCode={setSelectedCode} setCodeNumber={setCodeNumber}/>
                    <RenderTaxes selectedUniqueTax={selectedUniqueTax} taxModalRef={taxModalRef} setBottomSheetVisible={setBottomSheetVisible}/>
                    <RenderChildGroup groupName={selectedGroup} childGroupModalRef={childGroupModalRef} setBottomSheetVisible={setBottomSheetVisible} isChecked={isChecked} setIsChecked={setIsChecked} />
                </Animated.ScrollView>
            </View>
            <TouchableOpacity
                style={[styles.createButton,{backgroundColor: isLoading ? '#E6E6E6' :'#5773FF'}]}
                disabled = {isLoading}
                onPress={ () => {
                  if(groupName && groupUniqueName)createStockGroup();
                  else{
                    ToastAndroid.show('Group Unique name can not be empty!',ToastAndroid.LONG)
                  }
                }}>
                <Text
                style={styles.createButtonText}>
                Create
                </Text>
            </TouchableOpacity>
            {RenderTaxModal}
            {RenderChildGroupModal}
            <Loader isLoading={isLoading}/>
        </SafeAreaView>

    )
}

export default ProductGroupScreen;