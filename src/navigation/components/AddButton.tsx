import React, { Component } from 'react';

import { Animated, TouchableHighlight, View, Dimensions, FlatList, TouchableOpacity, Text } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';
import style from '@/screens/Auth/Otp/style';
import { connect } from 'react-redux';
import color from '@/utils/colors';
const arrButtons = [{ name: 'Sales Invoice', navigateTo: 'Sales_Invoice', icon: 'shopping-bag', color: '#229F5F' },
                    { name: 'Purchase Bill', navigateTo: 'Purchase_Bill', icon: 'Purchase_Bill', color: '#FC8345' },
                    { name: 'Receipt', navigateTo: 'Receipt', icon: 'Receipt', color: '#00B795' },
                    { name: 'Payment', navigateTo: 'Payment', icon: 'Payment', color: '#084EAD' },
                    { name: 'Sales Invoice', navigateTo: 'Sales_Invoice', icon: 'shopping-bag', color: '#229F5F' },
                    { name: 'Purchase Bill', navigateTo: 'Purchase_Bill', icon: 'Purchase_Bill', color: '#FC8345' },
                    { name: 'Receipt', navigateTo: 'Receipt', icon: 'Receipt', color: '#00B795' },
                    { name: 'Payment', navigateTo: 'Payment', icon: 'Payment', color: '#084EAD' },
                    { name: 'Sales Invoice', navigateTo: 'Sales_Invoice', icon: 'shopping-bag', color: '#229F5F' },
                    { name: 'Purchase Bill', navigateTo: 'Purchase_Bill', icon: 'Purchase_Bill', color: '#FC8345' },
                    { name: 'Receipt', navigateTo: 'Receipt', icon: 'Receipt', color: '#00B795' },
                    { name: 'Payment', navigateTo: 'Payment', icon: 'Payment', color: '#084EAD' }];
const SIZE = 48;
const padding = 10
let itemWidth = (Dimensions.get('window').width - (SIZE + padding * 8)) / 4;

class AddButton extends Component {
    mode = new Animated.Value(0);
    toggleView = () => {
        Animated.timing(this.mode, {
            toValue: this.mode._value === 0 ? 1 : 0,
            duration: 300
        }).start();
    };

    render() {
        const firstX = this.mode.interpolate({
            inputRange: [0, 1],
            outputRange: [-Dimensions.get('window').width / 2, -Dimensions.get('window').width / 2]
        });
        const firstY = this.mode.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -(Dimensions.get('window').width - itemWidth )]
        });
        const opacity = this.mode.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1]
        });
        const rotation = this.mode.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '45deg']
        });
        return (
            <View style={{
                position: 'absolute',
                alignItems: 'center'
            }}>
                <Animated.View style={{
                    position: 'absolute',
                    left: firstX,
                    top: firstY,
                    opacity
                }}>
                    <View

                        style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: Dimensions.get('window').width - SIZE,
                            minHeight: (Dimensions.get('window').width - itemWidth  * 3) ,
                            backgroundColor: '#EDF1FF',
                            borderRadius: 10,
                            shadowColor: 'grey',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.8,
                            shadowRadius: 2,
                            elevation: 5,
                            
                        }}
                    >
                        <FlatList
                            numColumns={4}                  // set number of columns 

                            data={arrButtons}
                            showsVerticalScrollIndicator={false}
                            style={{ flex: 1, alignSelf: 'center' }}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={{ width: itemWidth, borderRadius: itemWidth / 2, justifyContent: 'center', alignItems: 'center', margin: padding }}
                                    delayPressIn={0}
                                    onPress={async () => {

                                    }}>
                                    <View style={{ width: itemWidth, backgroundColor: item.color, borderRadius: itemWidth / 2, height: itemWidth, justifyContent: 'center', alignItems: 'center' }}>
                                        <Icon name={item.icon} size={24} color="#F8F8F8" />
                                    </View>
                                    <Text style={{ fontSize: 9, textAlign: 'center', marginTop: 5 }}>{item.name}</Text>

                                </TouchableOpacity>

                            )}
                            keyExtractor={(item) => item.name}
                        />

                    </View>
                </Animated.View>

                <TouchableHighlight
                    onPress={this.toggleView}
                    underlayColor="#2882D8"
                    style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: SIZE,
                        height: SIZE,
                        borderRadius: SIZE / 2,
                        backgroundColor: '#5773FF',
                    }}
                >
                    <Animated.View style={{
                        transform: [
                            { rotate: rotation }
                        ]
                    }}>
                        <Icon name="plus" size={24} color="#F8F8F8" />
                    </Animated.View>
                </TouchableHighlight>
            </View>
        );
    }
}


function mapStateToProps(state) {
    const { commonReducer } = state;
    return {
        ...commonReducer,
    };
}
function mapDispatchToProps(dispatch) {

}

const MyComponent = connect(mapStateToProps)(AddButton);
export default MyComponent;
