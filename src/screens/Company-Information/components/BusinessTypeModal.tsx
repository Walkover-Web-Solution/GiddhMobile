import React from 'react';
import { Text, View, TouchableOpacity, Modal, Dimensions } from 'react-native';

const { height, width } = Dimensions.get('window');

class BusinessTypeModal extends React.Component<any, any> {
  render () {
    return (
      <Modal animationType="fade" transparent={true} visible={this.props.modalVisible}>
        <View
          style={{
            top: height * 0.3,
            height: height * 0.4,
            width: width * 0.9,
            borderRadius: 15,
            backgroundColor: 'white',
            elevation: 3,
            alignItems: 'center',
            alignSelf: 'center'
          }}>
          <Text style={{ fontSize: 18, color: '#424242' }}>Select Business Type</Text>
          {/* <View style={{marginTop: 10, flex: 1, backgroundColor: 'pink'}}></View> */}
          <TouchableOpacity onPress={() => this.props.onClose}>
            <Text style={{ fontSize: 18, marginTop: 20 }}>Registered</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.props.onClose}>
            <Text style={{ fontSize: 18, marginTop: 18 }}>Unregistered</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.props.onClose}>
            <Text style={{ fontSize: 18, marginTop: 18 }}>Deemed Export</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.props.onClose}>
            <Text style={{ fontSize: 18, marginTop: 18 }}>Government Entity</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.props.onClose}>
            <Text style={{ fontSize: 18, marginTop: 18 }}>SEZ</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.props.onClose} style={{ position: 'absolute', bottom: 5 }}>
            <Text style={{ fontSize: 18 }}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }
}

export default BusinessTypeModal;
