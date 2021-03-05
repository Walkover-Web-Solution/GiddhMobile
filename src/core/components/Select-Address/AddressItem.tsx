import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Platform,
  PermissionsAndroid,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import style from './style';
import Icon from '@/core/components/custom-icon/custom-icon';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import CounterComponent from './counterComponent';

const {height, width} = Dimensions.get('window');

export class AddressItem extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <TouchableOpacity
        activeOpacity={0.5}
        style={{
          height: height * 0.15,
          width: width,
          //   backgroundColor: 'pink',
          marginVertical: 10,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 15,
        }}
        delayPressIn={0}
        onPress={() => this.props.changeactiveIndex(this.props.index)}>
        <View
          style={{
            height: 16,
            width: 16,
            borderRadius: 8,
            backgroundColor: '#C4C4C4',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {this.props.index == this.props.activeIndex && (
            <View style={{height: 10, width: 10, borderRadius: 5, backgroundColor: '#229F5F'}}></View>
          )}
        </View>
        <Text style={{fontFamily: 'AvenirLTStd-Book', fontSize: 20, marginLeft: 15}} numberOfLines={4}>
          {this.props.item.address}
        </Text>
      </TouchableOpacity>
    );
  }
}

export default AddressItem;
