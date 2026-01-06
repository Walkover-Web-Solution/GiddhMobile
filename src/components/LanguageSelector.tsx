import React, { useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { FONT_FAMILY, GD_FONT_SIZE } from '@/utils/constants';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import colors from '@/utils/colors';
import BottomSheet from './BottomSheet';

export type LanguageCode = 'en' | 'hi' | 'mr';

export interface Language {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
}

export const LANGUAGES: Language[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी' },
];

interface LanguageSelectorProps {
  buttonStyle?: object;
  buttonTextStyle?: object;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  buttonStyle,
  buttonTextStyle,
}) => {
  const { i18n, t } = useTranslation();
  const bottomSheetRef = useRef<any>(null);
  const currentLanguage = LANGUAGES.find(lang => lang.code === i18n.language) || LANGUAGES[0];

  const handleLanguageChange = useCallback(async (languageCode: LanguageCode) => {
    await i18n.changeLanguage(languageCode);
    bottomSheetRef?.current?.close();
  }, []);

  const renderLanguageItem = ({ item }: { item: typeof LANGUAGES[number] }) => {
    const isSelected = item.code === i18n.language;
    
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={[styles.languageItem]}
        onPress={() => handleLanguageChange(item.code)}
      >
        <View style={styles.languageInfo}>
          <Text style={[styles.languageLabel, isSelected && styles.selectedText]}>
            {item.label}
          </Text>
          <Text style={[styles.nativeLabel, isSelected && styles.selectedText]}>
            {item.nativeLabel}
          </Text>
        </View>
        {isSelected && (
          <Icon name="check" size={24} color="#1A237E" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.selectorButton, buttonStyle]}
        onPress={() => bottomSheetRef?.current?.open()}
      >
        <Icon name="language" size={26} color="#1A237E" style={styles.icon} />
        <View style={styles.buttonContent}>
          <Text style={[styles.buttonLabel, buttonTextStyle]}>{t('DEMO.LANGUAGE')}</Text>
          <Text style={styles.currentLanguage}>{currentLanguage.nativeLabel}</Text>
        </View>
        <Entypo name="chevron-right" size={26} color={'#1A237E'} />
      </TouchableOpacity>

      <BottomSheet bottomSheetRef={bottomSheetRef} headerText={t('DEMO.LANGUAGE')} adjustToContentHeight>
        <View style={styles.modalOverlay}>
          <FlatList
            data={LANGUAGES}
            renderItem={renderLanguageItem}
            keyExtractor={(item) => item.code}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </BottomSheet>
    </>
  );
};

const styles = StyleSheet.create({
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: colors.BACKGROUND,
  },
  icon: {
    marginRight: 12,
    marginLeft: 15 
  },
  buttonContent: {
    flex: 1,
  },
  buttonLabel: {
    fontSize: GD_FONT_SIZE.normal,
    fontFamily: FONT_FAMILY.bold,
    color: '#333',
  },
  currentLanguage: {
    fontSize: GD_FONT_SIZE.small,
    fontFamily: FONT_FAMILY.semibold,
    color: '#666',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
    maxHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: GD_FONT_SIZE.large,
    fontFamily: FONT_FAMILY.bold,
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  languageItem: {
    backgroundColor: colors.WHITE,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16
  },
  selectedLanguageItem: {
    backgroundColor: colors.BACKGROUND,
  },
  languageInfo: {
    flex: 1,
  },
  languageLabel: {
    fontSize: GD_FONT_SIZE.medium,
    fontFamily: FONT_FAMILY.regular,
    color: '#333',
  },
  nativeLabel: {
    fontSize: GD_FONT_SIZE.small,
    fontFamily: FONT_FAMILY.regular,
    color: '#666',
    marginTop: 2,
  },
  selectedText: {
    fontFamily: FONT_FAMILY.bold,
    color: '#1A237E',
  },
});

export default LanguageSelector;