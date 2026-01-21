import React from 'react';
import {
  StyleSheet,
  Text,
  Dimensions,
  View,
  TouchableOpacity
} from 'react-native';
import { useTranslation } from 'react-i18next';
import BottomSheet from '@/components/BottomSheet';
import { GD_FONT_SIZE } from '@/utils/constants';

const Screen_height = Dimensions.get('window').height;
const Screen_width = Dimensions.get('window').width;

function SortModal ({ bottomSheetRef, setBottomSheetVisible, filter, activeFilter }) {
  const { t } = useTranslation();
  return (
    <BottomSheet
      bottomSheetRef={bottomSheetRef}
      headerText={t('sortModal.sortBy')}
      headerTextColor='#864DD3'
    >
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => {
            filter('AZ');
            setBottomSheetVisible(bottomSheetRef, false);
          }}>
          <Text style={styles.buttonText}>{t('sortModal.nameAToZ')}</Text>
        </TouchableOpacity>
        {activeFilter == 'AZ' && (
          <View style={styles.dot} />
        )}
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => {
            filter('ZA');
            setBottomSheetVisible(bottomSheetRef, false);
          }}>
          <Text style={styles.buttonText}>{t('sortModal.nameZToA')}</Text>
        </TouchableOpacity>
        {activeFilter == 'ZA' && (
          <View style={styles.dot} />
        )}
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => {
            filter('10');
            setBottomSheetVisible(bottomSheetRef, false);
          }}>
          <Text style={styles.buttonText}>{t('sortModal.amountLowToHigh')}</Text>
        </TouchableOpacity>
        {activeFilter == '10' && (
          <View style={styles.dot} />
        )}
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => {
            filter('01');
            setBottomSheetVisible(bottomSheetRef, false);
          }}>
          <Text style={styles.buttonText}>{t('sortModal.amountHighToLow')}</Text>
        </TouchableOpacity>
        {activeFilter == '01' && (
          <View style={styles.dot} />
        )}
      </View>
      {/* <TouchableOpacity style={{marginTop: 20, alignSelf: 'center'}} onPress={setModalVisible}>
        <Text style={{fontSize: 18}}>Close</Text>
      </TouchableOpacity> */}

      {/* <TouchableHighlight
        style={{...styles.openButton, backgroundColor: '#5db075'}}
        onPress={() => {
          setBottomSheetVisible(bottomSheetRef, false);
        }}>
        <Text style={styles.textStyle}>Done</Text>
      </TouchableHighlight> */}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  buttonContainer: { 
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'space-between', 
    paddingHorizontal: 20,
    paddingVertical: 10
  },
  buttonText: { 
    fontSize: GD_FONT_SIZE.medium,  
    fontFamily: 'AvenirLTStd-Book' 
  },
  dot: { 
    height: 10, 
    width: 10, 
    borderRadius: 5, 
    backgroundColor: '#520EAD', 
  }
});

export default SortModal;
