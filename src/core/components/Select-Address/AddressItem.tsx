import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions
} from 'react-native';

const { height, width } = Dimensions.get('window');

export class AddressItem extends React.Component<any, any> {
  constructor (props: any) {
    super(props);
    this.state = {};
  }

  render () {
    return (
      <TouchableOpacity
        activeOpacity={0.5}
        style={{
          height: height * 0.08,
          width: width,
          //   backgroundColor: 'pink',
          marginBottom: 10,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 15
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
            justifyContent: 'center'
          }}>
          {this.props.index == this.props.activeIndex && (
            <View style={{ height: 10, width: 10, borderRadius: 5, backgroundColor: this.props.color }}></View>
          )}
        </View>
        <Text style={{ fontFamily: 'AvenirLTStd-Book', fontSize: 16, marginLeft: 15 }} numberOfLines={4}>
          {this.props.type == 'warehouse'
            ? (this.props.item.name ? this.props.item.name : this.props.item.address)
            : (this.props.item.address ? this.props.item.address : this.props.item.stateName)}
        </Text>
      </TouchableOpacity>
    );
  }
}

export default AddressItem;
