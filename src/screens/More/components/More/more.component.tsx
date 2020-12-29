import React from 'react';
import {WithTranslation, withTranslation, WithTranslationProps} from 'react-i18next';
import {ScrollView, View, Text, TouchableOpacity, Alert} from 'react-native';
import {Country} from '@/models/interfaces/country';

import MoreList from '@/screens/More/components/More/more-list.component';
import MenuList from '@/screens/More/components/More/menu-list.component';
import HelpList from '@/screens/More/components/More/help-list.component';
import OtherList from '@/screens/More/components/More/other-list.component';
import {BadgeTab} from '@/models/interfaces/badge-tabs';
import style from './style';
import {GdSVGIcons} from '@/utils/icons-pack';
import _ from 'lodash';
import {company} from '../../../../core/store/company/index';
import AsyncStorage from '@react-native-community/async-storage';
import {STORAGE_KEYS} from '@/utils/constants';
import Icon from '@/core/components/custom-icon/custom-icon';

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
      activeCompany: '',
    };
  }

  componentDidMount() {
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
    this.setState({badgeTabs: this.state.badgeTabs});
  };

  async _getActiveCompany() {
    const activeCompany = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyUniqueName);
    debugger;
    var result = _.find(this.props.companyList, function (item) {
      return item.uniqueName == activeCompany;
    });
    if (result) {
      this.setState({activeCompany: result});
    }
  }

  render() {
    const {navigation} = this.props;
    return (
      <ScrollView>
        <View style={style.companyView}>
          <View style={style.companyShortView}>
            <Text style={style.companyShortText}>
              {this.state.activeCompany
                ? this.state.activeCompany.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                : ''}
            </Text>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', flex: 1}}>
            <Text style={style.companyNameText}>{this.state.activeCompany ? this.state.activeCompany.name : ''}</Text>
            <TouchableOpacity delayPressIn={0} onPress={() => navigation.navigate('ChangeCompany')}>
              <Icon name={'arrowRight'} size={20} color={'#1A237E'} />
            </TouchableOpacity>
          </View>
        </View>
        <MoreList />
        <Text style={{marginLeft: 20, fontSize: 20, fontWeight: 'bold', marginTop: 10}}>Menus</Text>
        <MenuList navigation={navigation} />
        <Text style={{marginLeft: 20, fontSize: 20, fontWeight: 'bold', marginTop: 10}}>Help</Text>
        <HelpList navigation={navigation} />
        <Text style={{marginLeft: 20, fontSize: 20, fontWeight: 'bold', marginTop: 10}}>Others</Text>
        <OtherList />
      </ScrollView>
    );
  }
}

export default withTranslation()(MoreComponent);
