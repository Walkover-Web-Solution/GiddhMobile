import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Keyboard,
  Animated,
  Dimensions,
  StatusBar,
  InteractionManager,
  DeviceEventEmitter, Platform,
} from 'react-native';
import style from './style';
import { connect } from 'react-redux';
import Icon from '@/core/components/custom-icon/custom-icon';
import { Bars } from 'react-native-loader';
import color from '@/utils/colors';
import _ from 'lodash';
import { useIsFocused } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import { Vendors } from './Vendors';
import { Customers } from './Customers';
import { APP_EVENTS } from '@/utils/constants';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

interface Props {
  navigation: any;
}

const { width, height } = Dimensions.get('window');

export const KEYBOARD_EVENTS = {
  IOS_ONLY: {
    KEYBOARD_WILL_SHOW: 'keyboardWillShow',
    KEYBOARD_WILL_HIDE: 'keyboardWillHide'
  },
  KEYBOARD_DID_SHOW: 'keyboardDidShow',
  KEYBOARD_DID_HIDE: 'keyboardDidHide'
};
export class Customer extends React.Component<Props> {
  constructor(props) {
    super(props);
    console.log('main constructor called');
    this.inputRef = React.createRef();
    this.scrollRef = React.createRef();
    this.state = {
      showLoader: false,
      currentPage: 0,
      index: 0,
      customerReset: () => { },
      vendorReset: () => { },
      screenWidth: Dimensions.get('window').width,
      screenHeight: Dimensions.get('window').height
    }
    Dimensions.addEventListener('change', () => {
      this.setState({
        screenWidth: Dimensions.get('window').width,
        screenHeight: Dimensions.get('window').height
      });
    });
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    Keyboard.dismiss();
    let index = 0;
    index = nextProps.route.params.index;
    console.log('getDerivedStateFromProps Index Value  ' + JSON.stringify(index))
    return {
      index: index
    };
  }

  FocusAwareStatusBar = (isFocused) => {
    return isFocused ? <StatusBar backgroundColor="#520EAD" barStyle={Platform.OS == 'ios' ? "dark-content" : "light-content"} /> : null;
  };

