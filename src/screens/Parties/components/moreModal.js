import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  Dimensions,
  View,
  TouchableOpacity
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const Screen_height = Dimensions.get('window').height;
const Screen_width = Dimensions.get('window').width;

function MoreModal ({ modalVisible, setModalVisible, onWhatsApp, onCall }) {
  return (
    <Modal animationType="none" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible()}>
      <TouchableOpacity style={styles.container} onPress={() => setModalVisible()}>
        <View style={styles.centeredView}>
          {/* <Text style={{fontSize: 20}}>Sort</Text> */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <TouchableOpacity
              style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
              onPress={() => {
                onWhatsApp();
                setModalVisible();
              }}>
              <FontAwesome name="whatsapp" size={22} color={'#25D366'} />
              <Text style={{ fontSize: 18, marginLeft: 15 }}>Chat on WhatsApp</Text>
            </TouchableOpacity>
            {/* {activeFilter == 'AZ' && (
              <View style={{height: 10, width: 10, borderRadius: 5, backgroundColor: '#520EAD', marginRight: 10}} />
            )} */}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 30 }}>
            <TouchableOpacity
              style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
              onPress={() => {
                onCall();

                setModalVisible();
              }}>
              <FontAwesome name="phone" size={22} color={'#4285F4'} />
              <Text style={{ fontSize: 18, marginLeft: 15 }}>Phone Call </Text>
            </TouchableOpacity>
            {/* {activeFilter == 'ZA' && (
              <View style={{height: 10, width: 10, borderRadius: 5, backgroundColor: '#520EAD', marginRight: 10}} />
            )} */}
          </View>

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
    backgroundColor: 'rgba(0,0,0,0.5)'
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
      height: 1
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    // alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 15,
    marginTop: Screen_height * 0.15,
    padding: 15
  }
});

export default MoreModal;