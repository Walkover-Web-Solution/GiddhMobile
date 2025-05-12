import BottomSheet from "@/components/BottomSheet";
import useCustomTheme, { ThemeProps } from "@/utils/theme";
import { includes } from "lodash";
import { useState } from "react";
import { FlatList, KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const StateModalize = ({modalizeRef, setBottomSheetVisible, data, tempVehicleState, setTempVehicleState}) => {
    const {styles} = useCustomTheme(getStyles);
    const [filterState, setFilterStates] = useState(data);
    const [searchedText, setSearchedText] = useState("");
    const filterStates = (text: string) => {
        const tempData = data;
        const filterData = tempData.filter((item) => item?.name?.toLowerCase()?.includes(text.toLowerCase()));
        setFilterStates(filterData);
    }
    return (
        <BottomSheet
            bottomSheetRef={modalizeRef}
            headerText={'Select State'}
            headerTextColor={'#084EAD'}
            modalStyle={{flex:1}}
            modalTopOffset={50}
            adjustToContentHeight={false}
            customRenderer={
                <KeyboardAvoidingView style={styles.modalStyle} >
                    <TextInput
                        placeholderTextColor={'rgba(80,80,80,0.5)'}
                        placeholder="Enter State Name"
                        returnKeyType={"done"}
                        value={searchedText}
                        style={{ height: 40, width: "100%", fontSize: 15, fontFamily: 'AvenirLTStd-Book', color: '#1c1c1c' }}
                        onChangeText={(text) => {
                            setSearchedText(text)
                            filterStates(text);
                        }}
                    />
                    <FlatList
                        data={searchedText?.length !==0 ? filterState : data}
                        keyExtractor={item => item?.code?.toString()}
                        renderItem={({item}) => (
                            <TouchableOpacity style={{ paddingVertical: 10, paddingHorizontal:5 }}
                                onPress={() => {
                                    setTempVehicleState({
                                        ...tempVehicleState,
                                        fromState: item?.stateGstCode,
                                        fromStateName: item?.name
                                    })
                                    setFilterStates([]);
                                    setSearchedText("");
                                    setBottomSheetVisible(modalizeRef, false);
                                }}>
                                <Text style={{ fontSize: 15, fontFamily: 'AvenirLTStd-Book', color: '#1c1c1c' }}><Text>{item?.code} - </Text>{item?.name}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </KeyboardAvoidingView>
            }
        />
    )
}
const getStyles = (theme: ThemeProps) => StyleSheet.create({
    modalStyle: {
        backgroundColor: theme.colors.secondaryBackground,
        paddingHorizontal: 18,
        paddingVertical:10
    },
    semiBoldText: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.regular.size,
        lineHeight: theme.typography.fontSize.regular.lineHeight,
        color: theme.colors.primary,
        marginLeft:10
    },
    button: { 
        paddingVertical: 7,
        flexDirection:'row',
        flex:1,
        alignItems:'center',
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center'
    },
});


export default StateModalize;