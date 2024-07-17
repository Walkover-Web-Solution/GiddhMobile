import { Animated, Dimensions, ScrollView, Text, TouchableOpacity, View } from "react-native";
import useCustomTheme, { DefaultTheme } from "@/utils/theme";
import React, { memo, useRef, useState } from "react";
import makeStyles from "./style";
import BottomSheet from "@/components/BottomSheet";
import Icons from '@/core/components/custom-icon/custom-icon';
import Loader from "@/components/Loader";
import MatButton from "@/components/OutlinedButton";

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
      <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.5}>
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
        // adjustToContentHeight={((unitGroupMapping.length*47) > (height-100)) ? false : true}
        adjustToContentHeight={false}
        modalTopOffset={(height-(width+100))}
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

    return  (
    <>    
    <View style={[styles.fieldContainer,{maxHeight:100,marginHorizontal:16}]}>
      <View style={styles.unitGroupView}>
        <View style={[styles.rowView,{width:'48%'}]}>
          <View style={{flex:1}}>
            <MatButton 
              lable="Select Unit"
              value={unit?.uniqueName?.length > 0 && unit?.name+" "+"("+unit?.code+")"}
              onPress={()=>{
                setBottomSheetVisible(unitGroupMappingModalRef,true)
            }}
            />
          </View>
        </View>
      </View>
    </View>
    {/* {RenderUnitGroupModal} */}
    {RenderUnitMappingModal}
    </>
    )
}

export default React.memo(RenderUnitGroup);