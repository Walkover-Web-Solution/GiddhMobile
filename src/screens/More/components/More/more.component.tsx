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

type MoreComponentProp = WithTranslation &
  WithTranslationProps & {
    countries: Country[];
    isCountriesLoading: boolean;
    getCountriesAction: Function;
    logoutAction: Function;
    navigation: any;
  };

type MoreComponentState = {
  badgeTabs: BadgeTab[];
};

class MoreComponent extends React.Component<MoreComponentProp, MoreComponentState> {
  constructor(props: MoreComponentProp) {
    super(props);
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

  render() {
    const {navigation} = this.props;
    return (
      <ScrollView>
        <View style={style.companyView}>
          <View style={style.companyShortView}>
            <Text style={style.companyShortText}>WW</Text>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', flex: 1}}>
            <Text style={style.companyNameText}>Walkover Web Solutions</Text>
            <TouchableOpacity delayPressIn={0} onPress={() => navigation.navigate('ChangeCompany')}>
              <GdSVGIcons.arrowRight style={style.iconStyle} width={18} height={18} />
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
