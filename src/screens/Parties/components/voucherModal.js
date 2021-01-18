import React from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableHighlight,
  Dimensions,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Fontisto from 'react-native-vector-icons/Fontisto';

const Screen_height = Dimensions.get('window').height;
const Screen_width = Dimensions.get('window').width;

function VoucherModal({modalVisible, setModalVisible, filter, activeFilter}) {
  const [sales, setsales] = React.useState(false);
  const [purchase, setPurchase] = React.useState(false);
  const [debitNote, setDebitNote] = React.useState(false);
  const [creditNote, setCreditNote] = React.useState(false);

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        Alert.alert('Modal has been closed.');
      }}>
      <TouchableOpacity style={styles.container} onPress={() => setModalVisible()}>
        <View style={styles.centeredView}>
          <TouchableOpacity
            style={{flexDirection: 'row', alignItems: 'center'}}
            onPress={() => {
              if (!sales) {
                filter('sales');
                setsales(true);
              } else {
                filter('Rsales');
                setsales(false);
              }
            }}>
            <View style={{height: 20, width: 20, borderRadius: 2}}>
              {sales ? (
                <AntDesign name="checksquare" size={20} color={'#808080'} />
              ) : (
                <Fontisto name="checkbox-passive" size={20} color={'#808080'} />
              )}
            </View>

            <Text style={{fontSize: 18, marginLeft: 10}}>Sales</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}}
            onPress={() => {
              if (!purchase) {
                filter('purchase');
                setPurchase(true);
              } else {
                filter('Rpurchase');
                setPurchase(false);
              }
            }}>
            <View style={{height: 20, width: 20, borderRadius: 2}}>
              {purchase ? (
                <AntDesign name="checksquare" size={20} color={'#808080'} />
              ) : (
                <Fontisto name="checkbox-passive" size={20} color={'#808080'} />
              )}
            </View>

            <Text style={{fontSize: 18, marginLeft: 10}}>Purchase</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}}
            onPress={() => {
              if (!creditNote) {
                filter('creditnote');
                setCreditNote(true);
              } else {
                filter('Rcreditnote');
                setCreditNote(false);
              }
            }}>
            <View style={{height: 20, width: 20, borderRadius: 2}}>
              {creditNote ? (
                <AntDesign name="checksquare" size={20} color={'#808080'} />
              ) : (
                <Fontisto name="checkbox-passive" size={20} color={'#808080'} />
              )}
            </View>

            <Text style={{fontSize: 18, marginLeft: 10}}>Credit Note</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}}
            onPress={() => {
              if (!debitNote) {
                filter('debitnote');
                setDebitNote(true);
              } else {
                filter('Rdebitnote');
                setDebitNote(false);
              }
            }}>
            <View style={{height: 20, width: 20, borderRadius: 2}}>
              {debitNote ? (
                <AntDesign name="checksquare" size={20} color={'#808080'} />
              ) : (
                <Fontisto name="checkbox-passive" size={20} color={'#808080'} />
              )}
            </View>

            <Text style={{fontSize: 18, marginLeft: 10}}>Debit Note</Text>
          </TouchableOpacity>

          {/* <TouchableOpacity style={{marginTop: 20, alignSelf: 'center'}} onPress={setModalVisible}>
            <Text style={{fontSize: 18}}>Close</Text>
          </TouchableOpacity> */}

          {/* <TouchableHighlight
            style={{...styles.openButton, backgroundColor: '#5db075'}}
            onPress={() => {
              setModalVisible();
            }}>
            <Text style={styles.textStyle}>Done</Text>
          </TouchableHighlight> */}
        </View>
      </TouchableOpacity>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    // justifyContent: 'center',
    // alignItems: 'center',
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
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    // alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 15,
    marginTop: Screen_height * 0.15,
    padding: 15,
  },
});

export default VoucherModal;
