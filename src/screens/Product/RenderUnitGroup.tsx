import { Dimensions, Text, TextInput, TouchableOpacity, View } from "react-native";
import useCustomTheme, { DefaultTheme } from "@/utils/theme";
// import Icon from '@/core/components/custom-icon/custom-icon';
import React from "react";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import makeStyles from "./style";

const RenderUnitGroup = ({unit,unitGroupName, unitGroupModalRef, setBottomSheetVisible, unitGroupMappingModalRef})=>{
    const {theme,styles,voucherBackground} = useCustomTheme(makeStyles,'Stock');
    return  (
    <View style={[styles.fieldContainer,{maxHeight:100}]}>
        <View style={styles.rowView}>
            <Icon name='tag-multiple' color={voucherBackground} size={17} />
            <Text style={styles.fieldHeadingText}>{'Unit'}</Text>
        </View>
        <View style={styles.unitGroupView}>
        <View style={styles.rowView}>
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
                styles.buttonWrapper,
                styles.modalBtn,
                {borderColor: unitGroupName ? voucherBackground : '#d9d9d9'},
                ]}>
                {unitGroupName ? (
                <Text style={[styles.buttonText, { color: voucherBackground }]}>
                    {unitGroupName}
                </Text>
                ) : (
                <Text
                    style={[styles.buttonText, { color: '#868686' }]}>
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
                styles.buttonWrapper,
                styles.modalBtn,
                {borderColor: unit.uniqueName.length ? voucherBackground : '#d9d9d9'},
                ]}>
                { unit.uniqueName.length > 0 ? ( 
                <Text style={[styles.buttonText, { color: voucherBackground }]}>
                    {unit?.name} ({unit?.code})
                </Text>
                ) : (
                <Text
                    style={[styles.buttonText, { color: '#868686' }]}>
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

export default React.memo(RenderUnitGroup);