import { FONT_FAMILY, GD_FONT_SIZE } from '@/utils/constants';
import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  Dimensions,
  View,
  TouchableOpacity,
  Platform
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomSheet from '@/components/BottomSheet';
import { useTranslation } from 'react-i18next';

const Screen_height = Dimensions.get('window').height;
const Screen_width = Dimensions.get('window').width;

function PDFModal ({
  bottomSheetRef,
  setBottomSheetVisible,
  onExport,
  onShare,
  downloadModal,
  onWhatsAppShare,
  phoneNo,
  shareModal
}) {
  const { t } = useTranslation();
  return (
    <BottomSheet
      bottomSheetRef={bottomSheetRef}
      headerText={t('common.share')}
      headerTextColor='#864DD3'
    >
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          Platform.OS!="ios"?downloadModal(true):null;
          onExport();
          setBottomSheetVisible(bottomSheetRef, false);
        }}>
        <AntDesign name="download" size={22} color={'black'} />
        <Text style={styles.text}>{t('common.export')}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          onShare();
          Platform.OS!="ios"?shareModal(true):null;
          setBottomSheetVisible(bottomSheetRef, false);
        }}>
        <Entypo name="share" size={22} color={'black'} />
        <Text style={styles.text}>{t('common.share')}</Text>
      </TouchableOpacity>
      {phoneNo && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            onWhatsAppShare();
            setBottomSheetVisible(bottomSheetRef, false);
          }}>
          <MaterialCommunityIcons name="whatsapp" size={22} color={'#000000'} />
          <Text style={styles.text}>{t('partiesTransaction.shareOnWhatsApp')}</Text>
        </TouchableOpacity>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  text: { 
    marginLeft: 10,
    fontSize: GD_FONT_SIZE.medium, 
    fontFamily: FONT_FAMILY.regular 
  },
  button: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20,
    paddingVertical: 10
  }
});

export default PDFModal;
