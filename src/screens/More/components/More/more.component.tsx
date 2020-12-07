import React from 'react';
import {WithTranslation, withTranslation, WithTranslationProps} from 'react-i18next';
import {ScrollView, View, Text} from 'react-native';
import {Country} from '@/models/interfaces/country';

import {BadgeTab} from '@/models/interfaces/badge-tabs';
import style from './style';
import {GdSVGIcons} from '@/utils/icons-pack';

type MoreComponentProp = WithTranslation &
  WithTranslationProps & {
    countries: Country[];
    isCountriesLoading: boolean;
    getCountriesAction: Function;
    logoutAction: Function;
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
    return (
      <>
          <ScrollView contentContainerStyle ={{flex:1}} horizontal={true}>
           <View style = {style.companyView}>
           <View style = {style.companyShortView}>
           <Text style={style.companyShortText}>WW</Text>
             </View>
             <View style={{flexDirection: 'row', justifyContent: 'space-between', flex:1}}>
             <Text style={style.companyNameText}>Walkover Web Solutions</Text>
             <GdSVGIcons.arrowRight style={style.iconStyle} width={18} height={18} />
               </View>
             </View>
          </ScrollView>
      </>
    );
  }
}

export default withTranslation()(MoreComponent);
