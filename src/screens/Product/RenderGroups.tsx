import { Text, TouchableOpacity, View } from "react-native";
import makeStyle from "./style";
import useCustomTheme, { DefaultTheme } from "@/utils/theme";
import colors from "@/utils/colors";
// import Icon from '@/core/components/custom-icon/custom-icon';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import React from "react";

const RenderGroups = ({groupName, groupModalRef, setBottomSheetVisible})=>{
  const {theme,styles} = useCustomTheme(makeStyle);
    return (
        <View style={[styles.fieldContainer,{maxHeight:100}]}>
        <View style={styles.rowView}>
          <Icon name='arrange-bring-forward' color={DefaultTheme.colors.secondary} size={16} />
          <Text style={styles.fieldHeadingText}>{'Groups'}</Text>
        </View>

        <View style={styles.unitGroupView}>
          <View style={styles.rowView}>
            <TouchableOpacity
              style={styles.rowView}
              onPress={()=>{
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
    )
}


export default React.memo(RenderGroups);