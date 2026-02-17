import Header from "@/components/Header"
import useCustomTheme, { DefaultTheme, ThemeProps } from "@/utils/theme"
import { useIsFocused, useNavigation } from "@react-navigation/native"
import { Animated, DeviceEventEmitter, Keyboard, KeyboardAvoidingView, Platform, StatusBar, Text, TouchableOpacity, View } from "react-native"
import { useTranslation } from "react-i18next"
import Icon from '@/core/components/custom-icon/custom-icon';
import { Dimensions } from "react-native"
import { useEffect, useRef, useState } from "react"
import { InventoryService } from "@/core/services/inventory/inventory.service"
import { APP_EVENTS } from "@/utils/constants"
import BottomSheet from "@/components/BottomSheet"
import AntDesign from 'react-native-vector-icons/AntDesign';
import RenderGroupName from "./RenderGroupName"
import RenderRadioBtn from "./RenderRadioBtn"
import RenderTaxes from "./RenderTaxes"
import RenderChildGroup from "./RenderChildGroup"
import makeStyle from "../ProductGroup/style"
import Loader from "@/components/Loader"
import Dialog from 'react-native-dialog';
import Award from '../../assets/images/icons/customer_success.svg';
import Faliure from '../../assets/images/icons/customer_faliure.svg';
import Toast from "@/components/Toast"


