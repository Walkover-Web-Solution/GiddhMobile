import colors from '@/utils/colors';
import React from 'react';
import {
  Modal,
  StyleSheet,
  Dimensions,
  View,Text
} from 'react-native';
import LoaderKit  from 'react-native-loader-kit';
import { useTranslation } from 'react-i18next';

const Screen_height = Dimensions.get('window').height;
const Screen_width = Dimensions.get('window').width;

function ShareModal ({ modalVisible }) {
  const { t } = useTranslation();
  return (
    <Modal animationType="none" transparent={true} visible={modalVisible} statusBarTranslucent>
      <View style={styles.container}>
        <View style={styles.centeredView}>
        <LoaderKit
            style={{ width: 45, height: 45 }}
            name={'LineScale'}
            color={colors.PRIMARY_NORMAL}
        />
        <Text style={{marginTop: 20, fontFamily: 'AvenirLTStd-Black'}}>{t('partiesTransaction.preparingPDF')}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  centeredView: {
    flexDirection: 'column',
    width: Screen_width * 0.7,
    paddingVertical: 20,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    alignSelf: 'center',
    borderRadius: 15,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default ShareModal;
