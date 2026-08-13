import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import BottomSheet from '@/components/BottomSheet';
import ModalPressable, { ACTION_SHEET_MODALIZE_PROPS } from '@/components/ModalPressable';
import useCustomTheme, { ThemeProps } from '@/utils/theme';
import SalesInvoice from '@/assets/images/icons/options/SalesInvoice.svg';
import CreditNote from '@/assets/images/icons/options/CreditNote.svg';
import PurchaseBill from '@/assets/images/icons/options/PurchaseBill.svg';
import DebitNote from '@/assets/images/icons/options/DebitNote.svg';
import Payment from '@/assets/images/icons/options/Payment.svg';
import Receipt from '@/assets/images/icons/options/Receipt.svg';

export type DocumentActionKey =
  | 'invoice'
  | 'creditNote'
  | 'receipt'
  | 'bill'
  | 'debitNote'
  | 'payment';

export type DocumentActionOption = {
  key: DocumentActionKey;
  labelKey: string;
  defaultValue: string;
  color: string;
  navigateTo: string;
  screen?: string;
  voucherType: string;
};

type Props = {
  bottomSheetRef: React.RefObject<any>;
  options: DocumentActionOption[];
  onSelect: (option: DocumentActionOption) => void;
};

const ACTION_ICONS: Record<DocumentActionKey, React.FC<{ color?: string }>> = {
  invoice: SalesInvoice,
  creditNote: CreditNote,
  receipt: Receipt,
  bill: PurchaseBill,
  debitNote: DebitNote,
  payment: Payment,
};

const DocumentActionSheet: React.FC<Props> = ({ bottomSheetRef, options, onSelect }) => {
  const { t } = useTranslation();
  const { styles } = useCustomTheme(getStyles);

  return (
    <BottomSheet
      bottomSheetRef={bottomSheetRef}
      headerText={t('scan2.createVoucherTitle', { defaultValue: 'Create voucher' })}
      headerTextColor="#265BB5"
      {...ACTION_SHEET_MODALIZE_PROPS}
      customRenderer={
        <View style={styles.container}>
          {options.map((option) => {
            const IconComponent = ACTION_ICONS[option.key];
            return (
              <ModalPressable
                key={option.key}
                style={({ pressed }: { pressed: boolean }) => [styles.option, pressed && styles.optionPressed]}
                onPress={() => onSelect(option)}
              >
                <View style={[styles.iconWrap, { backgroundColor: `${option.color}1A` }]}>
                  <IconComponent color={option.color} />
                </View>
                <Text style={styles.optionText}>
                  {t(option.labelKey, { defaultValue: option.defaultValue })}
                </Text>
              </ModalPressable>
            );
          })}
        </View>
      }
    />
  );
};

export default memo(DocumentActionSheet);

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
