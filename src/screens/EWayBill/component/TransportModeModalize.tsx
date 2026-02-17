import BottomSheet from "@/components/BottomSheet";
import useCustomTheme, { ThemeProps } from "@/utils/theme";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from '@/core/components/custom-icon/custom-icon';
import { useTranslation } from "react-i18next";

const RenderItem = ({item, isSelected, handlePress, setBottomSheetVisible, modalRef}) => {
    const {styles} = useCustomTheme(getStyles);
    return (
        <TouchableOpacity
            onPress={() => {
                handlePress({
                    ...item,
                    isRegularChecked:true,
                    overDimensionChecked: false
                });
                setBottomSheetVisible(modalRef, false);
            }}
            style={styles.button}
            >
            <Icon name={isSelected ? 'radio-checked2' : 'radio-unchecked'} color={'#084EAD'} size={16} style={{ marginRight: 12 }} />
            <View style={styles.iconContainer}>{item?.icon}</View>
            <Text style={styles.semiBoldText}>{item?.name}</Text>
        </TouchableOpacity>
    );
}

const TransportModeModalize = ({modalizeRef, setBottomSheetVisible, transportData, transportMode, setTransportMode}) => {
    const { t } = useTranslation();
    const {styles} = useCustomTheme(getStyles);

    return (
        <BottomSheet
            bottomSheetRef={modalizeRef}
            headerText={t('ewayBill.selectMode')}
            headerTextColor={'#084EAD'}
            adjustToContentHeight
            customRenderer={
                <View style={styles.modalStyle} >
                    <FlatList
                        data={transportData}
                        keyExtractor={item => item?.key?.toString()}
                        renderItem={({item}) => <RenderItem item={item} isSelected={transportMode?.name === item.name} handlePress={setTransportMode} setBottomSheetVisible={setBottomSheetVisible} modalRef={modalizeRef}/>}
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
        flexDirection:'row',
        flex:1,
        alignItems:'center',
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center'
    },
});

export default TransportModeModalize;
