import React, {Component} from 'react';

import {Animated, TouchableHighlight, View, Dimensions, FlatList, Text, Modal, TouchableOpacity} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Entypo from 'react-native-vector-icons/Entypo';
import Icon from '@/core/components/custom-icon/custom-icon';
// import {TouchableOpacity} from 'react-native-gesture-handler';

import style from '@/screens/Auth/Otp/style';
import {connect} from 'react-redux';
import color from '@/utils/colors';
import {transform} from '@babel/core';
const arrButtons = [
  {name: 'Sales Invoice', navigateTo: 'InvoiceScreens', icon: 'purchase1', color: '#229F5F'},
  {name: 'Purchase Bill', navigateTo: 'PurchaseBillScreens', icon: 'path1', color: '#FC8345'},
  // {name: 'Receipt', navigateTo: 'Receipt', icon: 'path-22', color: '#00B795'},
  // {name: 'Payment', navigateTo: 'Payment', icon: 'Union-631', color: '#084EAD'},
  // {name: 'Sales Invoice', navigateTo: 'Sales_Invoice', icon: 'shopping-bag', color: '#229F5F'},
  // {name: 'Purchase Bill', navigateTo: 'Purchase_Bill', icon: 'Purchase_Bill', color: '#FC8345'},
  // {name: 'Receipt', navigateTo: 'Receipt', icon: 'Receipt', color: '#00B795'},
  // {name: 'Payment', navigateTo: 'Payment', icon: 'Payment', color: '#084EAD'},
  // {name: 'Sales Invoice', navigateTo: 'Sales_Invoice', icon: 'shopping-bag', color: '#229F5F'},
  // {name: 'Purchase Bill', navigateTo: 'Purchase_Bill', icon: 'Purchase_Bill', color: '#FC8345'},
  // {name: 'Receipt', navigateTo: 'Receipt', icon: 'Receipt', color: '#00B795'},
  // {name: 'Payment', navigateTo: 'Payment', icon: 'Payment', color: '#084EAD'},
];
const SIZE = 48;
const padding = 10;
let itemWidth = (Dimensions.get('window').width - (SIZE + padding * 8)) / 4;

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

class AddButton extends Component {
  constructor(props: Props) {
    super(props);
    this.state = {
      modalVisible: false,
    };
  }
  mode = new Animated.Value(0);
  toggleView = () => {
    Animated.timing(this.mode, {
      toValue: this.mode._value === 0 ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };
  render() {
    console.log('this.props.navigati----' + JSON.stringify(this.props.navigation));
    const firstX = this.mode.interpolate({
      inputRange: [0, 1],
      outputRange: [-Dimensions.get('window').width / 2, -Dimensions.get('window').width / 2],
    });
    const firstY = this.mode.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -(Dimensions.get('window').width - itemWidth)],
    });
    const opacity = this.mode.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });
    const rotation = this.mode.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '45deg'],
    });
    return (
      <View
        style={{
          // position: 'absolute',
          alignItems: 'center',
          // left: 0,
          // right: 0,
        }}>
        <Modal
          visible={this.state.modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => this.setState({modalVisible: false})}>
          <View
            style={{
              position: 'absolute',
              alignSelf: 'center',
              bottom: 0,
              // height: Dimensions.get('window').width * 0.7,
              paddingVertical: 20,
              width: Dimensions.get('window').width * 0.9,
              borderTopEndRadius: 15,
              backgroundColor: '#fff',
              alignItems: 'center',
              elevation: 3,
            }}>
            <FlatList
              numColumns={4} // set number of columns
              data={arrButtons}
              showsVerticalScrollIndicator={false}
              style={{flex: 1, alignSelf: 'center', marginBottom: SIZE}}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={{
                    width: itemWidth,
                    borderRadius: itemWidth / 2,
                    justifyContent: 'center',
                    alignItems: 'center',
                    margin: padding,
                  }}
                  // onPress={() => console.log('this works')}
                  onPress={async () => {
                    this.props.navigation.navigate(item.navigateTo);
                    this.setState({modalVisible: false});
                    // this.toggleView();
                  }}>
                  <View
                    style={{
                      width: itemWidth,
                      backgroundColor: item.color,
                      borderRadius: itemWidth / 2,
                      height: itemWidth,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Icon name={item.icon} size={24} color="#F8F8F8" />
                  </View>
                  <Text style={{fontSize: 9, textAlign: 'center', marginTop: 5}}>{item.name}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.name}
            />
            <TouchableOpacity
              onPress={() => this.setState({modalVisible: false})}
              style={{
                position: 'absolute',
                bottom: 10,
                width: SIZE,
                height: SIZE,
                borderRadius: SIZE / 2,
                backgroundColor: '#5773FF',
                transform: [{rotate: '90deg'}],
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Entypo name="cross" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </Modal>

        <TouchableHighlight
          onPress={() => this.setState({modalVisible: !this.state.modalVisible})}
          underlayColor="#2882D8"
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            width: SIZE,
            height: SIZE,
            borderRadius: SIZE / 2,
            backgroundColor: '#5773FF',
          }}>
          <Animated.View
            style={{
              transform: [{rotate: rotation}],
            }}>
            <Entypo name="plus" size={24} color="#fff" />
          </Animated.View>
        </TouchableHighlight>
      </View>
    );
  }
}

function mapStateToProps(state) {
  const {commonReducer} = state;
  return {
    ...commonReducer,
  };
}
function mapDispatchToProps(dispatch) {}

const MyComponent = connect(mapStateToProps)(AddButton);
export default MyComponent;
