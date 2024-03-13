import React from 'react';
import { WithTranslation, withTranslation, WithTranslationProps } from 'react-i18next';
import { View, Text, TouchableOpacity, DeviceEventEmitter, Linking, Platform, ToastAndroid,Dimensions, EmitterSubscription } from 'react-native';
import { Country } from '@/models/interfaces/country';
import Icon from '@/core/components/custom-icon/custom-icon';
import { BadgeTab } from '@/models/interfaces/badge-tabs';
import style from './style';
import _ from 'lodash';
import AsyncStorage from '@react-native-community/async-storage';
import { APP_EVENTS, FONT_FAMILY, STORAGE_KEYS } from '@/utils/constants';
import { Bars } from 'react-native-loader';
import color from '@/utils/colors';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import WebView from 'react-native-webview';
import Modal from 'react-native-modal';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Clipboard from '@react-native-community/clipboard';
import TOAST from 'react-native-root-toast';
const { height } = Dimensions.get('window');

type MoreComponentProp = WithTranslation &
  WithTranslationProps & {
    countries: Country[];
    isCountriesLoading: boolean;
    getCountriesAction: Function;
    logoutAction: Function;
    navigation: any;
    companyList: any;
  };

type MoreComponentState = {
  // badgeTabs: BadgeTab[];
  userName: string,
  activeUserEmail: string,
  copiedText: string,
  isModalVisible: boolean,
  activeCompany: any,
  activeBranch: any
};

class MoreComponent extends React.Component<MoreComponentProp, MoreComponentState> {
  constructor(props: MoreComponentProp) {
    super(props);
    this.state = {
      activeCompany: undefined,
      activeBranch: undefined,
      userName: '',
      activeUserEmail: '',
      isModalVisible: false,
      copiedText: '',
    };
  }

