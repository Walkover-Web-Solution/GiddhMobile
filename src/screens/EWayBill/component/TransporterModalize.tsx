import BottomSheet from "@/components/BottomSheet";
import useCustomTheme, { ThemeProps } from "@/utils/theme";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const RenderItem = ({item, handlePress, setBottomSheetVisible, modalRef}) => {
    const {styles} = useCustomTheme(getStyles);
    return (
        <TouchableOpacity
            onPress={() => {
                handlePress(item);
                setBottomSheetVisible(modalRef, false);
            }}
            style={styles.button}
            >
            <Text style={styles.semiBoldText}>{item?.transporterName}</Text>
        </TouchableOpacity>
    );
}

const TransporterModalize = ({modalizeRef, setBottomSheetVisible, transporterData, setTransporter, addTrasporterModalRef}) => {
    const {styles, theme} = useCustomTheme(getStyles);
    return (
        <BottomSheet
            bottomSheetRef={modalizeRef}
            headerText={'Select Transporter'}
            headerTextColor={'#084EAD'}
            adjustToContentHeight
            customRenderer={
                <View style={styles.modalStyle} >
                    <FlatList
                        data={transporterData}
                        keyExtractor={item => item?.transporterId?.toString()}
                        renderItem={({item}) => <RenderItem item={item} handlePress={setTransporter} setBottomSheetVisible={setBottomSheetVisible} modalRef={modalizeRef}/>}
                        ListFooterComponent={()=>(
                            <View style={{flex:1,paddingVertical:10}}>
                                <TouchableOpacity onPress={()=> {
                                    setBottomSheetVisible(addTrasporterModalRef, true)
                                    setBottomSheetVisible(modalizeRef, false)
                                    }}
                                    >
                                    <Text style={styles.semiBoldText2}>+ Create New</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                </View>
            }
        />
    )
}

export default TransporterModalize;


const getStyles = (theme: ThemeProps) => StyleSheet.create({
    modalStyle: {
        backgroundColor: theme.colors.secondaryBackground,
        paddingHorizontal: 18,
        paddingVertical:10
    },
    semiBoldText: {
        fontFamily: theme.typography.fontFamily.semiBold,
        fontSize: theme.typography.fontSize.regular.size,
        lineHeight: theme.typography.fontSize.regular.lineHeight,
        color: theme.colors.primary,
    },
    semiBoldText2: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize.large.size,
        lineHeight: theme.typography.fontSize.large.lineHeight,
        color: '#084EAD',
    },
    button: { paddingVertical: 7}
});