import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import BottomSheet from '@/components/BottomSheet';
import useCustomTheme, { ThemeProps } from '@/utils/theme';
import { DocumentFilterPayload } from './DocumentFilterSheet';

type SearchFilterKey = keyof DocumentFilterPayload;

type SearchOption = {
  key: SearchFilterKey;
  label: string;
};

type Props = {
  bottomSheetRef: React.RefObject<any>;
  selectedKey: SearchFilterKey;
  options: SearchOption[];
  onSelectKey: (key: SearchFilterKey) => void;
};

const SearchFilterSheet: React.FC<Props> = ({
  bottomSheetRef,
  selectedKey,
  options,
  onSelectKey,
}) => {
  const { t } = useTranslation();
  const { styles } = useCustomTheme(getStyles);

  return (
    <BottomSheet
      bottomSheetRef={bottomSheetRef}
      headerText={t('scan2.quickSearchTitle', { defaultValue: 'Search by' })}
      headerTextColor="#265BB5"
      adjustToContentHeight={false}
      modalHeight={340}
    >
      <View style={styles.container}>
        {options.map((option) => {
          const selected = selectedKey === option.key;
          return (
            <TouchableOpacity
              key={option.key}
              activeOpacity={0.8}
              style={styles.radioRow}
              onPress={() => onSelectKey(option.key)}
            >
              <MaterialCommunityIcons
                name={selected ? 'radiobox-marked' : 'radiobox-blank'}
                size={22}
                color={selected ? '#265BB5' : '#9CA3AF'}
              />
              <Text style={styles.radioText}>{option.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </BottomSheet>
  );
};

export default memo(SearchFilterSheet);

export type { SearchFilterKey };

const getStyles = (theme: ThemeProps) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 24,
    },
    radioRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6,
    },
    radioText: {
      marginLeft: 10,
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.regular.size,
      color: theme.colors.text,
    },
  });
