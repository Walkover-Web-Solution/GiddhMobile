import React from 'react';
import { WithTranslation, withTranslation, WithTranslationProps } from 'react-i18next';
import { LogBox, View, Dimensions, Text } from 'react-native';
import { Country } from '@/models/interfaces/country';
import Transaction from '@/screens/Transaction/Transaction';
import Parties from '@/screens/Parties/Parties';

import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { FONT_FAMILY } from '@/utils/constants';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { connect } from 'react-redux';

LogBox.ignoreLogs([
  'VirtualizedLists should never be nested' // TODO: Remove when fixed
]);

type HomeComponentProp = WithTranslation &
  WithTranslationProps & {
    countries: Country[];
    isCountriesLoading: boolean;
    getCountriesAction: Function;
    logoutAction: Function;
    logout: Function;
  };

const FirstRoute = () => <Parties />;

const SecondRoute = () => <Transaction />;
// const ThirdRoute = () => <Inventory />;

const initialLayout = { width: Dimensions.get('window').width };
const renderScene = SceneMap({
  first: FirstRoute,
  second: SecondRoute
  // third: ThirdRoute,
});
class HomeComponent extends React.Component {
  constructor (props: HomeComponentProp) {
    super(props);
    this.state = {
      index: 0,
      routes: [
        { key: 'first', title: 'Parties' },
        { key: 'second', title: 'Transactions' }
      ]
    };
    // this.getPartiesSundryCreditors();
  }

  // async getPartiesSundryCreditors(){
  //   try {
  //     const creditors = await CommonService.getPartiesSundryCreditors();
  //     console.log(creditors.body.results);
  //   } catch (e) {
  //     console.log(e);
  //     if (e.data.code == "UNAUTHORISED") {
  //       this.setState({isValid:false});
  //     }
  //   }
  // }

  handleIndexChange = (index) => {
    this.setState({
      index
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
      indicatorStyle={{ backgroundColor: 'white' }}
      style={{ backgroundColor: 'white', elevation: 0 }}
      renderLabel={({ route, focused }) => (
        <View
          style={{
            borderTopEndRadius: 17,
            borderTopLeftRadius: 17,
            borderBottomLeftRadius: 17,
            borderColor: focused ? '#5773FF' : '#D9D9D9',
            // paddingHorizontal: 10,
            width: Dimensions.get('window').width * 0.4,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 7,
            borderWidth: 1
          }}>
          <Text
            numberOfLines={1}
            style={{
              color: focused ? '#5773FF' : '#808080',
              // fontFamily: focused ? 'AvenirLTStPd-Black' : 'AvenirLTStd-Book',
              fontWeight: focused ? 'bold' : 'normal'
            }}>
            {route.title}
          </Text>
        </View>
      )}
    />
  );

  render () {
    return (
      <View style={{ flex: 1 }}>
        {!this.props.isInvalid ? <TabView
          navigationState={{ index: this.state.index, routes: this.state.routes }}
          renderScene={renderScene}
          onIndexChange={this.handleIndexChange}
          initialLayout={initialLayout}
          // swipeEnabled={false}
          renderTabBar={this.renderTabBar}
        />
          : <View style={{ flex: 1, justifyContent: 'center' }}>
            <Text style={{ paddingHorizontal: 40, fontSize: 20, fontFamily: FONT_FAMILY.bold, textAlign: 'center', padding: 8 }}>Please Sign up through Giddh's web app first</Text>
            <TouchableOpacity
              onPress={this.props.logout}
              style={{ marginTop: 15, width: '90%', alignSelf: 'center', borderRadius: 20, justifyContent: 'center' }}>
              <Text style={{ color: '#5773FF', textAlign: 'center', fontSize: 16 }}>Exit</Text>
            </TouchableOpacity>
          </View>
        }
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  isInvalid: state.commonReducer.isUnauth
});
const mapDispatchToProps = () => ({
});

export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(HomeComponent));
