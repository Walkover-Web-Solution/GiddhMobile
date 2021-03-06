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

function VoucherModal({modalVisible, setModalVisible, filter, loader}) {
  const [sales, setsales] = React.useState(false);
  const [purchase, setPurchase] = React.useState(false);
  const [debitNote, setDebitNote] = React.useState(false);
  const [creditNote, setCreditNote] = React.useState(false);
  const [receipt, setReceipt] = React.useState(false);
  const [payment, setPayment] = React.useState(false);
  const [voucher, setVoucher] = React.useState(false);
  const [contra, setContra] = React.useState(false);

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
            style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 10}}
            onPress={() => {
              if (!sales) {
                setsales(true);
                loader();
                filter('sales');
              } else {
                setsales(false);
                loader();
                filter('Rsales');
              }
            }}>
            <View style={{height: 20, width: 20, borderRadius: 2}}>
              {sales ? (
                <AntDesign name="checksquare" size={20} color={'#864DD3'} />
              ) : (
                <Fontisto name="checkbox-passive" size={20} color={'#CCCCCC'} />
              )}
            </View>

            <Text style={{fontSize: 18, marginLeft: 10}}>Sales</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 10}}
            onPress={() => {
              if (!purchase) {
                setPurchase(true);
                loader();
                filter('purchase');
              } else {
                setPurchase(false);
                loader();
                filter('Rpurchase');
              }
            }}>
            <View style={{height: 20, width: 20, borderRadius: 2}}>
              {purchase ? (
                <AntDesign name="checksquare" size={20} color={'#864DD3'} />
              ) : (
                <Fontisto name="checkbox-passive" size={20} color={'#CCCCCC'} />
              )}
            </View>

            <Text style={{fontSize: 18, marginLeft: 10}}>Purchase</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 10}}
            onPress={() => {
              if (!creditNote) {
                setCreditNote(true);
                loader();
                filter('creditnote');
              } else {
                setCreditNote(false);
                loader();
                filter('Rcreditnote');
              }
            }}>
            <View style={{height: 20, width: 20, borderRadius: 2}}>
              {creditNote ? (
                <AntDesign name="checksquare" size={20} color={'#864DD3'} />
              ) : (
                <Fontisto name="checkbox-passive" size={20} color={'#CCCCCC'} />
              )}
            </View>

            <Text style={{fontSize: 18, marginLeft: 10}}>Credit Note</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 10}}
            onPress={() => {
              if (!debitNote) {
                setDebitNote(true);
                loader();
                filter('debitnote');
              } else {
                setDebitNote(false);
                loader();
                filter('Rdebitnote');
              }
            }}>
            <View style={{height: 20, width: 20, borderRadius: 2}}>
              {debitNote ? (
                <AntDesign name="checksquare" size={20} color={'#864DD3'} />
              ) : (
                <Fontisto name="checkbox-passive" size={20} color={'#CCCCCC'} />
              )}
            </View>

            <Text style={{fontSize: 18, marginLeft: 10}}>Debit Note</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 10}}
            onPress={() => {
              if (!receipt) {
                setReceipt(true);
                loader();
                filter('receipt');
              } else {
                setReceipt(false);
                loader();
                filter('Rreceipt');
              }
            }}>
            <View style={{height: 20, width: 20, borderRadius: 2}}>
              {receipt ? (
                <AntDesign name="checksquare" size={20} color={'#864DD3'} />
              ) : (
                <Fontisto name="checkbox-passive" size={20} color={'#CCCCCC'} />
              )}
            </View>

            <Text style={{fontSize: 18, marginLeft: 10}}>Receipt</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 10}}
            onPress={() => {
              if (!payment) {
                setPayment(true);
                loader();
                filter('payment');
              } else {
                setPayment(false);
                loader();
                filter('Rpayment');
              }
            }}>
            <View style={{height: 20, width: 20, borderRadius: 2}}>
              {payment ? (
                <AntDesign name="checksquare" size={20} color={'#864DD3'} />
              ) : (
                <Fontisto name="checkbox-passive" size={20} color={'#CCCCCC'} />
              )}
            </View>

            <Text style={{fontSize: 18, marginLeft: 10}}>Payment</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 10}}
            onPress={() => {
              if (!voucher) {
                setVoucher(true);
                loader();
                filter('journal');
              } else {
                setVoucher(false);
                loader();
                filter('Rjournal');
              }
            }}>
            <View style={{height: 20, width: 20, borderRadius: 2}}>
              {voucher ? (
                <AntDesign name="checksquare" size={20} color={'#864DD3'} />
              ) : (
                <Fontisto name="checkbox-passive" size={20} color={'#CCCCCC'} />
              )}
            </View>

            <Text style={{fontSize: 18, marginLeft: 10}}>Journal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 10}}
            onPress={() => {
              if (!contra) {
                setContra(true);
                loader();
                filter('contra');
              } else {
                setContra(false);
                loader();
                filter('Rcontra');
              }
            }}>
            <View style={{height: 20, width: 20, borderRadius: 2}}>
              {contra ? (
                <AntDesign name="checksquare" size={20} color={'#864DD3'} />
              ) : (
                <Fontisto name="checkbox-passive" size={20} color={'#CCCCCC'} />
              )}
            </View>

            <Text style={{fontSize: 18, marginLeft: 10}}>Contra</Text>
          </TouchableOpacity>

          <View style={{height: 2, width: '100%', alignSelf: 'center', backgroundColor: '#D9D9D9', marginTop: 15}} />
          <TouchableOpacity
            style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 10}}
            onPress={() => {
              setsales(false);
              setPurchase(false);
              setCreditNote(false);
              setDebitNote(false);
              setReceipt(false);
              setPayment(false);
              setVoucher(false);
              setContra(false);
              loader();
              filter('clearall');
            }}>
            <View style={{height: 20, width: 20, borderRadius: 2}}>
              <AntDesign name="close" size={20} color={'#FF1717'} />
            </View>

            <Text style={{fontSize: 18, marginLeft: 10}}>Clear All</Text>
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
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
});

export default VoucherModal;
