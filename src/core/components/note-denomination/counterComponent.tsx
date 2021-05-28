import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';

const { height } = Dimensions.get('window');

export class CounterComponent extends React.Component<any, any> {
  render () {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'center',
          marginTop: 20,
          //   backgroundColor: 'pink',
          height: height * 0.04
        }}>
        <TouchableOpacity delayPressIn={0} onPress={() => this.props.setCount('reduce')}>
          <Entypo name="squared-minus" size={24} color={'#C4C4C4'} />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'AvenirLTStd-Book', marginHorizontal: 5, fontSize: 20 }}>{this.props.count}</Text>
        <TouchableOpacity delayPressIn={0} onPress={() => this.props.setCount('add')}>
          <Entypo name="squared-plus" size={24} color={'#C4C4C4'} />
        </TouchableOpacity>
      </View>
    );
  }
}

export default CounterComponent;
