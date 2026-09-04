import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import BottomSheet from '@/components/BottomSheet';
import ModalPressable, { ACTION_SHEET_MODALIZE_PROPS } from '@/components/ModalPressable';
import useCustomTheme, { ThemeProps } from '@/utils/theme';

export type UploadSource = 'camera' | 'gallery' | 'files';

type Props = {
  bottomSheetRef: React.RefObject<any>;
  onSelect: (source: UploadSource) => void;
};

const UPLOAD_SOURCES: { key: UploadSource; icon: string; labelKey: string }[] = [
  { key: 'camera', icon: 'camera-outline', labelKey: 'scan2.camera' },
  { key: 'gallery', icon: 'image-outline', labelKey: 'scan2.gallery' },
  { key: 'files', icon: 'file-document-outline', labelKey: 'scan2.files' },
];

const UploadSourceSheet: React.FC<Props> = ({ bottomSheetRef, onSelect }) => {
  const { t } = useTranslation();
  const { styles } = useCustomTheme(getStyles);

  return (
    <BottomSheet
      bottomSheetRef={bottomSheetRef}
      headerText={t('scan2.uploadSourceTitle')}
      headerTextColor="#265BB5"
      {...ACTION_SHEET_MODALIZE_PROPS}
      customRenderer={
        <View style={styles.container}>
          {UPLOAD_SOURCES.map(({ key, icon, labelKey }) => (
            <ModalPressable
              key={key}
              style={({ pressed }: { pressed: boolean }) => [styles.option, pressed && styles.optionPressed]}
              onPress={() => onSelect(key)}
            >
              <View style={styles.iconWrap}>
                <MaterialCommunityIcons name={icon} size={28} color="#265BB5" />
              </View>
              <Text style={styles.optionText}>{t(labelKey)}</Text>
            </ModalPressable>
          ))}
        </View>
      }
    />
  );
};

export default UploadSourceSheet;

const getStyles = (theme: ThemeProps) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'flex-start',
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 24,
    },
    option: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: 4,
    },
    optionPressed: {
      opacity: 0.7,
    },
    iconWrap: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: '#EAF1FF',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },
    optionText: {
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.regular.size,
      color: theme.colors.text,
      textAlign: 'center',
    },
  });
