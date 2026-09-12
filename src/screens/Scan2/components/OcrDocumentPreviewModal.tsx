import React, { memo } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import DocumentPreviewViewer from '@/screens/Scan2/components/DocumentPreviewViewer';
import { normalizePreviewUri } from '@/screens/Scan2/documentPreview.utils';

type Props = {
  visible: boolean;
  encodedData?: string | null;
  mimeType?: string | null;
  fileName?: string | null;
  onClose: () => void;
};

const OcrDocumentPreviewModal: React.FC<Props> = ({
  visible,
  encodedData,
  mimeType,
  fileName,
  onClose,
}) => {
  const { t } = useTranslation();
  const uri = normalizePreviewUri(encodedData, mimeType, fileName);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {t('scan2.documentPreview', { defaultValue: 'Document preview' })}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <MaterialCommunityIcons name="close" size={22} color="#1C1C1C" />
            </TouchableOpacity>
          </View>
          <View style={styles.viewerWrap}>
            {uri ? (
              <DocumentPreviewViewer
                uri={encodedData}
                mimeType={mimeType}
                fileName={fileName}
                style={styles.viewer}
              />
            ) : (
              <Text style={styles.emptyText}>
                {t('scan2.previewUnavailable', { defaultValue: 'Preview not available' })}
              </Text>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default memo(OcrDocumentPreviewModal);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    maxHeight: '85%',
    minHeight: 360,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1C',
  },
  viewerWrap: {
    minHeight: 320,
    height: 480,
    backgroundColor: '#F3F4F6',
  },
  viewer: {
    flex: 1,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
    padding: 24,
  },
});
