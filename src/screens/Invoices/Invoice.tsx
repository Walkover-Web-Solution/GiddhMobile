import React from 'react';

import {View, Text, TouchableOpacity, FlatList, Dimensions, Platform, PermissionsAndroid, Animated, Alert} from 'react-native';
import style from './style';


const {height, width} = Dimensions.get('window');

export class Invoice extends React.Component<any, any> {
  constructor(props: any) {
    super(props);

    this.state = {
      active: 0,
      xTabOne: 0, //x co-ordinate of tab one
      xTabTwo: 0,
      translateX: new Animated.Value(0),
    };
  }

  handleSlide = (type) => {
    let {active, xTabOne, xTabTwo, translateX} = this.state;
    Animated.spring(translateX, {
      toValue: type,
      duration: 100,
    }).start();
  };
  render() {
    return (
      <View style={style.container}>
        <View
          style={{
            width: '90%',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
          <View
            style={{
              flexDirection: 'row',
              marginTop: 40,
              marginBottom: 20,
              height: 36,
            }}>
            <Animated.View
              style={{
                position: 'absolute',
                width: '50%',
                height: '100%',
                top: 0,
                left: 0,
                // backgroundColor: '#007aff',
                borderRadius: 4,
                borderWidth: 1,
                borderColor: '#007aff',
                zIndex: 1,

                transform: [
                  {
                    translateX: this.state.translateX,
                  },
                ],
              }}
            />
            <TouchableOpacity
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#D9D9D9',
                borderRadius: 4,
                borderRightWidth: 0,
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
              }}
              onLayout={(event) =>
                this.setState({
                  xTabOne: event.nativeEvent.layout.x,
                })
              }
              onPress={() => this.setState({active: 0}, () => this.handleSlide(this.state.xTabOne))}>
              <Text>Tab One</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#D9D9D9',
                borderRadius: 4,
                borderLeftWidth: 0,
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
              }}
              onLayout={(event) =>
                this.setState({
                  xTabTwo: event.nativeEvent.layout.x,
                })
              }
              onPress={() => this.setState({active: 1}, () => this.handleSlide(this.state.xTabTwo))}>
              <Text>Tab Two</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}

export default Invoice;
