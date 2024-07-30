import { FONT_FAMILY, GD_FONT_SIZE } from '@/utils/constants';
import BottomSheet from '@/components/BottomSheet';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
  StyleSheet,
  Text,
  Dimensions,
  View,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Fontisto from 'react-native-vector-icons/Fontisto';

const Screen_height = Dimensions.get('window').height;
const Screen_width = Dimensions.get('window').width;

type Props = {
  bottomSheetRef: React.Ref<BottomSheet>;
  setBottomSheetVisible: (modalRef: React.Ref<BottomSheet>, visible: boolean) => void;
  filter: (filterType: string) => void;
  loader: () => void;
}

function VoucherModal ({
  bottomSheetRef,
  setBottomSheetVisible,
  filter,
  loader
  }: Props) {
  const [sales, setsales] = React.useState(false);
  const [purchase, setPurchase] = React.useState(false);
  const [debitNote, setDebitNote] = React.useState(false);
  const [creditNote, setCreditNote] = React.useState(false);
  const [receipt, setReceipt] = React.useState(false);
  const [payment, setPayment] = React.useState(false);
  const [voucher, setVoucher] = React.useState(false);
  const [contra, setContra] = React.useState(false);

  return (
    <BottomSheet
      bottomSheetRef={bottomSheetRef}
      headerText='Select Filters'
      headerTextColor='#864DD3'
    >
      <ScrollView>
          <TouchableOpacity
            style={styles.button}
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
            <View style={{ height: 20, width: 20, borderRadius: 2 }}>
              {sales
                ? (
                <AntDesign name="checksquare" size={20} color={'#864DD3'} />
                  )
                : (
                <Fontisto name="checkbox-passive" size={20} color={'#CCCCCC'} />
                  )}
            </View>

            <Text style={{ fontSize: GD_FONT_SIZE.medium, marginLeft: 10,fontFamily:'AvenirLTStd-Book'}}>Sales</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
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
            <View style={{ height: 20, width: 20, borderRadius: 2 }}>
              {purchase
                ? (
                <AntDesign name="checksquare" size={20} color={'#864DD3'} />
                  )
                : (
                <Fontisto name="checkbox-passive" size={20} color={'#CCCCCC'} />
                  )}
            </View>

            <Text style={{ fontSize: GD_FONT_SIZE.medium, marginLeft: 10,fontFamily: 'AvenirLTStd-Book'}}>Purchase</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
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
            <View style={{ height: 20, width: 20, borderRadius: 2 }}>
              {creditNote
                ? (
                <AntDesign name="checksquare" size={20} color={'#864DD3'} />
                  )
                : (
                <Fontisto name="checkbox-passive" size={20} color={'#CCCCCC'} />
                  )}
            </View>

            <Text style={{ fontSize: GD_FONT_SIZE.medium, marginLeft: 10,fontFamily: 'AvenirLTStd-Book' }}>Credit Note</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
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
            <View style={{ height: 20, width: 20, borderRadius: 2 }}>
              {debitNote
                ? (
                <AntDesign name="checksquare" size={20} color={'#864DD3'} />
                  )
                : (
                <Fontisto name="checkbox-passive" size={20} color={'#CCCCCC'} />
                  )}
            </View>

            <Text style={{ fontSize: GD_FONT_SIZE.medium, marginLeft: 10,fontFamily:'AvenirLTStd-Book' }}>Debit Note</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
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
            <View style={{ height: 20, width: 20, borderRadius: 2 }}>
              {receipt
                ? (
                <AntDesign name="checksquare" size={20} color={'#864DD3'} />
                  )
                : (
                <Fontisto name="checkbox-passive" size={20} color={'#CCCCCC'} />
                  )}
            </View>

            <Text style={{ fontSize: GD_FONT_SIZE.medium, marginLeft: 10,fontFamily: 'AvenirLTStd-Book' }}>Receipt</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
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
            <View style={{ height: 20, width: 20, borderRadius: 2 }}>
              {payment
                ? (
                <AntDesign name="checksquare" size={20} color={'#864DD3'} />
                  )
                : (
                <Fontisto name="checkbox-passive" size={20} color={'#CCCCCC'} />
                  )}
            </View>

            <Text style={{ fontSize: GD_FONT_SIZE.medium, marginLeft: 10,fontFamily: 'AvenirLTStd-Book' }}>Payment</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
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
            <View style={{ height: 20, width: 20, borderRadius: 2 }}>
              {voucher
                ? (
                <AntDesign name="checksquare" size={20} color={'#864DD3'} />
                  )
                : (
                <Fontisto name="checkbox-passive" size={20} color={'#CCCCCC'} />
                  )}
            </View>

            <Text style={{ fontSize: GD_FONT_SIZE.medium, marginLeft: 10,fontFamily: 'AvenirLTStd-Book' }}>Journal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
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
            <View style={{ height: 20, width: 20, borderRadius: 2 }}>
              {contra
                ? (
                <AntDesign name="checksquare" size={20} color={'#864DD3'} />
                  )
                : (
                <Fontisto name="checkbox-passive" size={20} color={'#CCCCCC'} />
                  )}
            </View>

            <Text style={{ fontSize: GD_FONT_SIZE.medium, marginLeft: 10,fontFamily: 'AvenirLTStd-Book' }}>Contra</Text>
          </TouchableOpacity>

          <View style={[{ flexDirection: 'row', justifyContent: 'space-around' }, styles.divider]} >
            <TouchableOpacity
              style={[styles.button, {paddingVertical: 20}]}
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
              <View style={{ height: 20, width: 20, borderRadius: 2 }}>
                <AntDesign name="close" size={20} color={'#FF1717'} />
              </View>

              <Text style={{ fontSize: GD_FONT_SIZE.medium, marginLeft: 5, fontFamily: 'AvenirLTStd-Book' }}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, {paddingVertical: 20}]}
              onPress={() => setBottomSheetVisible(bottomSheetRef, false)}>
              <View style={{ height: 20, width: 20, borderRadius: 2 }}>
                <AntDesign name="check" size={20} color={'#25D366'} />
              </View>

              <Text style={{ fontSize: GD_FONT_SIZE.medium, marginLeft: 5, fontFamily: 'AvenirLTStd-Book' }}>Done</Text>
            </TouchableOpacity>
        </View>
        </ScrollView>
      </BottomSheet>
  );
}

const styles = StyleSheet.create({
  divider: {
    borderTopWidth: 1, 
    borderTopColor: '#D9D9D9', 
    marginHorizontal: 10
  },
  button: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20,
    paddingVertical: 10
  }
});

export default VoucherModal;
