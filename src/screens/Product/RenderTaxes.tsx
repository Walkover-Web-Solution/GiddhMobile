import { Dimensions, Text, TouchableOpacity, View } from 'react-native';
import useCustomTheme, { DefaultTheme } from '@/utils/theme';
import React from 'react';
import { useTranslation } from 'react-i18next';
import makeStyles from './style';
import BottomSheet from '@/components/BottomSheet';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MatButton from '@/components/OutlinedButton';

const RenderTaxes = ({selectedUniqueTax,setBottomSheetVisible,taxModalRef,taxArr,setSelectedUniqueTax})=>{
    const { t } = useTranslation();
    const {styles,theme} = useCustomTheme(makeStyles);
    const {height,width} = Dimensions.get('window');
    
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


    return (
    <>
      <View style={[styles.fieldContainer,{maxHeight:100}]}>
        <MatButton 
            lable={t('product.tax')}
            value={Object.keys(selectedUniqueTax).length > 0 && Object.keys(selectedUniqueTax).map((item)=> selectedUniqueTax?.[item]?.name)+"  " }
            onPress={()=>{
              setBottomSheetVisible(taxModalRef,true);
          }}
        />
      </View>
    {RenderTaxModal}
    </>
    )
}


export default React.memo(RenderTaxes);