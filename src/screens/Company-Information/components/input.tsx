import React from 'react';
import { Text, View, TextInput, TouchableOpacity } from 'react-native';
import style from './inputStyle';

class Input extends React.Component<any, any> {
  render () {
    return (
      <View style={[style.container, { width: this.props.width ? this.props.width : '100%' }]}>
        <View style={{ flexDirection: 'row' }}>
          {this.props.icon}
          <Text style={{ fontSize: 18, marginLeft: 10, color: '#808080' }}>{this.props.name}</Text>
          <Text style={{ fontSize: 16, marginLeft: 5, color: 'red' }}>*</Text>
        </View>

        {this.props.picker
          ? (
          <TouchableOpacity
            onPress={this.props.onPress}
            style={{
              borderBottomWidth: 1,
              borderBottomColor: '#c4c4c4',
              height: 40,
              justifyContent: 'center'
            }}>
            <Text style={{ color: '#9e9e9e' }}>{this.props.placeholder}</Text>
          </TouchableOpacity>
            )
          : (
          <TextInput
            placeholder={this.props.placeholder}
            style={{ borderBottomWidth: 1, borderBottomColor: '#c4c4c4', height: 40 }}
            value={this.props.value}></TextInput>
            )}
      </View>
    );
  }
}

export default Input;
