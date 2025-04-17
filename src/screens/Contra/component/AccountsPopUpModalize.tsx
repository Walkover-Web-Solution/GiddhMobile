import BottomSheet from "@/components/BottomSheet";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from '@/core/components/custom-icon/custom-icon';
import useCustomTheme, { ThemeProps } from "@/utils/theme";

const AccountsPopUpModalize = ({modalizeRef, paymentModes, setBottomSheetVisible, setPaymentMode, setIsSelectAccountButtonSelected, paymentMode}) => {
    const {theme, styles, voucherBackground} = useCustomTheme(getStyles, 'Contra')

    return (
      <BottomSheet
        bottomSheetRef={modalizeRef}
        headerText='Payment Mode'
        headerTextColor={voucherBackground}
        flatListProps={{
          data: paymentModes,
          style: {paddingVertical: 10},
          renderItem: ({item}) => {
            return (
              <TouchableOpacity
                style={styles.itemView}
                onPress={() => {
                  setPaymentMode({
                    uniqueName: item.uniqueName,
                    name: item.name,
                  })
                  setBottomSheetVisible(modalizeRef, false);
                  setIsSelectAccountButtonSelected(item?.uniqueName != '' ? true : false)
                }}>
                <View style={styles.itemContainer}>
                  {paymentMode?.uniqueName == item.uniqueName ? (
                    <Icon name={'radio-checked2'} color={voucherBackground} size={16} />
                  ) : (
                    <Icon name={'radio-unchecked'} color={voucherBackground} size={16} />
                  )}
                  <Text style={styles.text}>{item.name}</Text>
                </View>
              </TouchableOpacity>
            );
          }
        }}
      />
    );
  }

  export default AccountsPopUpModalize;

  const getStyles = (theme: ThemeProps) => StyleSheet.create({
    itemContainer: {
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingVertical: 8
    },
    itemView:{
      paddingHorizontal: 20,
      marginHorizontal: 2,
      borderRadius: 10,
    },
    text: {
      color: '#1C1C1C',
      paddingVertical: 4,
      fontSize: theme.typography.fontSize.regular.size,
      lineHeight: theme.typography.fontSize.regular.lineHeight,
      textAlign: 'center',
      marginLeft: 10,
      fontFamily: theme.typography.fontFamily.bold,
    }
  })