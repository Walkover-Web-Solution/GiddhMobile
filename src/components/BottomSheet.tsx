import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { FONT_FAMILY, GD_FONT_SIZE } from '@/utils/constants';
import { Modalize, ModalizeProps } from 'react-native-modalize';
import { Portal } from 'react-native-portalize';

type Props = {
  bottomSheetRef: React.Ref<any>;
  children?: React.ReactNode;
  headerText: string;
  headerTextColor?: string;
} & ModalizeProps;

const BottomSheet: React.FC<Props> = ({
  children, headerText, headerTextColor, bottomSheetRef, ...props
}) => {
  const HeaderComponent = () => (
    <View style={{ marginTop: 20 }}>
      <Text style={[styles.headerText, { color: headerTextColor ?? '#000000'}]}>
        {headerText}
      </Text>
      <View style={styles.divider}/>
    </View>
  )

  return (
    <Portal>
      <Modalize
        ref={bottomSheetRef}
        adjustToContentHeight={true}
        HeaderComponent={<HeaderComponent/>}
        modalStyle={{ minHeight: '25%' }}
        {...props}
      >
        {children}
      </Modalize>
    </Portal>
  )
}

export default BottomSheet;

const styles = StyleSheet.create({
  headerText: {
    fontFamily: FONT_FAMILY.bold, 
    paddingHorizontal: 20, 
    paddingBottom: 10, 
    fontSize: GD_FONT_SIZE.large
  },
  divider: {
    borderTopWidth: 1, 
    borderTopColor: '#D9D9D9', 
    marginHorizontal: 10
  },
});