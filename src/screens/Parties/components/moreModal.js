import BottomSheet from '@/components/BottomSheet';
import { FONT_FAMILY, GD_FONT_SIZE } from '@/utils/constants';
import React from 'react';
import {
  StyleSheet,
  Text,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const Screen_height = Dimensions.get('window').height;
const Screen_width = Dimensions.get('window').width;

function MoreModal ({ 
  bottomSheetRef,
  setBottomSheetVisible, 
  onWhatsApp, 
  onCall 
}) {
  return (
    <BottomSheet
      bottomSheetRef={bottomSheetRef}
      headerText='Contact'
      headerTextColor='#864DD3'
    >
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          onWhatsApp();
          setBottomSheetVisible(bottomSheetRef, false);
        }}>
        <FontAwesome name="whatsapp" size={22} color={'#25D366'} />
        <Text style={styles.buttonText}>Chat on WhatsApp</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          onCall();
          setBottomSheetVisible(bottomSheetRef, false);
        }}>
        <FontAwesome name="phone" size={22} color={'#4285F4'} />
        <Text style={styles.buttonText}>Phone Call </Text>
      </TouchableOpacity>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  button: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20,
    paddingVertical: 10
  },
  buttonText: { 
    fontFamily: FONT_FAMILY.regular, 
    fontSize: GD_FONT_SIZE.medium,
    marginLeft: 10
  },
});

export default MoreModal;
