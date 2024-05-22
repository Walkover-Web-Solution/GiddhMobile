import { FONT_FAMILY } from "@/utils/constants";
import { DefaultTheme } from "@/utils/theme";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import AntDesign from 'react-native-vector-icons/AntDesign';
import Icon from '@/core/components/custom-icon/custom-icon';
import style from "./style";

const RenderVariants = ()=>{
    const [expandAcc, setExpandAcc] = useState(false);
    return (
        <View>
            <View
                style={{
                    backgroundColor: '#E6E6E6',
                    flexDirection: 'row',
                    paddingVertical: 9,
                    paddingHorizontal: 16,
                    justifyContent: 'space-between'
                }}>
                <View style={{ flexDirection: 'row' }}>
                    <Icon style={{ marginRight: 10 }} name={'Path-12190'} size={16} color={DefaultTheme.colors.secondary} />
                    <Text style={{ color: '#1C1C1C', fontFamily: FONT_FAMILY.semibold }}>Variant</Text>
                </View>
                <Icon
                    style={{ transform: [{ rotate: expandAcc ? '180deg' : '0deg' }] }}
                    name={'9'}
                    size={16}
                    color="#808080"
                    onPress={() => {
                    setExpandAcc(!expandAcc);
                    }}
                />
            </View>
            {
            expandAcc && (
                <TouchableOpacity
                    // onPress={() => console.log(this.state.partyShippingAddress)}
                    style={{
                    marginVertical: 16,
                    paddingVertical: 10,
                    flexDirection: 'row',
                    alignSelf: 'center',
                    justifyContent: 'center',
                    }}>
                    <AntDesign name={'plus'} color={'blue'} size={18} style={{ marginHorizontal: 8 }} />
                    <Text numberOfLines={1} style={style.addItemMain}> Add options like multiple size or colours etc...</Text>
                </TouchableOpacity>
            )
            }
        </View>
    )
}

export default RenderVariants;