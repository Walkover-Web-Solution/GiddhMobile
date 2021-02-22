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

const Screen_height = Dimensions.get('window').height;
const Screen_width = Dimensions.get('window').width;

function SortModal({modalVisible, setModalVisible, filter, activeFilter}) {
  return (
    <Modal animationType="none" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible()}>
      <TouchableOpacity style={styles.container} onPress={() => setModalVisible()}>
        <View style={styles.centeredView}>
          {/* <Text style={{fontSize: 20}}>Sort</Text> */}
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
            <TouchableOpacity
              style={{flex: 1}}
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
              style={{flex: 1}}
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
              style={{flex: 1}}
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
              style={{flex: 1}}
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

export default SortModal;
