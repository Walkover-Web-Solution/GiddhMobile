import React, { Component } from 'react';
import {
    View,
    Text,
    Keyboard,
    TouchableOpacity,
    Animated,
    TextInput,
    NativeModules
} from 'react-native';

import style from './style'


export const KEYBOARD_EVENTS = {
    IOS_ONLY: {
        KEYBOARD_WILL_SHOW: 'keyboardWillShow',
        KEYBOARD_WILL_HIDE: 'keyboardWillHide',
    },
    KEYBOARD_DID_SHOW: 'keyboardDidShow',
    KEYBOARD_DID_HIDE: 'keyboardDidHide'
}

/**
 * UI For Create account screen
 */
class EditItemDetails extends Component {

    constructor(props) {
        super(props);
        this.state = {
            mobileNumber: ''
        }
        this.keyboardMargin = new Animated.Value(0);

    }

    componentDidMount() {
        this.keyboardWillShowSub = Keyboard.addListener(KEYBOARD_EVENTS.IOS_ONLY.KEYBOARD_WILL_SHOW, this.keyboardWillShow);
        this.keyboardWillHideSub = Keyboard.addListener(KEYBOARD_EVENTS.IOS_ONLY.KEYBOARD_WILL_HIDE, this.keyboardWillHide);
        if (Platform.OS == 'ios') {
            //Native Bridge for giving the bottom offset //Our own created
            SafeAreaOffsetHelper.getBottomOffset().then(offset => {
                let { bottomOffset } = offset;
                this.setState({ bottomOffset })
            })
        }
    }
    /*
      Added Keyboard Listner for making view scroll if needed
    */
    keyboardWillShow = (event) => {
        const value = event.endCoordinates.height - this.state.bottomOffset;
        Animated.timing(this.keyboardMargin, {
            duration: event.duration,
            toValue: value,
        }).start();
    };

    keyboardWillHide = (event) => {
        Animated.timing(this.keyboardMargin, {
            duration: event.duration,
            toValue: 0,
        }).start();
    };

  

    render() {
        return (
            <Animated.ScrollView keyboardShouldPersistTaps='always' style={[{ flex: 1 }, { marginBottom: this.keyboardMargin }]} bounces={false}>
                <View style={style.container}>
                 
                </View>
            </Animated.ScrollView>
        )
    }
   
}

export default (EditItemDetails);