  renderHeader() {
    return (
      <View style={[style.header, { paddingHorizontal: 20, height: Dimensions.get('window').height * 0.08 }]}>
        <TouchableOpacity
          hitSlop={{right: 20, left: 20, top: 10, bottom: 10}}
          onPress={() => {
            this.props.navigation.goBack();
          }}>
          <Icon name={'Backward-arrow'} size={18} color={'#FFFFFF'} />
        </TouchableOpacity>
        <View style={style.invoiceTypeButton}>
          <Text style={style.invoiceType}>
            {this.state.currentPage == 1 ? (this.props.route.params.uniqueName ? "Enter Bank Detail" : "Create New Party") : "Create New Party"}
          </Text>
          <TouchableOpacity onPress={this.resetFun}>
            <Text style={{ color: 'white', fontFamily: 'AvenirLTStd-Book' }}>Clear All</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  resetFun = () => {
    if (this.state.currentPage == 0) {
      this.state.customerReset();
    } else {
      this.state.vendorReset();
    }
  }

  setCustomerFun = (fun) => {
    this.setState({ customerReset: fun });
  }

  setVendorFun = (fun) => {
    this.setState({ vendorReset: fun });
  }

  setSliderPage = (event: any) => {
    const { currentPage } = this.state;
    const { x } = event.nativeEvent.contentOffset;
    const indexOfNextScreen = Math.round(x / this.state.screenWidth);

    if (indexOfNextScreen !== currentPage) {
      this.setState({
        currentPage: indexOfNextScreen
      });
    }
  };

  componentDidMount() {
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.REFRESHPAGE, async () => {
      console.log('refresh captured');
      this.setState({ showLoader: true });
      let index = 0;
      console.log(this.props.route.params.index);
      index = this.props.route.params.index;
      console.log('componentDidMount Index Value  ' + JSON.stringify(index))
      await this.setState({ index: index });
      if (this.state.index == 1 && this.state.currentPage == 0) {
        await this.scrollRef.current.scrollTo({
          animated: true,
          y: 0,
          x: this.state.screenWidth * 2
        })
      } else if (this.state.index == 0 && this.state.currentPage == 1) {
        await this.scrollRef.current.scrollTo({
          animated: true,
          y: 0,
          x: this.state.screenWidth * -1
        })
      }
      InteractionManager.runAfterInteractions(() => {
        if (this.state.index == 1 && this.state.currentPage == 0) {
          this.scrollRef.current.scrollTo({
            animated: true,
            y: 0,
            x: width * 2
          })
        } else if (this.state.index == 0 && this.state.currentPage == 1) {
          this.scrollRef.current.scrollTo({
            animated: true,
            y: 0,
            x: width * -1
          })
        }
      })
      this.setState({ showLoader: false });
    })
    this.keyboardWillShowSub = Keyboard.addListener(KEYBOARD_EVENTS.IOS_ONLY.KEYBOARD_WILL_SHOW, this.keyboardWillShow);
    this.keyboardWillHideSub = Keyboard.addListener(KEYBOARD_EVENTS.IOS_ONLY.KEYBOARD_WILL_HIDE, this.keyboardWillHide);
  }

  componentWillUnmount() {
    this.keyboardWillShowSub = undefined;
    this.keyboardWillHideSub = undefined;
  }

  render() {
    return (
      <SafeAreaInsetsContext.Consumer>
        {(insets) => <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
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
                    backgroundColor: this.state.currentPage == 0 ? '#ECE4F8' : null,
                    borderTopEndRadius: 17,
                    borderTopLeftRadius: 17,
                    borderBottomLeftRadius: 17,
                    borderColor: this.state.currentPage == 1 ? '#5773FF' : '#D9D9D9',
                    width: Dimensions.get('window').width * 0.4,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 7,
                    borderWidth: 1
                  }}
                  onPress={() =>
                    this.scrollRef.current.scrollTo({
                      animated: true,
                      y: 0,
                      x: this.state.screenWidth * -1
                    })
                  }>
                  <Text
                    numberOfLines={1}
                    style={{
                      color: this.state.currentPage == 0 ? '#5773FF' : '#808080',
                      // fontFamily: this.state.currentPage == 0 ? 'AvenirLTStPd-Black' : 'AvenirLTStd-Book',
                      fontWeight: this.state.currentPage == 0 ? 'bold' : 'normal'
                    }}>
                    Customers
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    borderTopEndRadius: 17,
                    borderTopLeftRadius: 17,
                    borderBottomLeftRadius: 17,
                    backgroundColor: this.state.currentPage == 1 ? '#ECE4F8' : null,
                    borderColor: this.state.currentPage == 0 ? '#5773FF' : '#D9D9D9',
                    width: Dimensions.get('window').width * 0.4,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 2,
                    borderWidth: 1
                  }}
                  onPress={() =>
                    this.scrollRef.current.scrollTo({
                      animated: true,
                      y: 0,
                      x: this.state.screenWidth * 2
                    })
                  }>
                  <Text
                    numberOfLines={1}
                    style={{
                      color: this.state.currentPage == 1 ? '#5773FF' : '#808080',
                      // fontFamily: this.state.currentPage == 1 ? 'AvenirLTStPd-Black' : 'AvenirLTStd-Book',
                      fontWeight: this.state.currentPage == 1 ? 'bold' : 'normal'
                    }}>
                    Vendors
                  </Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                ref={this.scrollRef}
                onLayout={this.ScrollViewOnLayout}
                style={{ flex: 1, 
                  // marginBottom: Platform.OS == "ios" ? insets?.bottom + 50 : 0 
                }}
                horizontal={true}
                scrollEventThrottle={16}
                pagingEnabled={true}
                showsHorizontalScrollIndicator={false}
                onScroll={(event) => {
                  this.setSliderPage(event);
                }}>
                <View style={{ height: '100%', width: this.state.screenWidth }}>
                  {this.state.showLoader
                    ? (
                      <View style={{ flex: 1 }}>
                        <View style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                          position: "absolute",
                          backgroundColor: 'rgba(0,0,0,0)',
                          left: 0,
                          right: 0,
                          bottom: 0,
                          top: 0
                        }}>
                          <Bars size={15} color={color.PRIMARY_NORMAL} />
                        </View>
                      </View>
                    )
                    : (
                      <Customers
                        resetFun={this.setCustomerFun}
                        navigation={this.props.navigation}
                      />
                    )}
                </View>
                <View style={{ height: '100%', width: this.state.screenWidth }}>
                  {this.state.showLoader
                    ? (
                      <View style={{ flex: 1 }}>
                        <View style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                          position: "absolute",
                          backgroundColor: 'rgba(0,0,0,0)',
                          left: 0,
                          right: 0,
                          bottom: 0,
                          top: 0
                        }}>
                          <Bars size={15} color={color.PRIMARY_NORMAL} />
                        </View>
                      </View>
                    )
                    : (
                      <Vendors
                        resetFun={this.setVendorFun}
                        navigation={this.props.navigation}
                        uniqueName={this.props.route.params.uniqueName}
                      />
                    )}
                </View>
              </ScrollView>
        </View>}
      </SafeAreaInsetsContext.Consumer>
    );
  }
}

function mapStateToProps(state) {
  const { commonReducer } = state;
  return {
    ...commonReducer
  };
}
function mapDispatchToProps(dispatch) {
  return {
    getCompanyAndBranches: () => {
      dispatch(getCompanyAndBranches());
    }
  };
}

function Screen(props) {
  const isFocused = useIsFocused();

  return <Customer {...props} isFocused={isFocused} />;
}
const MyComponent = connect(mapStateToProps, mapDispatchToProps)(Screen);
export default MyComponent;
