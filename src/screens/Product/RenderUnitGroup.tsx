import { Animated, Dimensions, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import useCustomTheme, { DefaultTheme } from "@/utils/theme";
// import Icon from '@/core/components/custom-icon/custom-icon';
import React, { memo, useEffect, useRef, useState } from "react";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import makeStyles from "./style";
import BottomSheet from "@/components/BottomSheet";
import Icons from '@/core/components/custom-icon/custom-icon';
import Loader from "@/components/Loader";

const RenderUnitGroup = ({
    unit,
    unitGroupName, 
    unitGroupModalRef, 
    setBottomSheetVisible,
    unitGroupMappingModalRef, 
    unitGroupArr, 
    setSelectedUnitGroup, 
    setSelectedUnitGroupUniqueName,
    fetchUnitGroupMappingDebounce, 
    selectedUnitGroup, 
    unitGroupMapping,
    setUnit,
    setUnitGroupMapping,
    fetchLinkedUnitMapping
    })=>{
    const {theme,styles} = useCustomTheme(makeStyles);
    const {height, width} = Dimensions.get('window')
    const HEADER_COLLAPSE = 32;
    const scrollY = useRef(new Animated.Value(0)).current;
    const contentRef = useRef(null);
    const scrollViewRef = useRef(null);
    const [index, setIndex] = useState(0);

    const handleIndexChange = (i,name,uniqueName) => {
      const w = 55; 
      const m = 25;
      const x = (w + m) * i;
      setUnitGroupMapping([]);
      setIndex(i);
  
      if (contentRef.current) {
        contentRef.current.getScrollResponder().scrollTo({ y: 0, animated: true });
      }
  
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x, animated: true });
      }
      setSelectedUnitGroup(name)
      setSelectedUnitGroupUniqueName(uniqueName)
      setUnit({
        code: "", 
        name: "", 
        uniqueName: ""
      });
      fetchUnitGroupMappingDebounce(uniqueName)
    };

    const Item = memo(({ active, name, uniqueName, onPress }) => (
      <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.75}>
        <Text style={[styles.item__emoji,{ fontFamily : active? theme.typography.fontFamily.bold : theme.typography.fontFamily.regular }]}>{name}</Text>
        {active && <View style={styles.item__line} />}
      </TouchableOpacity>
    ));

    const renderGroupBar = (
      <View style={styles.tabbar}>
        <Animated.View
          style={[
            styles.tabbar__wrapper,
            {
              transform: [
                {
                  translateY: scrollY.interpolate({
                    inputRange: [0, 100],
                    outputRange: [0, -HEADER_COLLAPSE],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            },
          ]}
        >
          <View style={{ marginTop: 20 }}>
              <Text style={styles.headerText}>Select Unit</Text>
              {/* <View style={styles.divider}/> */}
          </View>
  
          <ScrollView
            ref={scrollViewRef}
            style={styles.tabbar__list}
            contentContainerStyle={styles.tabbar__listContent}
            showsHorizontalScrollIndicator={false}
            horizontal={true}
          >
            {unitGroupArr.map(({ name, uniqueName }, i) => (
              <Item
                key={i}
                active={index === i}
                name={name}
                uniqueName={uniqueName}
                onPress={() => handleIndexChange(i,name,uniqueName)}
              />
            ))}
          </ScrollView>
          {/* <View style={[{marginTop:2},styles.divider]}/> */}
        </Animated.View>
      </View>
      );


    const RenderUnitMappingModal = (
        <BottomSheet
        bottomSheetRef={unitGroupMappingModalRef}
        headerText='Select Unit Group'
        headerTextColor='#084EAD'
        adjustToContentHeight={((unitGroupMapping.length*47) > (height-100)) ? false : true}
        HeaderComponent={renderGroupBar}
        flatListProps={{
            data: unitGroupMapping,
            renderItem: ({item}) => {
            return (
                <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    setUnit({
                        code: item?.stockUnitX?.code, 
                        name: item?.stockUnitX?.name, 
                        uniqueName: item?.stockUnitX?.uniqueName
                    });
                    setBottomSheetVisible(unitGroupMappingModalRef, false);
                    fetchLinkedUnitMapping(item?.stockUnitX?.uniqueName)
                }}
                >
                <Icons name={unit?.name == item?.stockUnitX?.name ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                <Text style={styles.radiobuttonText}>
                    {item?.stockUnitX?.name} ({item?.stockUnitX?.code})
                </Text>
                </TouchableOpacity>
            );
            },
            ListEmptyComponent: () => {
            if(selectedUnitGroup !== '' && unitGroupMapping.length == 0) return (<View style={styles.modalCancelView}><Loader isLoading={unitGroupMapping.length == 0}/></View>);
            else 
            return (
                <View style={styles.modalCancelView}>
                <Text
                    style={styles.modalCancelText}>
                    No Unit Available
                </Text>
                </View>

            );
            }
        }}
        />
    )

    // const RenderUnitGroupModal = (
    //     <BottomSheet
    //     bottomSheetRef={unitGroupModalRef}
    //     headerText='Select Unit Group'
    //     headerTextColor='#084EAD'
    //     adjustToContentHeight={((unitGroupArr.length*47) > (height-100)) ? false : true}
    //     flatListProps={{
    //         data: unitGroupArr,
    //         renderItem: ({item}) => {
    //         return (
    //             <TouchableOpacity 
    //             style={styles.button}
    //             onPress={() => {
    //                 setSelectedUnitGroup(item?.name)
    //                 setSelectedUnitGroupUniqueName(item?.uniqueName)
    //                 setUnit({
    //                     code: "", 
    //                     name: "", 
    //                     uniqueName: ""
    //                 });
    //                 setBottomSheetVisible(unitGroupModalRef, false);
    //                 fetchUnitGroupMappingDebounce(item?.uniqueName)
    //             }}
    //             >
    //             <Icons name={selectedUnitGroup == item?.name ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
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


    return  (
    <>    
    <View style={[styles.fieldContainer,{maxHeight:100}]}>
        {/* <View style={styles.rowView}>
            <Icon name='tag-multiple' color={DefaultTheme.colors.secondary} size={17} />
            <Text style={styles.fieldHeadingText}>{'Unit'}</Text>
        </View> */}
        <View style={styles.unitGroupView}>
        <View style={styles.rowView}>
            {/* <TouchableOpacity
                onPress={()=>{
                    setBottomSheetVisible(unitGroupModalRef,true);
                }}
            >
            <View
                style={[
                styles.buttonWrapper,
                styles.modalBtn,
                {borderColor: unitGroupName ? '#084EAD' : '#d9d9d9'},
                ]}>
                {unitGroupName ? (
                <Text style={[styles.buttonText, { color: '#084EAD' }]}>
                    {unitGroupName}
                </Text>
                ) : (
                <Text
                    style={[styles.buttonText, { color: '#868686' }]}>
                    Group
                </Text>
                )}
            </View>
            </TouchableOpacity> */}

            <TouchableOpacity
                onPress={()=>{
                    setBottomSheetVisible(unitGroupMappingModalRef,true)
                }}
            >
            <View
                style={[
                styles.buttonWrapper,
                styles.modalBtn,
                {borderColor: unit.uniqueName.length ? '#084EAD' : '#d9d9d9',paddingHorizontal:10},
                ]}>
                { unit?.uniqueName?.length > 0 ? ( 
                <Text style={[styles.buttonText, { color: '#084EAD' }]}>
                    {unit?.name} ({unit?.code})
                </Text>
                ) : (
                <Text
                    style={[styles.buttonText, { color: '#868686' }]}>
                    Select Unit
                </Text>
                )}
            </View>
            </TouchableOpacity>
        </View>
        </View>
    </View>
    {/* {RenderUnitGroupModal} */}
    {RenderUnitMappingModal}
    </>
    )
}

export default React.memo(RenderUnitGroup);