import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import useCustomTheme, { ThemeProps } from '@/utils/theme';
import { capitalizeName } from '@/utils/helper';
import { translateConvertedStatus, translateFileStatus } from '../scan2Status.utils';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DateChipSeparator from '@/screens/AllVoucherScreen/components/DateChipSeparator';

type Props = {
  showDate: boolean;
  fileName: string;
  date: string;
  status: string;
  uploadedBy: string;
  convertedStatus?: string;
  onPress?: () => void;
};

const statusColor = (status: string) => {
  const value = (status || '').toUpperCase();
  if (value.includes('SUCCESS') || value.includes('COMPLETED') || value.includes('CONVERTED')) {
    return '#E6F4EA';
  }
  if (value.includes('FAIL') || value.includes('ERROR') || value.includes('CANCEL')) {
    return '#FCE8E6';
  }
  if (value.includes('IN_PROGRESS') || value.includes('PENDING')) {
    return '#FEF7E0';
  }
  return '#6C63FF';
};

const statusTextColor = (status: string) => {
  const value = (status || '').toUpperCase();
  if (value.includes('SUCCESS') || value.includes('COMPLETED') || value.includes('CONVERTED')) {
    return '#137333';
  }
  if (value.includes('FAIL') || value.includes('ERROR') || value.includes('CANCEL')) {
    return '#C5221F';
  }
  if (value.includes('IN_PROGRESS') || value.includes('PENDING')) {
    return '#B06000';
  }
  return '#6C63FF';
};

const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();

  switch (ext) {
    case 'pdf':
      return { name: 'file-pdf-box', color: '#E53935' };
    case 'zip':
      return { name: 'folder-zip-outline', color: '#FB8C00' };
    case 'png':
    case 'jpg':
    case 'jpeg':
      return { name: 'file-image-outline', color: '#4CAF50' };
    default:
      return { name: 'file-document-outline', color: '#757575' };
  }
};

const DocumentCard: React.FC<Props> = ({
  fileName,
  date,
  status,
  uploadedBy,
  convertedStatus,
  showDate,
  onPress,
}) => {
  const { t } = useTranslation();
  const { styles } = useCustomTheme(getStyles);

  return (
    <>
      {showDate && <DateChipSeparator date={date} showDivider={true} />}
      <TouchableOpacity activeOpacity={0.7} style={styles.button} onPress={onPress}>
        <View style={styles.row}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
            <MaterialCommunityIcons
              name={getFileIcon(fileName).name}
              size={24}
              color={getFileIcon(fileName).color}
            />
            <View style={styles.nameContainer}>
              <Text style={styles.name} numberOfLines={1}>
                {fileName || t('scan2.unnamed')}
              </Text>
            </View>
          </View>
          {!!status && (
            
            <View style={[styles.chip, { backgroundColor: statusColor(status) }]}>
              <Text style={[styles.chipText, { color: statusTextColor(status) }]}>
                {translateFileStatus(t, status)}
              </Text>
            </View>
          )}
        </View>
        <View style={{ marginTop: 4 }}>
          {!!uploadedBy && (
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.metaText}>{t('scan2.uploadedBy')} : </Text>

              <Text style={styles.metaValue}>{capitalizeName(uploadedBy)}</Text>
            </View>
          )}
        </View>

        {!!convertedStatus && (
          <View style={{ flexDirection: 'row' }}>
            <Text style={styles.metaText}>{t('scan2.convertedStatus')} : </Text>

            <Text style={[styles.convertedText, { color: statusTextColor(convertedStatus) }]}>
              {translateConvertedStatus(t, convertedStatus)}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </>
  );
};

export default memo(DocumentCard);

const getStyles = (theme: ThemeProps) =>
  StyleSheet.create({
    button: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 0.5,
      borderBottomColor: theme.colors.solids.grey.light,
      borderRadius: 10,
      elevation: 2,
      marginHorizontal: 10,
      marginVertical: 4,
      backgroundColor: theme.colors.solids.white,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 4
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    nameContainer: {
      width: '65%',
      marginLeft: 8,
    },
    name: {
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.large.size,
      color: theme.colors.text,
    },

    metaText: {
      marginTop: 5,
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.small.size,
      color: theme.colors.text,
    },
    chip: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 5,
    },
    chipText: {
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.small.size,
    },
    metaValue: {
      marginTop: 5,
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.small.size,
      color: theme.colors.text,
    },
    convertedText: {
      marginTop: 5,
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.small.size,
    },
  });
