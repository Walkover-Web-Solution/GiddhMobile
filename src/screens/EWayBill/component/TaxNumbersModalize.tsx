import BottomSheet from "@/components/BottomSheet";
import useCustomTheme, { ThemeProps } from "@/utils/theme";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";


const RenderItem = ({item, handlePress, setBottomSheetVisible, modalRef}) => {
    const {styles} = useCustomTheme(getStyles);
    // console.log("hi", item);
    
    return (
        <TouchableOpacity
            onPress={() => {
                handlePress(item);
                setBottomSheetVisible(modalRef, false);
            }}
            style={styles.button}
            >
            <Text style={styles.semiBoldText}>{item}</Text>
        </TouchableOpacity>
    );
}

const TaxNumbersModalize = ({modalizeRef, setBottomSheetVisible, taxData, setSelectedGst}) => {
    const {styles} = useCustomTheme(getStyles);
    return (
        <BottomSheet
            bottomSheetRef={modalizeRef}
            headerText={'Select GSTIN'}
            headerTextColor={'#084EAD'}
            adjustToContentHeight
            customRenderer={
                <View style={styles.modalStyle} >
                    <FlatList
                        data={taxData}
                        keyExtractor={item => item?.key?.toString()}
                        renderItem={({item}) => <RenderItem item={item} handlePress={setSelectedGst} setBottomSheetVisible={setBottomSheetVisible} modalRef={modalizeRef}/>}
                    />
                </View>
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
        flex:1,
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center'
    },
});

export default TaxNumbersModalize;
