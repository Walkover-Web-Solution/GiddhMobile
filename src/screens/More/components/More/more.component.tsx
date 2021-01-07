import React from 'react';
import {WithTranslation, withTranslation, WithTranslationProps} from 'react-i18next';
import {ScrollView, View, Text, TouchableOpacity, DeviceEventEmitter} from 'react-native';
import {Country} from '@/models/interfaces/country';

import MoreList from '@/screens/More/components/More/more-list.component';
import MenuList from '@/screens/More/components/More/menu-list.component';
import HelpList from '@/screens/More/components/More/help-list.component';
import OtherList from '@/screens/More/components/More/other-list.component';
import {BadgeTab} from '@/models/interfaces/badge-tabs';
import style from './style';
import {GdSVGIcons} from '@/utils/icons-pack';
import _ from 'lodash';
import AsyncStorage from '@react-native-community/async-storage';
import Icon from '@/core/components/custom-icon/custom-icon';
import colors from '../../../../utils/colors';
import {APP_EVENTS, STORAGE_KEYS} from '@/utils/constants';
import {Bars} from 'react-native-loader';
import color from '@/utils/colors';

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
};

class MoreComponent extends React.Component<MoreComponentProp, MoreComponentState> {
  constructor(props: MoreComponentProp) {
    super(props);
    this.state = {
      activeCompany: undefined,
      activeBranch: undefined,
    };
  }

  componentDidMount() {
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.comapnyBranchChange, () => {
      this._getActiveCompany();
    });
    this._getActiveCompany();
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
    this.setState({badgeTabs: this.state.badgeTabs});
  };

  async _getActiveCompany() {
    const activeCompany = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyUniqueName);
    const activeBranch = await AsyncStorage.getItem(STORAGE_KEYS.activeBranchUniqueName);

    var companyResults = _.find(this.props.companyList, function (item) {
      return item.uniqueName == activeCompany;
    });
    if (companyResults) {
      this.setState({activeCompany: companyResults});
    } else {
      this.setState({activeCompany: undefined});
    }
    var branchResults = _.find(this.props.branchList, function (item) {
      return item.alias == activeBranch;
    });
    if (branchResults) {
      this.setState({activeBranch: branchResults});
    } else {
      this.setState({activeBranch: undefined});
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

  render() {
    const activeCompanyName = this.state.activeCompany ? this.state.activeCompany.name : '';
    const activeBranchName = this.state.activeBranch ? this.state.activeBranch.alias : '';

    const {navigation} = this.props;
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
        <View style={{flex: 1, backgroundColor: 'white'}}>
          {this.props.companyList && this.props.companyList.length > 1 ? (
            <TouchableOpacity
              style={style.companyView}
              onPress={() => {
                navigation.navigate('ChangeCompany', {activeCompany: this.state.activeCompany});
              }}>
              <View style={style.companyShortView}>
                <Text style={style.companyShortText}>{this.getInitails(activeCompanyName)}</Text>
              </View>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', flex: 1}}>
                <Text style={style.companyNameText}>{activeCompanyName}</Text>

                <Icon name={'arrowRight'} color="black" size={20} />
                {/* <GdSVGIcons.arrowRight style={style.iconStyle} width={18} height={18} /> */}
              </View>
            </TouchableOpacity>
          ) : (
            <View style={style.companyView}>
              <View style={style.companyShortView}>
                <Text style={style.companyShortText}>{this.getInitails(activeCompanyName)}</Text>
              </View>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', flex: 1}}>
                <Text style={style.companyNameText}>{activeCompanyName}</Text>
              </View>
            </View>
          )}
          {
            //Switch Branch
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
              <Icon name={'report'} size={20} style={style.leftView} color={colors.PRIMARY_BASIC} />
              <View style={{flexDirection: 'row', justifyContent: 'space-between', flex: 1}}>
                <Text style={style.companyNameText}>
                  {activeBranchName.length > 0 ? 'Switch Branch (' + activeBranchName + ')' : 'Switch Branch'}
                </Text>
                <TouchableOpacity delayPressIn={0}>
                  <Icon name={'arrowRight'} color="black" size={20} />
                  {/* <GdSVGIcons.arrowRight style={style.iconStyle} width={18} height={18} /> */}
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
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
            onPress={this.props.logout}>
            <Icon name={'Lock'} size={20} color={'#5773FF'} />
            <Text style={{fontFamily: 'Opel-Sans-Bold', marginLeft: 20}}>Logout</Text>
          </TouchableOpacity>
          {/* <MoreList />
          {
        <Text style={{marginLeft: 20, fontSize: 20, fontWeight: 'bold', marginTop: 10}}>Menus</Text>
        <MenuList navigation={navigation} />
        <Text style={{marginLeft: 20, fontSize: 20, fontWeight: 'bold', marginTop: 10}}>Help</Text>
        <HelpList navigation={navigation} />
        <Text style={{marginLeft: 20, fontSize: 20, fontWeight: 'bold', marginTop: 10}}>Others</Text>
         */}
        </View>
      );
    }
  }
}

export default withTranslation()(MoreComponent);
