import React from 'react';
import {WithTranslation, withTranslation, WithTranslationProps} from 'react-i18next';
import {Layout} from '@ui-kitten/components';
import {LogBox, ScrollView, View} from 'react-native';
import {Country} from '@/models/interfaces/country';
import {BadgeButton} from '@/core/components/badge-button/badge-button.component';
import {TopCard} from '@/core/components/top-card/top-card.component';
import {BadgeTab} from '@/models/interfaces/badge-tabs';
import style from './style';
import {GDContainer} from '@/core/components/container/container.component';
import StatusBarComponent from '@/core/components/status-bar/status-bar.component';
import color from '@/utils/colors';
import Transaction from '@/screens/Transaction/Transaction';
import Parties from '@/screens/Parties/Parties';
import Inventory from '@/screens/Inventory/Inventory';

LogBox.ignoreLogs([
  'VirtualizedLists should never be nested', // TODO: Remove when fixed
]);

type HomeComponentProp = WithTranslation &
  WithTranslationProps & {
    countries: Country[];
    isCountriesLoading: boolean;
    getCountriesAction: Function;
    logoutAction: Function;
  };

type HomeComponentState = {
  badgeTabs: BadgeTab[];
  val: number;
};
const BadgeTabs: BadgeTab[] = [
  {
    label: 'Parties',
    isActive: true,
  },
  {
    label: 'Transactions',
    isActive: false,
  },
  // {
  //   label: 'Inventory',
  //   isActive: false,
  // },
];

class HomeComponent extends React.Component<HomeComponentProp, HomeComponentState> {
  constructor(props: HomeComponentProp) {
    super(props);

    this.state = {badgeTabs: BadgeTabs, val: 0};
  }

  renderElement() {
    //You can add N number of Views here in if-else condition
    if (this.state.val === 0) {
      //Return the FirstScreen as a child to set in Parent View
      return <Parties />;
    } else if (this.state.val === 1) {
      //Return the SecondScreen as a child to set in Parent View
      return <Transaction />;
    } else {
      //Return the ThirdScreen as a child to set in Parent View
      return <Inventory />;
    }
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
    this.setState({badgeTabs: this.state.badgeTabs, val: index});
  };

  render() {
    const {t} = this.props;
    return (
      <>
        <GDContainer>
          <StatusBarComponent backgroundColor={color.SECONDARY} barStyle="light-content" />
          <View style={style.topScroll}>
            <ScrollView horizontal={true}>
              <Layout style={style.cardContainer} level="1">
                <TopCard label={t('DEMO.SALES')} month={'Aug'} amount={'20,24,000.00'} icon="voucher" />
                <TopCard label={'Receipt'} month={'Aug'} amount={'4,000.00'} icon="voucher" />
                <TopCard label={'Purchase'} month={'Aug'} amount={'14,000.00'} icon="voucher" />
                <TopCard label={'Payment'} month={'Aug'} amount={'1,000.00'} icon="voucher" />
              </Layout>
            </ScrollView>
          </View>
          <View
            style={{
              // marginLeft: 15,
              // marginRight: 15,
              marginLeft: 70,
              marginRight: 70,
              marginTop: 10,
              display: 'flex',
              justifyContent: 'space-around',
              flexDirection: 'row',
              marginBottom: 15,
            }}>
            {this.state.badgeTabs.map((tab: BadgeTab, index: number) => (
              <BadgeButton label={tab.label} onPress={() => this.selectedTab(tab, index)} isActive={tab.isActive} />
            ))}
          </View>
          <ScrollView>
            <View>{this.renderElement()}</View>
          </ScrollView>
        </GDContainer>
      </>
    );
  }
}

export default withTranslation()(HomeComponent);
