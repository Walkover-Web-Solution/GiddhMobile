import React from 'react';
import { WithTranslation, withTranslation, WithTranslationProps } from 'react-i18next';
import { View, Text, TouchableOpacity, DeviceEventEmitter, ActivityIndicator, Switch } from 'react-native';
import { Country } from '@/models/interfaces/country';
import { BadgeTab } from '@/models/interfaces/badge-tabs';
import style from './style';
import _ from 'lodash';
import AsyncStorage from '@react-native-community/async-storage';
import { APP_EVENTS, STORAGE_KEYS } from '@/utils/constants';
import { Bars } from 'react-native-loader';
import color from '@/utils/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { EnableOfflineMode } from '@/utils/dbFunctions';
import Realm from 'realm';
import { RootDBOptions } from '@/Database';
import { ROOT_DB_SCHEMA } from '@/Database/AllSchemas/company-branch-schema';

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
  badgeTabs: BadgeTab[];
  offlineMode: boolean;
  activeCompany: any;
  activeBranch: any;
  isOfflineLoading: boolean;
};

class MoreComponent extends React.Component<MoreComponentProp, MoreComponentState> {
  constructor(props: MoreComponentProp) {
    super(props);
    this.state = {
      activeCompany: undefined,
      activeBranch: undefined,
      offlineMode: false,
      isOfflineLoading: false
    };
  }

  componentDidMount() {
    Realm.open(RootDBOptions).then(async (realm) => {
      const userEmail: any = await AsyncStorage.getItem(STORAGE_KEYS.googleEmail);
      // const object: any = realm.objectForPrimaryKey(ROOT_DB_SCHEMA, userEmail);
      // if (object) {
      //   this.setState({
      //     offlineMode: object.active
      //   });
      // }
    });
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.comapnyBranchChange, () => {
      this._getActiveCompany();
    });
    this._getActiveCompany();
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
            top: 0,
          }}>
          <Bars size={15} color={color.PRIMARY_NORMAL} />
        </View>
      );
    } else {
      return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
          {activeCompanyName && activeCompanyName.length > 1 ? (
            <TouchableOpacity
              style={style.companyView}
              onPress={() => {
                navigation.navigate('ChangeCompany', { activeCompany: this.state.activeCompany });
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
          ) : (
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
                navigation.navigate('BranchChange', {
                  branches: this.props.branchList,
                  activeBranch: this.state.activeBranch,
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
          <View style={{ paddingHorizontal: 10, marginLeft: 15, flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}>
            {this.state.isOfflineLoading ?
              <ActivityIndicator animating={this.state.isOfflineLoading} size={28} color='black' />
              : this.state.offlineMode ?
                <Ionicons name='checkmark-circle' size={28} color='#00ff00' />
                : <View style={{ width: 28 }} />
            }
            <Text style={style.companyNameText} >Offline Mode</Text>
            {!this.state.offlineMode ?
              <Switch
                trackColor={{ false: '#c6c6c6', true: '#3cd968' }}
                thumbColor={this.state.offlineMode ? '#fff' : '#fff'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={async () => {
                  console.log('enabling offline mode');
                  this.setState({
                    isOfflineLoading: !this.state.isOfflineLoading
                  })
                  await EnableOfflineMode(this.props.companyList);
                  console.log('offline mode activated');
                  this.setState({
                    offlineMode: true,
                    isOfflineLoading: false
                  })
                }}
                value={this.state.isOfflineLoading}
                disabled={this.state.isOfflineLoading}
              />
              : null
            }
          </View>
          {/* <TouchableOpacity
            style={{height: 50, width: 150, backgroundColor: 'pink'}}
            onPress={() => alert(this.props.isInternetReachable)}></TouchableOpacity> */}
          {/* <Switch
            // style={{position: 'absolute', left: 0, alignSelf: 'center'}}
            trackColor={{ false: '#c6c6c6', true: '#3cd968' }}
            thumbColor={this.props.offlineModeOn ? '#fff' : '#fff'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={() =>
              this.props.offlineModeOn ? this.props.turnOffOfflineMode() : this.props.turnOnOfflineMode()
            }
            value={this.props.offlineModeOn}
          /> */}

          <TouchableOpacity
            style={{
              height: 60,
              width: '100%',
              backgroundColor: 'white',
              flexDirection: 'row',
              position: 'absolute',
              bottom: 10,
              alignItems: 'center',
              paddingHorizontal: 30,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 1,
              },
              shadowOpacity: 0.22,
              shadowRadius: 2.22,
              elevation: 3,
            }}
            onPress={this.props.logout}
          // onPress={() => console.log('working ?')}
          >
            <Ionicons name="ios-power" size={26} color={'#5773FF'} />
            <Text style={{ fontFamily: 'AvenirLTStd-Black', marginLeft: 20 }}>Logout</Text>
          </TouchableOpacity>
          {/* <MoreList />
          {
        <Text style={{marginLeft: 20, fontSize: 20, fontWeight: 'bold', marginTop: 10}}>Menus</Text>
        <MenuList navigation={navigation} />
        <Text style={{marginLeft: 20, fontSize: 20, fontWeight: 'bold', marginTop: 10}}>Help</Text>
        <HelpList navigation={navigation} />
        <Text style={{marginLeft: 20, fontSize: 20, fontWeight: 'bold', marginTop: 10}}>Others</Text>
         */}
          {/* <TouchableOpacity
            onPress={() => this.props.navigation.navigate('SalesInvoiceScreen')}
            style={{height: 50, width: 150, backgroundColor: 'pink'}}></TouchableOpacity> */}
        </View>
      );
    }
  }
}

export default withTranslation()(MoreComponent);
