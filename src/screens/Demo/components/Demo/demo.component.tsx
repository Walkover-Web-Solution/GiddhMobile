import React from 'react';
import { WithTranslation, withTranslation, WithTranslationProps } from 'react-i18next';
import { Divider, Layout, TopNavigation } from '@ui-kitten/components';
import { ScrollView, View } from 'react-native';
import { GDButton } from '@/core/components/button/button.component';
import { ButtonShape, ButtonSize, ButtonType } from '@/models/enums/button';
import { Country } from '@/models/interfaces/country';
import { GDInput } from '@/core/components/input/input.component';
import { GDRoundedInput } from '@/core/components/input/rounded-input.component';
import { BadgeButton } from '@/core/components/badge-button/badge-button.component';
import { TopCard } from '@/core/components/top-card/top-card.component';
import { BadgeTab } from '@/models/interfaces/badge-tabs';
import style from './style';

type DemoComponentProp = WithTranslation &
  WithTranslationProps & {
    countries: Country[];
    isCountriesLoading: boolean;
    getCountriesAction: Function;
    logoutAction: Function;
  };

type DemoComponentState = {
  badgeTabs: BadgeTab[];
};
const BadgeTabs: BadgeTab[] = [
  {
    label: 'Parties',
    isActive: false
  },
  {
    label: 'Transactions',
    isActive: true
  },
  {
    label: 'Inventory',
    isActive: false
  }
];

class DemoComponent extends React.Component<DemoComponentProp, DemoComponentState> {
  constructor (props: DemoComponentProp) {
    super(props);
    this.state = { badgeTabs: BadgeTabs };
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

  render () {
    const { getCountriesAction, t, logoutAction } = this.props;
    return (
      <>
        <TopNavigation title="Giddh" alignment="center" />
        <Divider />

        <View style={style.topScroll}>
          <ScrollView horizontal={true}>
            <Layout style={style.cardContainer} level="1">
              <TopCard label={t('DEMO.SALES')} month={'Aug'} amount={'12,20,24,000.00'} icon="voucher" />
              <TopCard label={'Receipt'} month={'Aug'} amount={'4,000.00'} icon="voucher" />
              <TopCard label={'Purchase'} month={'Aug'} amount={'14,000.00'} icon="voucher" />
              <TopCard label={'Payment'} month={'Aug'} amount={'₹1,000.00'} icon="voucher" />
            </Layout>
          </ScrollView>
        </View>
        {/* <View style={style.countriesContainer}> */}
        {/*  <Text>{t('DEMO.TOTAL_COUNTRIES')} : </Text> */}
        {/*  {isCountriesLoading && <Spinner />} */}
        {/*  {!isCountriesLoading && <Text>{countries.length}</Text>} */}
        {/* </View> */}

        <Layout style={style.exampleContainer}>
          <View style={style.commonStyle}>
            <GDRoundedInput icon="company" label="Company Name" value="" placeholder="Company Name" />
          </View>

          <View style={style.commonStyle}>
            <GDInput icon="company" label="Company Name" enable={false} value="" placeholder="Company Name" />
          </View>
          <View style={style.commonStyle}>
            <GDButton label="+" type={ButtonType.secondary} shape={ButtonShape.circle} onPress={() => logoutAction()} />
          </View>
          <View style={style.commonStyle}>
            <GDButton
              label="Get Countries"
              size={ButtonSize.large}
              type={ButtonType.secondary}
              onPress={() => getCountriesAction()}
            />
          </View>

          <View style={style.commonStyle}>
            <GDButton label="Logout" size={ButtonSize.large} type={ButtonType.primary} onPress={() => logoutAction()} />
          </View>

          <View style={style.translationButton}>
            <GDButton label={'Change to Hindi'} onPress={this.changeLanguage} />
          </View>

          <View style={{ margin: 15, display: 'flex', justifyContent: 'space-between', flexDirection: 'row' }}>
            {this.state.badgeTabs.map((tab: BadgeTab, index: number) => (
              <BadgeButton label={tab.label} onPress={() => this.selectedTab(tab, index)} isActive={tab.isActive} />
            ))}
          </View>
        </Layout>
      </>
    );
  }
}

export default withTranslation()(DemoComponent);
