import React from 'react';
import { GDContainer } from '@/core/components/container/container.component';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  Keyboard,
  ActivityIndicator,
  DeviceEventEmitter,
  Animated,
  NativeModules,
  Platform,
  Dimensions,
  StatusBar,
} from 'react-native';
import style from './style';
import { connect } from 'react-redux';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import Icon from '@/core/components/custom-icon/custom-icon';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { Bars } from 'react-native-loader';
import color from '@/utils/colors';
import _ from 'lodash';
import { APP_EVENTS, STORAGE_KEYS } from '@/utils/constants';
import { InvoiceService } from '@/core/services/invoice/invoice.service';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useIsFocused } from '@react-navigation/native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { ScrollView } from 'react-native-gesture-handler';
import { Vendors } from './Vendors';
import { Customers } from './Customers';

const { SafeAreaOffsetHelper } = NativeModules;

interface Props {
  navigation: any;
}

const { width, height } = Dimensions.get('window');

export const KEYBOARD_EVENTS = {
  IOS_ONLY: {
    KEYBOARD_WILL_SHOW: 'keyboardWillShow',
    KEYBOARD_WILL_HIDE: 'keyboardWillHide',
  },
  KEYBOARD_DID_SHOW: 'keyboardDidShow',
  KEYBOARD_DID_HIDE: 'keyboardDidHide',
};
export class Customer extends React.Component<Props> {
  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
    this.scrollRef = React.createRef();

    this.state = {
      currentPage: 0,
    }
  }

  FocusAwareStatusBar = (isFocused) => {
    return isFocused ? <StatusBar backgroundColor="#520EAD" barStyle="light-content" /> : null;
  };

  renderHeader() {
    return (
      <View style={[style.header, { paddingTop: 10 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <TouchableOpacity
            style={{ padding: 10 }}
            onPress={() => {
              this.props.navigation.goBack();
            }}>
            <Icon name={'Backward-arrow'} size={18} color={'#FFFFFF'} />
          </TouchableOpacity>
          <TouchableOpacity style={style.invoiceTypeButton}>
            <Text style={style.invoiceType}>
              Create New Party
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  setSliderPage = (event: any) => {
    const { currentPage } = this.state;
    const { x } = event.nativeEvent.contentOffset;
    const indexOfNextScreen = Math.round(x / width);

    if (indexOfNextScreen !== currentPage) {
      this.setState({
        currentPage: indexOfNextScreen,
      });
    }
  };

  componentDidMount() {
    this.keyboardWillShowSub = Keyboard.addListener(KEYBOARD_EVENTS.IOS_ONLY.KEYBOARD_WILL_SHOW, this.keyboardWillShow);
    this.keyboardWillHideSub = Keyboard.addListener(KEYBOARD_EVENTS.IOS_ONLY.KEYBOARD_WILL_HIDE, this.keyboardWillHide);
  }

  componentWillUnmount() {
    this.keyboardWillShowSub = undefined;
    this.keyboardWillHideSub = undefined;
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <Animated.ScrollView
          keyboardShouldPersistTaps="always"
          style={[{ flex: 1, backgroundColor: 'white' }, { marginBottom: this.keyboardMargin }]}
          bounces={false}>
          <View style={style.container}>
            {this.FocusAwareStatusBar(this.props.isFocused)}
            <View style={style.headerConatiner}>
              {this.renderHeader()}
            </View>
            <View
              style={{
                marginTop: 10,

                justifyContent: 'space-around',
                flexDirection: 'row',
                marginBottom: 5
              }}>
              <TouchableOpacity
                style={{
                  backgroundColor: this.state.currentPage == 0 ? "#ECE4F8" : null,
                  borderTopEndRadius: 17,
                  borderTopLeftRadius: 17,
                  borderBottomLeftRadius: 17,
                  borderColor: this.state.currentPage == 1 ? '#5773FF' : '#D9D9D9',
                  width: Dimensions.get('window').width * 0.4,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 7,
                  borderWidth: 1,
                }}
                onPress={() =>
                  this.scrollRef.current.scrollTo({
                    animated: true,
                    y: 0,
                    x: width * -1,
                  })
                }>
                <Text
                  numberOfLines={1}
                  style={{
                    color: this.state.currentPage == 0 ? '#5773FF' : '#808080',
                    // fontFamily: this.state.currentPage == 0 ? 'AvenirLTStPd-Black' : 'AvenirLTStd-Book',
                    fontWeight: this.state.currentPage == 0 ? 'bold' : 'normal',
                  }}>
                  Customers
            </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  borderTopEndRadius: 17,
                  borderTopLeftRadius: 17,
                  borderBottomLeftRadius: 17,
                  backgroundColor: this.state.currentPage == 1 ? "#ECE4F8" : null,
                  borderColor: this.state.currentPage == 0 ? '#5773FF' : '#D9D9D9',
                  width: Dimensions.get('window').width * 0.4,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 2,
                  borderWidth: 1,
                }}
                onPress={() =>
                  this.scrollRef.current.scrollTo({
                    animated: true,
                    y: 0,
                    x: width * 2,
                  })
                }>
                <Text
                  numberOfLines={1}
                  style={{
                    color: this.state.currentPage == 1 ? '#5773FF' : '#808080',
                    // fontFamily: this.state.currentPage == 1 ? 'AvenirLTStPd-Black' : 'AvenirLTStd-Book',
                    fontWeight: this.state.currentPage == 1 ? 'bold' : 'normal',
                  }}>
                  Vendors
            </Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              ref={this.scrollRef}
              style={{ flex: 1 }}
              horizontal={true}
              scrollEventThrottle={16}
              pagingEnabled={true}
              showsHorizontalScrollIndicator={false}
              onScroll={(event) => {
                this.setSliderPage(event);
              }}>
              <View style={{ height: '100%', width: width }}>
                {this.state.showLoader ? (
                  <View style={{ flex: 1 }}>
                    <View style={style.alignLoader}>
                      <Bars size={15} color={color.PRIMARY_NORMAL} />
                    </View>
                  </View>
                ) : (
                  <Customers
                    navigation={this.props.navigation}
                  />
                )}
              </View>
              <View style={{ height: '100%', width: width }}>
                {this.state.showLoader ? (
                  <View style={{ flex: 1 }}>
                    <View style={style.alignLoader}>
                      <Bars size={15} color={color.PRIMARY_NORMAL} />
                    </View>
                  </View>
                ) : (
                  <Vendors
                    navigation={this.props.navigation}
                  />
                )}
              </View>
            </ScrollView>

          </View>
        </Animated.ScrollView>
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
  return {
    getCompanyAndBranches: () => {
      dispatch(getCompanyAndBranches());
    },
  };
}

function Screen(props) {
  const isFocused = useIsFocused();

  return <Customer {...props} isFocused={isFocused} />;
}
const MyComponent = connect(mapStateToProps, mapDispatchToProps)(Screen);
export default MyComponent;
