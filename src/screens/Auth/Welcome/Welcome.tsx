import React from 'react';
import { connect } from 'react-redux';
import { View, Text, Dimensions, ScrollView, Image } from 'react-native';
import style from './style';
import loginStyle from '@/screens/Auth/Login/style';
import routes from '@/navigation/routes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/utils/constants';
import LoginButton from '@/core/components/login-button/login-button.component';
import { ButtonSize } from '@/models/enums/button';

class Welcome extends React.Component<any, any> {
  func1 = async () => {
    // AsyncStorage.clear();
    const activeCompany = await AsyncStorage.getItem(STORAGE_KEYS.token);
    console.log(activeCompany);
  };

  constructor(props: any) {
    super(props);
    this.state = {
      currentPage: 0,
      screenWidth: Dimensions.get('window').width,
      screenHeight: Dimensions.get('window').height,
      scrollRef: React.createRef()
    };
  }

  Slide1 = () => {
    return (
      <View style={{ width: this.state.screenWidth, height: '100%', alignItems: 'center', flex: 1 }}>
        <Image
          source={require('@/assets/images/slider1.png')}
          style={{ resizeMode: 'contain', height: '50%', width: '60%' }}
        />
        <Text style={{ fontSize: 22, marginTop: 10, fontFamily: 'AvenirLTStd-Black' }}>Easy Billing on Mobile</Text>
        <Text style={{ width: '80%', textAlign: 'center', color: 'grey', fontSize: 18, marginTop: 5 }}>
          Create professional invoices and send them to your customers
        </Text>
      </View>
    );
  };

  Slide2 = () => {
    return (
      <View style={{ width: this.state.screenWidth, height: '100%', alignItems: 'center', flex: 1 }}>
        <Image
          source={require('@/assets/images/slider2.png')}
          style={{ resizeMode: 'contain', height: '50%', width: '60%' }}
        />
        <Text style={{ fontFamily: 'AvenirLTStd-Black', fontSize: 22, marginTop: 10 }}>Send Payment Reminders</Text>
        <Text style={{ width: '80%', textAlign: 'center', color: 'grey', fontSize: 18, marginTop: 5 }}>
          We alert you so that you can alert your customers when there are payment dues
        </Text>
      </View>
    );
  };

  Slide3 = () => {
    return (
      <View style={{ width: this.state.screenWidth, height: '100%', alignItems: 'center', flex: 1 }}>
        <Image
          source={require('@/assets/images/slider3.png')}
          style={{ resizeMode: 'contain', height: '50%', width: '60%' }}
        />
        <Text style={{ fontFamily: 'AvenirLTStd-Black', fontSize: 22, marginTop: 10 }}>Stock Management</Text>
        <Text style={{ width: '80%', textAlign: 'center', color: 'grey', fontSize: 18, marginTop: 5 }}>
          Track your inventory , manage product SKU's and more
        </Text>
      </View>
    );
  };

  Slide4 = () => {
    return (
      <View style={{ width: this.state.screenWidth, height: '100%', alignItems: 'center', flex: 1 }}>
        <Image
          source={require('@/assets/images/slider4.png')}
          style={{ resizeMode: 'contain', height: '50%', width: '60%' }}
        />
        <Text style={{ fontFamily: 'AvenirLTStd-Black', fontSize: 22, marginTop: 10 }}>All In One Accounting Tool</Text>
        <Text style={{ width: '80%', textAlign: 'center', color: 'grey', fontSize: 18, marginTop: 5 }}>
          File GST, get analytics report, view balance sheet and P&L
        </Text>
      </View>
    );
  };

  componentDidMount() {
    this.timer = setInterval(() => {
      this.setState(
        (prev) => ({ currentPage: prev.currentPage == 3 ? 0 : prev.currentPage + 1 }),
        () => {
          this.state.scrollRef.scrollTo({
            animated: true,
            y: 0,
            x: this.state.screenWidth * this.state.currentPage
          });
        }
      );
    }, 2000);
    this.dimensionsSubscription = Dimensions.addEventListener('change', this.changeHandler);
  }

  changeHandler = ({ window: { width, height } }) => {
    this.setState({
      screenWidth: width,
      screenHeight: height
    });
    this.state.scrollRef.scrollTo({
      animated: true,
      x: width * this.state.currentPage,
      y: 0
    });
  }

  componentWillUnmount() {
    this.dimensionsSubscription?.remove('change', this.changeHandler);
    if (this.timer) clearInterval(this.timer);
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

  render() {
    const { currentPage: pageIndex } = this.state;
    return (
      <View style={style.container}>
        <View style={{ height: this.state.screenHeight * 0.7, width: this.state.screenWidth, marginTop: this.state.screenHeight * 0.05 }}>
          <ScrollView
            ref={(ref) => this.state.scrollRef = ref}
            style={{ flex: 1 }}
            horizontal={true}
            scrollEventThrottle={16}
            pagingEnabled={true}
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              this.setSliderPage(event);
            }}
            onTouchStart={() => clearInterval(this.timer)}
          >
            {this.Slide1()}
            {this.Slide2()}
            {this.Slide3()}
            {this.Slide4()}
          </ScrollView>
          <View style={[style.paginationWrapper, { top: this.state.screenHeight * 0.6 }]}>
            {Array.from(Array(4).keys()).map((key, index) => (
              <View style={[style.paginationDots, { opacity: pageIndex === index ? 1 : 0.2 }]} key={index} />
            ))}
          </View>
        </View>

        <View style={style.buttonContainer}>
          <View style={loginStyle.authInner}>
            <View style={loginStyle.authStack}>
              <View style={loginStyle.authButtonWrap}>
                <LoginButton
                  size={ButtonSize.medium}
                  label="Login"
                  style={[
                    loginStyle.authButton,
                    loginStyle.googleAuthButton,
                    style.noShadow
                  ]}
                  labelStyle={loginStyle.googleAuthLabel}
                  onPress={() => this.props.navigation.navigate(routes.Login)}
                />
              </View>
              <View style={loginStyle.authButtonWrap}>
                <LoginButton
                  size={ButtonSize.medium}
                  label="Sign Up"
                  style={[
                    loginStyle.authButton,
                    loginStyle.googleAuthButton,
                    style.noShadow
                  ]}
                  labelStyle={loginStyle.googleAuthLabel}
                  onPress={() => this.props.navigation.navigate(routes.Signup)}
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state: RootState) => {
  return {
    isLoginInProcess: state.LoginReducer.isAuthenticatingUser
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    // login: dispatch.auth.loginAction,
    // googleLogin: dispatch.auth.googleLoginAction,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Welcome);
