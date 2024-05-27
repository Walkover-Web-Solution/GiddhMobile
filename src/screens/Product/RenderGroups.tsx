import { Text, TouchableOpacity, View } from "react-native";
import style from "./style";
import { DefaultTheme } from "@/utils/theme";
import colors from "@/utils/colors";
import Icon from '@/core/components/custom-icon/custom-icon';

const RenderGroups = ({groupName, groupModalRef, setBottomSheetVisible})=>{
    return (
        <View style={[style.fieldContainer,{maxHeight:100}]}>
        <View style={{flexDirection: 'row'}}>
          <Icon name={'Path-12190'} color={DefaultTheme.colors.secondary} size={16} />
          <Text style={style.fieldHeadingText}>{'Groups'}</Text>
        </View>

        <View style={{paddingVertical: 6, marginTop: 10}}>
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity
              style={{flexDirection: 'row'}}
              onPress={()=>{
                setBottomSheetVisible(groupModalRef,true);
              }}
              textColor={{colors}}>
              <View
                style={[
                  style.buttonWrapper,
                  {marginLeft: 20,minWidth:140},
                  {borderColor: groupName.length ? '#084EAD' : '#d9d9d9'},
                ]}>
                <Text
                  style={[
                    style.buttonText,
                    {
                      color:'#868686',
                    },
                  ]}>
                  {groupName.length > 0 ? <Text style={{color:'#084EAD'}}>{groupName}</Text> : 'Select Group'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        </View>
    )
}


export default RenderGroups;