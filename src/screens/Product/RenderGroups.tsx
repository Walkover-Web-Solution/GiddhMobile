import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import makeStyle from "./style";
import useCustomTheme, { DefaultTheme } from "@/utils/theme";
import React from "react";
import BottomSheet from "@/components/BottomSheet";
import Icons from '@/core/components/custom-icon/custom-icon';
import MatButton from "@/components/OutlinedButton";
const RenderGroups = ({groupName, groupModalRef, setBottomSheetVisible,fetchAllParentGroup,parentGroupArr,setSelectedGroup,setSelectedGroupUniqueName})=>{
  const {theme,styles} = useCustomTheme(makeStyle);
  const {height,width} = Dimensions.get('window');

  const RenderGroupModal = (
    <BottomSheet
    bottomSheetRef={groupModalRef}
    headerText='Select Group'
    headerTextColor='#084EAD'
    adjustToContentHeight={((parentGroupArr.length*47) > (height-100)) ? false : true}
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
            <Icons name={groupName == item?.name ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
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
          <MatButton 
            lable="Select Group"
            value={groupName?.length > 0 ? groupName :""}
            onPress={async ()=>{
              await fetchAllParentGroup();
              setBottomSheetVisible(groupModalRef,true);
            }}
          />
        </View>
      {RenderGroupModal}
      </>
    )
}


export default React.memo(RenderGroups);