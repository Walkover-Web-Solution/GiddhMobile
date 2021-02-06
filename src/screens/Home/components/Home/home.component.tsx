import React from 'react';
import {WithTranslation, withTranslation, WithTranslationProps} from 'react-i18next';
import {Layout} from '@ui-kitten/components';
import {LogBox, ScrollView, View, Dimensions, Text} from 'react-native';
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

import {TabView, SceneMap, TabBar} from 'react-native-tab-view';

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

const FirstRoute = () => <Parties />;

const SecondRoute = () => <Transaction />;
// const ThirdRoute = () => <Inventory />;

const initialLayout = {width: Dimensions.get('window').width};
const renderScene = SceneMap({
  first: FirstRoute,
  second: SecondRoute,
  // third: ThirdRoute,
});
class HomeComponent extends React.Component {
  constructor(props: HomeComponentProp) {
    super(props);

    this.state = {
      // badgeTabs: BadgeTabs,
      // val: 0,
      index: 0,
      routes: [
        {key: 'first', title: 'Parties'},
        {key: 'second', title: 'Transactions'},
        // {key: 'third', title: 'Inventory'},
      ],
    };
  }

  handleIndexChange = (index) => {
    this.setState({
      index,
    });
  };

  // renderElement() {
  //   // return <Inventory />;
  //   //You can add N number of Views here in if-else condition
  //   if (this.state.val === 0) {
  //     //Return the FirstScreen as a child to set in Parent View
  //     return <Parties />;
  //   } else if (this.state.val === 1) {
  //     //Return the SecondScreen as a child to set in Parent View
  //     return <Transaction />;
  //   } else {
  //     //Return the ThirdScreen as a child to set in Parent View
  //     return <Inventory />;
  //   }
  // }

  // changeLanguage = () => {
  //   this.props.i18n.changeLanguage('hi');
  // };

  // selectedTab = async (tab: BadgeTab, index: number) => {
  //   // eslint-disable-next-line no-shadow
  //   this.state.badgeTabs.forEach((tab: BadgeTab) => {
  //     tab.isActive = false;
  //   });
  //   tab.isActive = !tab.isActive;
  //   this.state.badgeTabs[index] = tab;
  //   this.setState({badgeTabs: this.state.badgeTabs, val: index});
  // };
  renderTabBar = (props) => (
    <TabBar
      {...props}
      indicatorStyle={{backgroundColor: 'white'}}
      style={{backgroundColor: 'white', elevation: 0}}
      renderLabel={({route, focused, color}) => (
        <View
          style={{
            borderTopEndRadius: 17,
            borderTopLeftRadius: 17,
            borderBottomLeftRadius: 17,
            borderColor: focused ? '#5773FF' : '#D9D9D9',
            // paddingHorizontal: 10,
            width: Dimensions.get('window').width * 0.29,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 7,
            borderWidth: 1,
          }}>
          <Text
            numberOfLines={1}
            style={{
              color: focused ? '#5773FF' : '#808080',
              fontFamily: focused ? 'AvenirLTStPd-Black' : 'AvenirLTStd-Book',
              // fontWeight: focused ? 'bold' : 'normal',
            }}>
            {route.title}
          </Text>
        </View>
      )}
    />
  );
  render() {
    return (
      <View style={{flex: 1}}>
        <TabView
          navigationState={{index: this.state.index, routes: this.state.routes}}
          renderScene={renderScene}
          onIndexChange={this.handleIndexChange}
          initialLayout={initialLayout}
          swipeEnabled={false}
          renderTabBar={this.renderTabBar}
        />
      </View>
    );
  }
}

export default withTranslation()(HomeComponent);
