import { Text, TouchableOpacity, View } from "react-native";
import makeStyle from "./style";
import useCustomTheme, { DefaultTheme } from "@/utils/theme";
import colors from "@/utils/colors";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import React from "react";
import BottomSheet from "@/components/BottomSheet";
import Icons from '@/core/components/custom-icon/custom-icon';
const RenderGroups = ({groupName, groupModalRef, setBottomSheetVisible,fetchAllParentGroup,parentGroupArr,setSelectedGroup,setSelectedGroupUniqueName,selectedGroup})=>{
  const {theme,styles} = useCustomTheme(makeStyle);

  const RenderGroupModal = (
    <BottomSheet
    bottomSheetRef={groupModalRef}
    headerText='Select Group'
    headerTextColor='#084EAD'
    // adjustToContentHeight={false}
    flatListProps={{
        data: parentGroupArr,
        renderItem: ({item}) => {
        return (
            <TouchableOpacity 
            style={styles.button}
            onPress={() => {
                setSelectedGroup(item?.name)
                setSelectedGroupUniqueName(item?.uniqueName)
                setBottomSheetVisible(groupModalRef, false);
            }}
            >
            <Icons name={selectedGroup == item?.name ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
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
      <>
        <View style={[styles.fieldContainer,{maxHeight:100}]}>
        <View style={styles.rowView}>
          <Icon name='arrange-bring-forward' color={DefaultTheme.colors.secondary} size={16} />
          <Text style={styles.fieldHeadingText}>{'Groups'}</Text>
        </View>

        <View style={styles.unitGroupView}>
          <View style={styles.rowView}>
            <TouchableOpacity
              style={styles.rowView}
              onPress={async ()=>{
                await fetchAllParentGroup();
                setBottomSheetVisible(groupModalRef,true);
              }}
              textColor={{colors}}>
              <View
                style={[
                  styles.buttonWrapper,
                  styles.modalBtn,
                  {borderColor: groupName.length ? '#084EAD' : '#d9d9d9',paddingHorizontal:10},
                ]}>
                <Text style={[styles.buttonText,{ color:'#868686'}]}>
                  {groupName.length > 0 ? <Text style={[{color:'#084EAD'}]}>{groupName}</Text> : 'Select Group'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        </View>
      {RenderGroupModal}
      </>
    )
}


export default React.memo(RenderGroups);