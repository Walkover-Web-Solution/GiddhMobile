import { Dimensions, Text, TextInput, TouchableOpacity, View } from "react-native";
import useCustomTheme, { DefaultTheme } from "@/utils/theme";
// import Icon from '@/core/components/custom-icon/custom-icon';
import React from "react";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import makeStyles from "./style";
import BottomSheet from "@/components/BottomSheet";
import Icons from '@/core/components/custom-icon/custom-icon';

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
    fetchLinkedUnitMapping
    })=>{
    const {theme,styles} = useCustomTheme(makeStyles);

    const RenderUnitMappingModal = (
        <BottomSheet
        bottomSheetRef={unitGroupMappingModalRef}
        headerText='Select Unit Group'
        headerTextColor='#084EAD'
        adjustToContentHeight={false}
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

    const RenderUnitGroupModal = (
        <BottomSheet
        bottomSheetRef={unitGroupModalRef}
        headerText='Select Unit Group'
        headerTextColor='#084EAD'
        flatListProps={{
            data: unitGroupArr,
            renderItem: ({item}) => {
            return (
                <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    setSelectedUnitGroup(item?.name)
                    setSelectedUnitGroupUniqueName(item?.uniqueName)
                    setBottomSheetVisible(unitGroupModalRef, false);
                    fetchUnitGroupMappingDebounce(item?.uniqueName)
                }}
                >
                <Icons name={selectedUnitGroup == item?.name ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                <Text style={styles.radiobuttonText}>
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


    return  (
    <>    
    <View style={[styles.fieldContainer,{maxHeight:100}]}>
        <View style={styles.rowView}>
            <Icon name='tag-multiple' color={DefaultTheme.colors.secondary} size={17} />
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
                {borderColor: unit.uniqueName.length ? '#084EAD' : '#d9d9d9'},
                ]}>
                { unit.uniqueName.length > 0 ? ( 
                <Text style={[styles.buttonText, { color: '#084EAD' }]}>
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
    {RenderUnitGroupModal}
    {RenderUnitMappingModal}
    </>
    )
}

export default React.memo(RenderUnitGroup);