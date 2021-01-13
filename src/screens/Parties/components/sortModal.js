import React from 'react';
import {Alert, Modal, StyleSheet, Text, TouchableHighlight, Dimensions, View, TouchableOpacity} from 'react-native';

const Screen_height = Dimensions.get('window').height;
const Screen_width = Dimensions.get('window').width;

function SortModal({modalVisible, setModalVisible, filter, activeFilter}) {
  return (
    <View style={styles.container}>
      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
        }}>
        <View style={styles.centeredView}>
          {/* <Text style={{fontSize: 20}}>Sort</Text> */}
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
            <TouchableOpacity
              onPress={() => {
                filter('AZ');
                setModalVisible();
              }}>
              <Text style={{fontSize: 18}}>Name - A to Z</Text>
            </TouchableOpacity>
            {activeFilter == 'AZ' && (
              <View style={{height: 10, width: 10, borderRadius: 5, backgroundColor: '#520EAD', marginRight: 10}} />
            )}
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20}}>
            <TouchableOpacity
              onPress={() => {
                filter('ZA');
                setModalVisible();
              }}>
              <Text style={{fontSize: 18}}>Name - Z to A</Text>
            </TouchableOpacity>
            {activeFilter == 'ZA' && (
              <View style={{height: 10, width: 10, borderRadius: 5, backgroundColor: '#520EAD', marginRight: 10}} />
            )}
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20}}>
            <TouchableOpacity
              onPress={() => {
                filter('10');
                setModalVisible();
              }}>
              <Text style={{fontSize: 18}}>Amount - Low to High</Text>
            </TouchableOpacity>
            {activeFilter == '10' && (
              <View style={{height: 10, width: 10, borderRadius: 5, backgroundColor: '#520EAD', marginRight: 10}} />
            )}
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20}}>
            <TouchableOpacity
              onPress={() => {
                filter('01');
                setModalVisible();
              }}>
              <Text style={{fontSize: 18}}>Amount - High to Low </Text>
            </TouchableOpacity>
            {activeFilter == '01' && (
              <View style={{height: 10, width: 10, borderRadius: 5, backgroundColor: '#520EAD', marginRight: 10}} />
            )}
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
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredView: {
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
  dog: {
    height: Screen_height * 0.1,
    width: Screen_height * 0.1,
    marginTop: '7%',
  },
  openButton: {
    backgroundColor: '#5db075',
    height: Screen_height * 0.05,
    borderRadius: 10,
    justifyContent: 'center',
    width: Screen_height * 0.1,
    elevation: 2,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  text: {
    alignSelf: 'center',
    textAlign: 'justify',

    fontSize: Screen_height * 0.022,
  },
  modalText: {
    fontSize: Screen_height * 0.04,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default SortModal;
