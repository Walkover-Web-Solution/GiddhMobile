import BottomSheet from '@/components/BottomSheet';
import { FONT_FAMILY, GD_FONT_SIZE } from '@/utils/constants';
import React from 'react';
import {
  StyleSheet,
  Text,
  Dimensions,
  TouchableOpacity,
  View
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';

const Screen_height = Dimensions.get('window').height;
const Screen_width = Dimensions.get('window').width;

function MoreModal ({ 
  bottomSheetRef,
  setBottomSheetVisible, 
  onWhatsApp, 
  onCall,
  onMail,
  isMailAvailable,
  isPhoneAvailable,
  copyToClipboard
}) {
  return (
    <BottomSheet
      bottomSheetRef={bottomSheetRef}
      headerText='Contact'
      headerTextColor='#864DD3'
    >
      {isPhoneAvailable && <TouchableOpacity
        style={[styles.btnRow, {paddingHorizontal: 20}]}
        onPress={() => {
          onWhatsApp();
          setBottomSheetVisible(bottomSheetRef, false);
        }}>
        <FontAwesome name="whatsapp" size={22} color={'#25D366'} />
        <Text style={styles.buttonText}>Chat on WhatsApp</Text>
      </TouchableOpacity>}
      {isPhoneAvailable && <View style={[styles.button, { justifyContent: 'space-between' }]}>
        <TouchableOpacity
          style={styles.btnRow}
          onPress={() => {
            onCall();
            setBottomSheetVisible(bottomSheetRef, false);
          }}>
          <FontAwesome name="phone" size={22} color={'#4285F4'} />
          <Text style={styles.buttonText}>Phone Call </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          style={{padding:10}}
          onPress={() => copyToClipboard('mobileNo')}>
          <Feather name="copy" size={16} color={'#000'} />
        </TouchableOpacity>
      </View>}
      {isMailAvailable && 
      <View style={[styles.button, { justifyContent: 'space-between' }]}>
        <TouchableOpacity
          style={styles.btnRow}
          onPress={() => {
            onMail();
            setBottomSheetVisible(bottomSheetRef, false);
          }}>
          <Feather name="mail" size={21} color={'#C41E3A'} />
          <Text style={styles.buttonText}>Mail </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          style={{padding:10}}
          onPress={() => copyToClipboard('email')}>
          <Feather name="copy" size={16} color={'#000'} />
        </TouchableOpacity>
      </View>}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  button: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20,
    flex: 1
  },
  buttonText: { 
    fontFamily: FONT_FAMILY.regular, 
    fontSize: GD_FONT_SIZE.medium,
    marginLeft: 10
  },
  btnRow: {
    flex:1,
    flexDirection: 'row',
    paddingVertical: 10,
    alignItems: 'center'
  }
});

export default MoreModal;