  componentDidMount() {
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.comapnyBranchChange, () => {
      this._getActiveCompany();
    });
    this._getActiveCompany();
    const getUserDetails = async () => {
      let activeUserEmail = await AsyncStorage.getItem(STORAGE_KEYS.googleEmail)
      let userName = await AsyncStorage.getItem(STORAGE_KEYS.userName)
      if (userName == null) {
        userName = ""
      }
      if (activeUserEmail == null) {
        activeUserEmail = ""
      }
      this.setState({ userName, activeUserEmail })
    }
    getUserDetails()
  }

  componentDidUpdate() {
    // this._getActiveCompany();
  }

  changeLanguage = () => {
    this.props.i18n.changeLanguage('hi');
  };

  selectedTab = async (tab: BadgeTab, index: number) => {
    // eslint-disable-next-line no-shadow
    this.state.badgeTabs.forEach((tab: BadgeTab) => {
      tab.isActive = false;
    });
    tab.isActive = !tab.isActive;
    this.state.badgeTabs[index] = tab;
    this.setState({ badgeTabs: this.state.badgeTabs });
  };

  async _getActiveCompany() {
    const activeCompany = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyUniqueName);
    const activeBranch = await AsyncStorage.getItem(STORAGE_KEYS.activeBranchUniqueName);

    const companyResults = _.find(this.props.companyList, function (item) {
      return item.uniqueName == activeCompany;
    });
    if (companyResults) {
      this.setState({ activeCompany: companyResults });
    } else {
      this.setState({ activeCompany: undefined });
    }
    const branchResults = _.find(this.props.branchList, function (item) {
      return item.uniqueName == activeBranch;
    });
    if (branchResults) {
      this.setState({ activeBranch: branchResults });
    } else {
      this.setState({ activeBranch: undefined });
    }
  }

  getInitails(name) {
    const allWords = name.split(' ');
    if (allWords.length > 2) {
      const twoLaterWord = allWords[0] + ' ' + allWords[allWords.length - 1];
      return twoLaterWord
        .split(' ')
        .map((n) => n[0])
        .join('');
    } else {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('');
    }
  }

  func1 = async () => {
    const activeCompany = await AsyncStorage.getItem(STORAGE_KEYS.activeBranchUniqueName);
    // const activeCompany = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyUniqueName);
    console.log(activeCompany);
    // console.log(this.props.companyList);
  };

  contactUsModal = () => {
    return (
      <Modal
        isVisible={this.state.isModalVisible}
        backdropColor={'#000'}
        backdropOpacity={0.7}
        animationIn={'zoomIn'}
        animationOut={'zoomOut'}
        animationOutTiming={200}
        deviceHeight={height + 50}
        onBackdropPress={() => {
          this.setState({ isModalVisible: false })
        }}
      >
          <WebView
            containerStyle={style.modalView}
            source={{ uri: 'https://calendly.com/sales-accounting-software/talk-to-sale' }}
            originWhitelist={['*']}
            scrollEnabled={false}
            startInLoadingState={true}
            renderLoading={() => <View style={style.renderLoadingView}><Bars size={15} color={color.PRIMARY_NORMAL} /></View>}
            renderError={() => {
              return (
                <View style={style.renderErrorView}>
                  <Text style={style.renderErrorText}>Something Went Wrong.</Text>
                  <Text style={style.renderErrorText}>Please Try Again.</Text>
                </View>
              )
            }}
          />
      </Modal>
    )
  }

  copyEmailButton = (email: string) => {
    return (
      <TouchableOpacity
        onPress={() => {
          Clipboard.setString(email);
          Platform.OS == "ios" ? TOAST.show('Email Copied to Clipboard', {
            duration: TOAST.durations.LONG,
            position: -150,
            hideOnPress: true,
            backgroundColor: "#1E90FF",
            textColor: "white",
            opacity: 1,
            shadow: false,
            animation: true,
            containerStyle: { borderRadius: 10 }
          }) :
            ToastAndroid.show('Email Copied to Clipboard', ToastAndroid.LONG)
        }}
      >
        <AntDesign name="copy1" size={20} color={'#1A237E'} style={{ marginLeft: 10 }} />
      </TouchableOpacity>
    )
  }

  render() {
    const activeCompanyName = this.state.activeCompany ? this.state.activeCompany.name : '';
    const activeBranchName = this.state.activeBranch ? this.state.activeBranch.alias : '';
    const { navigation } = this.props;
    if (this.props.isFetchingCompanyList) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            top: 0
          }}>
          <Bars size={15} color={color.PRIMARY_NORMAL} />
        </View>
      );
    } else {
      return (
        <View style={{ flex: 1, backgroundColor: 'white' }} >
          <View style={{flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              style={{ padding: 20 }}
              onPress={() => {
                this.props.navigation.goBack();
              }}>
              <Icon name={'Backward-arrow'} size={18} color={'#1C1C1C'} />
            </TouchableOpacity>
            <Text style={style.headerText}>More</Text>
          </View>
          {activeCompanyName && activeCompanyName.length > 1
            ? (
              <TouchableOpacity
                style={style.companyView}
                onPress={() => {
                  navigation.navigate('ChangeCompany', {
                    screen: 'ChangeCompany',
                    initial: false,
                    params: { activeCompany: this.state.activeCompany }
                  });
                }}>
                <View style={style.companyShortView}>
                  <Text style={style.companyShortText}>{this.getInitails(activeCompanyName)}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 1, alignItems: 'center' }}>
                  <Text numberOfLines={1} style={style.companyNameText}>
                    {activeCompanyName}
                  </Text>

                  <Entypo name="chevron-right" size={26} color={'#1A237E'} />
                  {/* <GdSVGIcons.arrowRight style={style.iconStyle} width={18} height={18} /> */}
                </View>
              </TouchableOpacity>
            )
            : (
              <View style={style.companyView}>
                <View style={style.companyShortView}>
                  <Text style={style.companyShortText}>{this.getInitails(activeCompanyName)}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 1 }}>
                  <Text style={style.companyNameText}>{activeCompanyName}</Text>
                </View>
              </View>
            )}
          {
            // Switch Branch
          }
          {this.props.branchList && this.props.branchList.length > 1 && (
            <TouchableOpacity
              style={style.branchView}
              onPress={() => {
                navigation.navigate('ChangeCompanyBranch', {
                  screen: 'BranchChange',
                  initial: false,
                  params: {
                    activeBranch: this.state.activeBranch,
                    branches: this.props.branchList
                  }
                });
              }}>
              <View style={{ marginLeft: 15 }}>
                <MaterialIcons name="compare-arrows" size={26} color={'#1A237E'} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 1, alignItems: 'center' }}>
                <Text style={style.companyNameText}>
                  {activeBranchName.length > 0 ? 'Switch Branch (' + activeBranchName + ')' : 'Switch Branch'}
                </Text>

                <Entypo name="chevron-right" size={26} color={'#1A237E'} />
              </View>
            </TouchableOpacity>
          )}

          {/* ------------ Contact Us View ------------ */}
          <View style={style.contactUsView}>
            <View style={{ margin: 15 }}>
              <Text style={style.contactUsText}>
                Contact Us
              </Text>
              <View style={style.emailField}>
                <Text style={style.contactDtailsText}>
                  {"Sales: "}
                </Text>
                <Text style={style.contactDtailsText} onPress={() => { Linking.openURL('mailto:sales@giddh.com') }}>
                  sales@giddh.com
                </Text>
                {this.copyEmailButton('sales@giddh.com')}
              </View>
              <View style={style.emailField}>
                <Text style={style.contactDtailsText}>
                  {"Support: "}
                </Text>
                <Text style={style.contactDtailsText} onPress={() => { Linking.openURL('mailto:support@giddh.com') }}>
                  support@giddh.com
                </Text>
                {this.copyEmailButton('support@giddh.com')}
              </View>
              <TouchableOpacity
                style={[style.contactUsButtons, { marginBottom: 0, flexDirection: 'row' }]}
                onPress={() => {
                  this.setState({ isModalVisible: true })
                }}
              >
                <Icon name={'Calendar'} color={'#1A237E'} size={18} style={{ marginLeft: 13, marginRight: 3 }} />
                <Text style={style.buttonText}>
                  Schedule A Meet
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[style.contactUsButtons, { flexDirection: 'row' }]}
                onPress={() => DeviceEventEmitter.emit("showHelloWidget", { status: true })}
              >
                <MaterialIcons name="support-agent" size={25} color={'#1A237E'} style={{ marginLeft: 10 }} />
                <Text style={style.buttonText}>
                  Chat With Us
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={{
              height: 65,
              width: '100%',
              backgroundColor: 'white',
              //flexDirection: 'row',
              position: 'absolute',
              bottom: 10,
              //alignItems: 'center',
              paddingHorizontal: 30,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 1
              },
              shadowOpacity: 0.22,
              shadowRadius: 2.22,
              elevation: 3
            }}
            onPress={this.props.logout}
          >
            <View style={{
              flexDirection: "row",
              alignItems: "center", marginTop: 10
            }}>
              <Feather name="power" size={26} color={'#5773FF'} />
              <Text style={{ fontFamily: 'AvenirLTStd-Black', marginLeft: 20 }}>Logout</Text>
            </View>
            <Text style={{ fontFamily: 'AvenirLTStd-Book', marginLeft: 41.5 }}> {this.state.activeUserEmail}  </Text>
          </TouchableOpacity>
          {this.contactUsModal()}
        </View>
      );
    }
  }
}

export default withTranslation()(MoreComponent);