const ProductGroupScreen = (props)=>{
    const { t } = useTranslation();
    const [name,setName] = useState(props?.route?.params?.params?.name);
    const navigation = useNavigation();
    const [isLoading,setIsLoading] = useState(false);
    const [successDialog,setSuccessDialog]=useState(false);
    const [failureDialog,setFailureDialog]=useState(false);
    const [failureMessage,setFailureMessage] = useState("");
    const taxModalRef = useRef(null);
    const childGroupModalRef = useRef(null);
    const [taxArr,setTaxArr] = useState([]);
    const [parentGroupArr,setParentGroupArr]:any[] = useState([]);
    const [selectedUniqueTax, setSelectedUniqueTax]:any = useState({});
    const {statusBar,styles, theme, voucherBackground} = useCustomTheme(makeStyle, props?.route?.params?.params?.name === 'Product Group' ? 'Group' : 'Stock');
    const {height, width} = Dimensions.get('window');
    const [isChecked,setIsChecked] = useState(false);
    const [selectedGroup,setSelectedGroup] = useState('');
    const [selectedGroupUniqueName,setSelectedGroupUniqueName] = useState('');
    const [isGroupUniqueNameEdited,setIsGroupUniqueNameEdited] = useState(false);
    const [selectedCode,setSelectedCode] = useState('hsn');
    const [groupName,setGroupName] = useState('');
    const [groupUniqueName,setGroupUniqueName] = useState('');
    const [codeNumber,setCodeNumber] = useState('');

    useEffect(()=>{
      resetState();
    },[props?.route?.params?.params?.name])

    const setBottomSheetVisible = (modalRef: React.Ref<BottomSheet>, visible: boolean) => {
        if(visible){
          Keyboard.dismiss();
          modalRef?.current?.open();
        } else {
          modalRef?.current?.close();
        }
      };

    const flattenStockGroups = (stockGroups:any[]):any[] => {
      const result:any = [];
      const flatten = (groups) => {
        groups.forEach(group => {
          result.push(group);
          if (group.childStockGroups && group.childStockGroups.length > 0) {
            flatten(group.childStockGroups);
          }
        });
      };
    
      flatten(stockGroups);
      return result;
    };
      
    const fetchAllTaxes = async () => {
        const result = await InventoryService.fetchAllTaxes();
        if(result?.data && result?.data?.status == 'success'){
            setTaxArr(result?.data?.body);
        }
    }
    
    const fetchAllParentGroup = async (type:string) => {
        const result = await InventoryService.fetchAllParentGroup(type);
        if(result?.data && result?.data?.status == 'success'){
          const flattenParentGroupArr = flattenStockGroups(result?.data?.body?.results)
          setParentGroupArr(flattenParentGroupArr);
          
        }
    }

    const createStockGroup = async () => {
      setIsLoading(true);
      let taxesArr:string[] = [];
      Object.keys(selectedUniqueTax).map((item)=>{
        taxesArr.push(selectedUniqueTax?.[item]?.uniqueName);
      })
      const type = props?.route?.params?.params?.name === 'Product Group' ? 'PRODUCT' : 'SERVICE'
      const payload = {
        hsnNumber : selectedCode === 'hsn' ? codeNumber : null,
        isSubGroup : isChecked,
        name : groupName, 
        parentStockGroupUniqueName : isChecked ? selectedGroupUniqueName: "",
        sacNumber : selectedCode === 'sac' ? codeNumber : null,
        showCodeType : selectedCode,
        taxes : taxesArr,
        type : type,
        uniqueName : groupUniqueName
      }
      if(!payload?.isSubGroup){
        delete payload?.parentStockGroupUniqueName
      }
      const result = await InventoryService.createStockGroup(payload);
      if(result?.data && result?.data?.status == 'success'){
        setIsLoading(false);
        setSuccessDialog(true);
        await clearAll();
      }else{
        setIsLoading(false);
        setFailureDialog(true);
        setFailureMessage(result?.data?.message);
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
      fetchAllParentGroup(props?.route?.params?.params?.name === "Service Group" ? "SERVICE" : "PRODUCT");
    };
        
    useEffect(() => {
        fetchAllTaxes();
        console.log("on mount",props?.route?.params?.params?.name);
        fetchAllParentGroup(name === "Service Group" ? "SERVICE" : "PRODUCT");
        DeviceEventEmitter.addListener(APP_EVENTS.ProductGroupRefresh, async () => {
            fetchAllParentGroup("PRODUCT");
            fetchAllTaxes();
        });
        DeviceEventEmitter.addListener(APP_EVENTS.ServiceGroupRefresh, async () => {
            fetchAllParentGroup("SERVICE");
            fetchAllTaxes();
        });
    }, []);

    const CreateButton = (
      <TouchableOpacity
          style={[styles.createButton,{backgroundColor: isLoading ? '#E6E6E6' :'#5773FF'}]}
          disabled = {isLoading}
          onPress={() => {
            if(groupName && groupUniqueName)createStockGroup();
            else{
              Toast({message: t('productGroup.groupUniqueNameEmpty'), position:'BOTTOM',duration:'LONG'})
            }
          }}>
          <Text
          style={styles.createBtn}>
          {t('common.create')}
          </Text>
      </TouchableOpacity>
    //   <TouchableOpacity
      // onPress={() => {
      //   if(groupName && groupUniqueName)createStockGroup();
      //   else{
      //     Toast({message: "Group Unique name can not be empty!", position:'BOTTOM',duration:'LONG'})
      //   }
      // }}
    //   disabled = {isLoading}
    //   style={[styles.updatedCreateBtn,{borderColor: voucherBackground}]}>
    //   <Text style={[{color:voucherBackground},styles.updatedCreateBtnText]}> Create</Text>
    // </TouchableOpacity>
    )


    const RenderTaxModal = (
          <BottomSheet
            bottomSheetRef={taxModalRef}
            headerText={t('product.selectTaxes')}
            headerTextColor='#084EAD'
            adjustToContentHeight={((taxArr.length*47) > (height-100)) ? false : true}
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
                      {t('product.noTaxesAvailable')}
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
          headerText={t('productGroup.selectParentGroup')}
          headerTextColor='#084EAD'
          adjustToContentHeight={((parentGroupArr.length*47) > (height-100)) ? false : true}
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
                    {t('product.noGroupAvailable')}
                  </Text>
                </View>
  
              );
            }
          }}
        />
  );

  const successBox = (
    successDialog
      ? <Dialog.Container
        onRequestClose={() => setSuccessDialog(false)}
        visible={successDialog} onBackdropPress={() => setSuccessDialog(false)} contentStyle={styles.dialogContainer}>
        <Award />
        <Text style={[{ color: '#229F5F'},styles.dialogTypeText]}>{t('common.success')}</Text>
        <Text style={styles.dialogMessage}>{t('productScreen.stockGroupCreatedSuccessfully')}</Text>
        <TouchableOpacity
          style={[styles.dialogBtn,{backgroundColor: '#229F5F'}]}
          onPress={() => {
            setSuccessDialog(false);
            navigation.goBack();
          }}
        >
          <Text style={styles.dialogBtnText}>{t('common.done')}</Text>
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
          <Text style={[{ color: '#F2596F'},styles.dialogTypeText]}>{t('common.error')}</Text>
          <Text style={styles.dialogMessage}>{failureMessage}</Text>
          <TouchableOpacity
            style={[styles.dialogBtn,{backgroundColor: '#F2596F'}]}
            onPress={() => {
              setFailureDialog(false);
            }}
          >
            <Text style={styles.dialogBtnText}>{t('common.tryAgain')}</Text>
          </TouchableOpacity>
        </Dialog.Container>
      : null
    );

    return (
      <KeyboardAvoidingView behavior={ Platform.OS == 'ios' ? "padding" : "height" } style={styles.containerView}>
        <View>
          <Animated.ScrollView
            keyboardShouldPersistTaps="never"
            style={styles.animatedView}
            bounces={false}>
            <Header 
              header={t('productGroup.createGroup')} 
              isBackButtonVisible={true} 
              backgroundColor={voucherBackground} 
              headerRightContent={<>
                <TouchableOpacity
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10 }}
                    style={{ padding: 8 }}
                    onPress={() => {
                        clearAll();
                    }}
                >
                    <Text style={styles.smallText}>{t('common.clear')}</Text>
                </TouchableOpacity>
                </>}
              />
            <RenderGroupName 
              isGroupUniqueNameEdited={isGroupUniqueNameEdited} 
              setIsGroupUniqueNameEdited={setIsGroupUniqueNameEdited} 
              groupName={groupName} 
              groupUniqueName={groupUniqueName} 
              setGroupName={setGroupName} 
              setGroupUniqueName={setGroupUniqueName} 
              clearAll={clearAll}
              />
            <RenderRadioBtn 
              codeNumber = {codeNumber} 
              selectedCode={selectedCode} 
              setSelectedCode={setSelectedCode}
              setCodeNumber={setCodeNumber}
              />
            <RenderTaxes 
              selectedUniqueTax={selectedUniqueTax} 
              taxModalRef={taxModalRef} 
              setBottomSheetVisible={setBottomSheetVisible}
              />
            <RenderChildGroup 
              groupName={selectedGroup} 
              childGroupModalRef={childGroupModalRef} 
              setBottomSheetVisible={setBottomSheetVisible} 
              isChecked={isChecked} 
              setIsChecked={setIsChecked} 
              />
          </Animated.ScrollView>
        </View>
        {CreateButton}
        {RenderTaxModal}
        {RenderChildGroupModal}
        {successBox}
        {failureBox}
        <Loader isLoading={isLoading}/>
      </KeyboardAvoidingView>        
    )
}

export default ProductGroupScreen;