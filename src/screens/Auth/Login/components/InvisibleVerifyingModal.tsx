import React from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import colors from '@/utils/colors';
import { FONT_FAMILY, GD_FONT_SIZE } from '@/utils/constants';

type InvisibleVerifyingModalProps = {
  visible: boolean;
  phoneLabel?: string;
  onCancel: () => void;
};

const InvisibleVerifyingModal: React.FC<InvisibleVerifyingModalProps> = ({
  visible,
  phoneLabel,
  onCancel
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.root}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color={colors.PRIMARY_BASIC} />
          <Text style={styles.title}>Verifying</Text>
          <Text style={styles.subtitle}>
            {phoneLabel
              ? `Verifying ${phoneLabel} securely…`
              : 'Verifying your number securely…'}
          </Text>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={onCancel}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelLabel}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.WHITE,
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center'
  },
  title: {
    marginTop: 18,
    fontSize: GD_FONT_SIZE.xlarge,
    fontFamily: FONT_FAMILY.bold,
    color: colors.TEXT_HEADING
  },
  subtitle: {
    marginTop: 8,
    fontSize: GD_FONT_SIZE.normal,
    fontFamily: FONT_FAMILY.regular,
    color: colors.LABEL_COLOR,
    textAlign: 'center',
    lineHeight: 20
  },
  cancelBtn: {
    marginTop: 22,
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.BORDER_COLOR,
    backgroundColor: colors.BACKGROUND
  },
  cancelLabel: {
    fontSize: GD_FONT_SIZE.medium,
    fontFamily: FONT_FAMILY.regular,
    color: colors.TEXT_NORMAL
  }
});

export default InvisibleVerifyingModal;
