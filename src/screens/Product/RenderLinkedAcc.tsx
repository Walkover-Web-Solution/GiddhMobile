import { FONT_FAMILY } from "@/utils/constants";
import { DefaultTheme } from "@/utils/theme";
import { Text, View } from "react-native";
import Icon from '@/core/components/custom-icon/custom-icon';
import GeneralLinkedAccComponent from "./GeneralLinkedAccComponent";

const RenderLinkedAcc = ({unit,expandAcc,setExpandAcc})=>{

    // const radio_props = [
    //     { label: 'MRP (Inclusive)', value: 0 },
    //     { label: 'Exclusive', value: 1 }
    //   ];
    // const [radioBtn, setRadioBtn]= useState(1);
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
                <Text style={{ color: '#1C1C1C', fontFamily: FONT_FAMILY.semibold }}>Linked Account</Text>
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
                <View> 
                    <GeneralLinkedAccComponent linkedAccountText = "Linked Purchase Accounts" unitName={unit ? (''+unit?.name+'('+unit?.code+')'):'Unit'}/>
                    <View style={{flex:1,borderBottomWidth:0.2,width:'95%',alignSelf:'center'}}></View>
                    <GeneralLinkedAccComponent linkedAccountText = "Linked Sales Accounts" unitName={unit ? (''+unit?.name+'('+unit?.code+')'):'Unit'}/>
                </View>
                )
            }
        </View>
    );
}

export default RenderLinkedAcc;