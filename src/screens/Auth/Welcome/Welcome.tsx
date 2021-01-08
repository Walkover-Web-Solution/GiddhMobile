import React from 'react';
// import {Text} from '@ui-kitten/components';
import {connect} from 'react-redux';
import {GDContainer} from '@/core/components/container/container.component';
import {View, Text, Dimensions, ScrollView, Image} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import style from './style';
import routes from '@/navigation/routes';
import AsyncStorage from '@react-native-community/async-storage';
import {STORAGE_KEYS} from '@/utils/constants';

const Slide1 = () => {
  return (
    <View style={{width, height: '100%', alignItems: 'center'}}>
      <Image source={require('@/assets/images/slider1.png')} style={{resizeMode: 'contain', height: 250, width: 300}} />
      <Text style={{fontSize: 25, marginTop: 10, fontFamily: 'OpenSans-Bold'}}>Easy Billing on Mobile</Text>
      <Text style={{width: '80%', textAlign: 'center', color: 'grey', fontSize: 18, marginTop: 10}}>
        Create professional invoices and send them to your customers
      </Text>
    </View>
  );
};
const Slide2 = () => {
  return (
    <View style={{width, height: '100%', alignItems: 'center'}}>
      <Image source={require('@/assets/images/slider2.png')} style={{resizeMode: 'contain', height: 250, width: 300}} />
      <Text style={{fontFamily: 'OpenSans-Bold', fontSize: 25, marginTop: 10}}>Send Payment Reminders</Text>
      <Text style={{width: '80%', textAlign: 'center', color: 'grey', fontSize: 18, marginTop: 10}}>
        We alert you so that you can alert your customers when there are payment dues
      </Text>
    </View>
  );
};
const Slide3 = () => {
  return (
    <View style={{width, height: '100%', alignItems: 'center'}}>
      <Image source={require('@/assets/images/slider3.png')} style={{resizeMode: 'contain', height: 250, width: 300}} />
      <Text style={{fontFamily: 'OpenSans-Bold', fontSize: 25, marginTop: 10}}>Stock Management</Text>
      <Text style={{width: '80%', textAlign: 'center', color: 'grey', fontSize: 18, marginTop: 10}}>
        Track your inventory , manage product SKU's and more
      </Text>
    </View>
  );
};
const Slide4 = () => {
  return (
    <View style={{width, height: '100%', alignItems: 'center'}}>
      <Image source={require('@/assets/images/slider4.png')} style={{resizeMode: 'contain', height: 250, width: 300}} />
      <Text style={{fontFamily: 'OpenSans-Bold', fontSize: 25, marginTop: 10}}>All In One Accounting Tool</Text>
      <Text style={{width: '80%', textAlign: 'center', color: 'grey', fontSize: 18, marginTop: 10}}>
        File GST, get analutics report, view balance sheet and P&l
      </Text>
    </View>
  );
};

const {width, height} = Dimensions.get('window');
class Welcome extends React.Component<any, any> {
  private scrollRef;
  func1 = async () => {
    // AsyncStorage.clear();
    const activeCompany = await AsyncStorage.getItem(STORAGE_KEYS.token);
    console.log(activeCompany);
  };

  constructor(props: any) {
    super(props);
    this.scrollRef = React.createRef();
    this.state = {
      currentPage: 0,
    };
  }
  // const setSliderState = ()=>{
  //     this.setState(sliderState:{
  //         ...sliderState,
  //         currentPage: indexOfNextScreen
  //       })
  // }
  // componentDidMount() {
  //   setInterval(() => {
  //     this.setState(
  //       (prev) => ({currentPage: prev.currentPage == 3 ? 0 : prev.currentPage + 1}),
  //       () => {
  //         this.scrollRef.current.scrollTo({
  //           animated: true,
  //           y: 0,
  //           x: width * this.state.currentPage,
  //         });
  //         console.log('current page', this.state.currentPage);
  //       },
  //     );
  //   }, 3000);
  // }
  setSliderPage = (event: any) => {
    const {currentPage} = this.state;
    const {x} = event.nativeEvent.contentOffset;
    const indexOfNextScreen = Math.round(x / width);

    if (indexOfNextScreen !== currentPage) {
      this.setState(
        {
          currentPage: indexOfNextScreen,
        },
        // () => console.log('index of next scnreen', indexOfNextScreen),
      );
    }
  };
  render() {
    const {currentPage: pageIndex} = this.state;
    return (
      <View style={style.container}>
        <View style={{height: height * 0.7, width: width, marginTop: height * 0.1}}>
          <ScrollView
            // ref={this.scrollRef}
            style={{flex: 1}}
            horizontal={true}
            scrollEventThrottle={16}
            pagingEnabled={true}
            showsHorizontalScrollIndicator={false}
            onScroll={(event) => {
              this.setSliderPage(event);
            }}>
            <Slide1 />
            <Slide2 />
            <Slide3 />
            <Slide4 />
          </ScrollView>
        </View>
        <View style={style.paginationWrapper}>
          {Array.from(Array(4).keys()).map((key, index) => (
            <View style={[style.paginationDots, {opacity: pageIndex === index ? 1 : 0.2}]} key={index} />
          ))}
        </View>
        <View style={style.buttonContainer}>
          {/* <TouchableOpacity style={style.createAccountButton} delayPressIn={0} onPress={this.func1}>
            <Text style={style.createAccount}>Create Account</Text>
          </TouchableOpacity> */}
          <TouchableOpacity
            style={style.loginButton}
            delayPressIn={0}
            onPress={() => this.props.navigation.navigate(routes.Login)}>
            <Text style={style.login}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state: RootState) => {
  return {
    isLoginInProcess: state.LoginReducer.isAuthenticatingUser,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    // login: dispatch.auth.loginAction,
    // googleLogin: dispatch.auth.googleLoginAction,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Welcome);
