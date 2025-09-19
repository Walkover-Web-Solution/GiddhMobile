import React, { useCallback, useMemo, memo } from 'react'
import { Keyboard, StyleSheet, Text, View } from 'react-native'
import { FONT_FAMILY, GD_FONT_SIZE } from '@/utils/constants';
import { Modalize, ModalizeProps, IHandles } from 'react-native-modalize';
import { Portal } from 'react-native-portalize';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TextInput } from 'react-native-paper';

type Props = {
  bottomSheetRef: React.Ref<any>;
  children?: React.ReactNode;
  headerText: string;
  headerTextColor?: string;
  searchable?: boolean;
  searchValue?: string;
  onSearchChange?: (text: string) => void;
  searchPlaceholder?: string;
} & ModalizeProps;

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
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  searchInput: {
    height: 40,
    backgroundColor: '#FFFFFF',
  },
  searchInputContent: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 14,
  },
  searchOutline: {
    borderWidth: 1,
    borderColor: '#D9D9D9',
  },
});

type HeaderProps = {
  headerText: string;
  headerTextColor?: string;
  searchable?: boolean;
  searchValue?: string;
  onSearchChange?: (text: string) => void;
  searchPlaceholder?: string;
};

const BottomSheetHeader = memo<HeaderProps>(({ 
  headerText, 
  headerTextColor, 
  searchable = false, 
  searchValue = '', 
  onSearchChange, 
  searchPlaceholder = 'Search...' 
}) => (
  <View style={{ marginTop: 20 }}>
    <Text style={[styles.headerText, { color: headerTextColor ?? '#000000'}]}>
      {headerText}
    </Text>
    {searchable && (
      <View style={styles.searchContainer}>
        <TextInput
          value={searchValue}
          onChangeText={onSearchChange}
          placeholder={searchPlaceholder}
          mode="outlined"
          style={styles.searchInput}
          contentStyle={styles.searchInputContent}
          outlineStyle={styles.searchOutline}
          dense
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>
    )}
    <View style={styles.divider}/>
  </View>
));

const BottomSheet: React.FC<Props> = ({
  children, headerText, headerTextColor, bottomSheetRef, searchable = false, searchValue = '', onSearchChange, searchPlaceholder = 'Search...', ...props
}) => {
  const insets = useSafeAreaInsets();
  return (
    <Portal>
      <Modalize
        ref={bottomSheetRef}
        adjustToContentHeight={true}
        handlePosition='inside'
        HeaderComponent={
          <BottomSheetHeader
            headerText={headerText}
            headerTextColor={headerTextColor}
            searchable={searchable}
            searchValue={searchValue}
            onSearchChange={onSearchChange}
            searchPlaceholder={searchPlaceholder}
          />
        }
        disableScrollIfPossible={false}
        modalStyle={{ minHeight: '25%', paddingBottom:insets.bottom}}
        modalTopOffset={insets.top}
        keyboardAvoidingBehavior="height"
        {...props}
      >
        {children}
      </Modalize>
    </Portal>
  )
}

export const setBottomSheetVisible = (modalRef: React.RefObject<IHandles>, visible: boolean) => {
    if(visible){
      Keyboard.dismiss();
      modalRef?.current?.open();
    } else {
      modalRef?.current?.close();
    }
  };

export default BottomSheet;