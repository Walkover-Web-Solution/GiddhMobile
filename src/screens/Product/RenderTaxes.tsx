import Icon from '@/core/components/custom-icon/custom-icon';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';
import useCustomTheme, { DefaultTheme } from '@/utils/theme';
import colors from '@/utils/colors';
import React from 'react';
import makeStyles from './style';
import BottomSheet from '@/components/BottomSheet';
import AntDesign from 'react-native-vector-icons/AntDesign';

const RenderTaxes = ({selectedUniqueTax,setBottomSheetVisible,taxModalRef,taxArr,setSelectedUniqueTax})=>{
    const {styles,theme} = useCustomTheme(makeStyles);
    const {height,width} = Dimensions.get('window');
    
    const RenderTaxModal = (
        <BottomSheet
          bottomSheetRef={taxModalRef}
          headerText='Select Taxes'
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
                    No Taxes Available
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
        <View style={styles.rowView}>
            <Icon name={'Path-12190'} color={DefaultTheme.colors.secondary} size={16} />
            <Text style={styles.fieldHeadingText}>{'Tax'}</Text>
        </View>

        <View style={styles.taxView}>
        <View style={styles.rowView}>
          <TouchableOpacity style={{flexDirection: 'row'}}
            onPress={()=>{
                setBottomSheetVisible(taxModalRef,true);
            }}
            textColor={{colors}}>
            <View
                style={[
                styles.buttonWrapper,
                styles.taxBtn,
                {borderColor: Object.keys(selectedUniqueTax).length ? '#084EAD' : '#d9d9d9'},
                ]}>
                <View style={[styles.checkboxContainer,{justifyContent:'center'}]}>
                {Object.keys(selectedUniqueTax).length > 0 
                ? (<>
                    {Object.keys(selectedUniqueTax).slice(0,2).map((item)=>(<Text style={{ color:'#084EAD'}} key={item}>  {selectedUniqueTax?.[item]?.name}  </Text>))}
                    {Object.keys(selectedUniqueTax)?.length > 2 && <Text style={{ color:'#084EAD'}}>  +more</Text>}
                </> )
                : <Text style={{color:'#868686'}}>Tax</Text>}
                </View>
            </View>
          </TouchableOpacity>
        </View>
        </View>
    </View>
    {RenderTaxModal}
    </>
    )
}


export default React.memo(RenderTaxes);