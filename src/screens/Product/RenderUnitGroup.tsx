import { Text, TextInput, TouchableOpacity, View } from "react-native";
import style from "./style";
import { DefaultTheme } from "@/utils/theme";
import Icon from '@/core/components/custom-icon/custom-icon';

const RenderUnitGroup = ({unit,unitGroupName, unitGroupModalRef, setBottomSheetVisible, unitGroupMappingModalRef})=>{
    return (
    <View style={[style.fieldContainer,{maxHeight:100}]}>
        <View style={{flexDirection: 'row'}}>
        <Icon name={'path-15'} color={DefaultTheme.colors.secondary} size={16} />
        <Text style={style.fieldHeadingText}>{'Unit'}</Text>
        </View>
        <View style={{paddingVertical: 6, marginTop: 10, justifyContent: 'space-between'}}>
        <View style={{flexDirection: 'row', }}>
            <TouchableOpacity
                onPress={()=>{
                    setBottomSheetVisible(unitGroupModalRef,true);
                }}
            // onPress={() => {
            //     if (!this.state.partyName) {
            //     alert('Please select a party.');
            //     } else if (this.state.amountForReceipt == '') {
            //     alert('Please enter amount.');
            //     } else {
            //     this.setState({showClearanceDatePicker: true});
            //     this.setState({isClearanceDateSelelected: true});
            //     }
            // }}>
            >
            <View
                style={[
                style.buttonWrapper,
                {marginHorizontal:20,width:140,height:40,justifyContent:'center',borderColor: unitGroupName ? '#084EAD' : '#d9d9d9'},
                ]}>
                {unitGroupName ? (
                <Text style={[style.buttonText, { color: '#084EAD' }]}>
                    {unitGroupName}
                </Text>
                ) : (
                <Text
                    style={[style.buttonText, { color: '#868686' }]}>
                    Group
                </Text>
                )}
            </View>
            </TouchableOpacity>

            <TouchableOpacity
            onPress={()=>{
                setBottomSheetVisible(unitGroupMappingModalRef,true)
            }}
            // onPress={() => {
            //     if (!this.state.partyName) {
            //     alert('Please select a party.');
            //     } else if (this.state.amountForReceipt == '') {
            //     alert('Please enter amount.');
            //     } else {
            //     this.setState({showClearanceDatePicker: true});
            //     this.setState({isClearanceDateSelelected: true});
            //     }
            // }}>
            >
            <View
                style={[
                style.buttonWrapper,
                {marginHorizontal:20,width:140,height:40,justifyContent:'center',borderColor: unit.uniqueName.length ? '#084EAD' : '#d9d9d9'},
                ]}>
                { unit.uniqueName.length > 0 ? ( 
                <Text style={[style.buttonText, { color: '#084EAD' }]}>
                    {unit?.name} ({unit?.code})
                </Text>
                ) : (
                <Text
                    style={[style.buttonText, { color: '#868686' }]}>
                    Unit
                </Text>
                )}
            </View>
            </TouchableOpacity>
        </View>
        </View>
    </View>
    )
}

export default RenderUnitGroup;