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

const Screen_height = Dimensions.get('window').height;
const Screen_width = Dimensions.get('window').width;

function PDFModal ({
  modalVisible,
  setModalVisible,
  onExport,
  onShare,
  downloadModal,
  onWhatsAppShare,
  phoneNo,
  shareModal
}) {
  return (
    <Modal animationType="none" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible()}>
      <TouchableOpacity style={styles.container} onPress={() => setModalVisible()}>
        <View style={styles.centeredView}>
          {/* <Text style={{fontSize: 20}}>Sort</Text> */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <TouchableOpacity
              style={{ flex: 1, flexDirection: 'row' }}
              onPress={() => {
                Platform.OS!="ios"?downloadModal(true):null;
                onExport();
                setModalVisible();
              }}>
              <AntDesign name="download" size={22} color={'black'} />
              <Text style={{ fontSize: 18, marginLeft: 15 }}>Export</Text>
            </TouchableOpacity>
            {/* {activeFilter == 'AZ' && (
              <View style={{height: 10, width: 10, borderRadius: 5, backgroundColor: '#520EAD', marginRight: 10}} />
            )} */}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
            <TouchableOpacity
              style={{ flex: 1, flexDirection: 'row' }}
              onPress={() => {
                onShare();
                shareModal(true);
                setModalVisible();
              }}>
              <Entypo name="share" size={22} color={'black'} />
              <Text style={{ fontSize: 18, marginLeft: 15 }}>Share</Text>
            </TouchableOpacity>
          </View>

          {phoneNo && (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
              <TouchableOpacity
                style={{ flex: 1, flexDirection: 'row' }}
                onPress={() => {
                  onWhatsAppShare();
                  setModalVisible();
                }}>
                <MaterialCommunityIcons name="whatsapp" size={22} color={'#000000'} />
                <Text style={{ fontSize: 18, marginLeft: 15 }}>Share on WhatsApp</Text>
              </TouchableOpacity>
            </View>
          )}
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

export default PDFModal;
