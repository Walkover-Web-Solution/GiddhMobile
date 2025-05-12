import BottomSheet from "@/components/BottomSheet";
import useCustomTheme, { ThemeProps } from "@/utils/theme";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const CancelReasonEWBModalize = ({modalizeRef, setBottomSheetVisible, reasonState, setReasonState, data}) => {
    const {styles} = useCustomTheme(getStyles);
    console.log("jijijjijji----------->",reasonState);
    
    return (
        <BottomSheet
            bottomSheetRef={modalizeRef}
            headerText={'Actions'}
            headerTextColor={'#084EAD'}
            adjustToContentHeight
            customRenderer={
                <View style={styles.modalStyle} >
                    {
                        Object.entries(data).map(([key, value]:any)=>(
                            <TouchableOpacity key={key} style={styles.button} onPress={()=>{
                                setReasonState({
                                    ...reasonState,
                                    cancelRsnCode: key
                                })
                                setBottomSheetVisible(modalizeRef, false);
                            }}>
                                <Text style={styles.modalText}>{value}</Text>
                            </TouchableOpacity>
                        ))
                    }
                </View>
            }
        />
    )
}
const getStyles = (theme: ThemeProps) => StyleSheet.create({
    modalStyle: {
        backgroundColor: theme.colors.secondaryBackground,
        paddingHorizontal: 21,
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
        paddingVertical: 10,
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalText: {
        fontFamily: theme.typography.fontFamily.semiBold,
        fontSize: theme.typography.fontSize.large.size,
        lineHeight: theme.typography.fontSize.large.lineHeight,
        color: theme.colors.solids.black,
    }
});

export default CancelReasonEWBModalize;
