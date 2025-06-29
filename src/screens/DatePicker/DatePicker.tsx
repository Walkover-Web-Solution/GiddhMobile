import React from 'react';

import { View, Dimensions, Text,StatusBar, Platform, TouchableOpacity } from 'react-native';
import styles from './style';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import Custom from './Custom';
import Period from './Period';
import colors from '@/utils/colors';
import { FONT_FAMILY, GD_FONT_SIZE } from '@/utils/constants';

const initialLayout = { width: Dimensions.get('window').width };

const CustomTabBar = ({ navigationState, jumpTo }) => {
  return (
    <View style={{ flexDirection: 'row', backgroundColor: 'white' }}>
      {navigationState.routes.map((route, index) => {
        const focused = navigationState.index === index;
        return (
          <TouchableOpacity
            key={route.key}
            style={{
              flex: 1,
              paddingVertical: 15,
              borderBottomWidth: 2,
              borderBottomColor: focused ? '#520EAD' : 'transparent',
              alignItems: 'center',
            }}
            onPress={() => jumpTo(route.key)}
          >
            <Text
              style={{
                color: focused ? '#520EAD' : '#D9D9D9',
                fontFamily: focused ? FONT_FAMILY.bold : FONT_FAMILY.regular,
                fontSize: GD_FONT_SIZE.medium,
              }}
            >
              {route.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export class AppDatePicker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      index: 0,
      routes: [
        { key: 'first', title: 'Period' },
        { key: 'second', title: 'Custom' }
      ]
    };
  }

  handleIndexChange = (index) => {
    this.setState({
      index
    });
  };

  renderTabBar = (props) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: '#520EAD' }}
      style={{ backgroundColor: 'white', elevation: 0, fontFamily:FONT_FAMILY.bold }}
      activeColor='#520EAD'
      inactiveColor='#D9D9D9'
      renderLabel={({ route, focused, color }) => (
        <View
          style={{
            borderTopEndRadius: 17,
            borderTopLeftRadius: 17,
            borderBottomLeftRadius: 17,
            borderColor: color,
            // paddingHorizontal: 10,
            width: Dimensions.get('window').width * 0.4,
            // height: Dimensions.get('window').height * 0.045,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 7,
            borderWidth: 1
          }}>
          <Text
            numberOfLines={1}
            style={{
              color: color,
              // fontFamily: focused ? 'AvenirLTStPd-Black' : 'AvenirLTStd-Book',
              fontWeight: focused ? 'bold' : 'normal'
            }}>
            {route.title}
          </Text>
        </View>
      )}
      
    />
  );

  render() {
    const FirstRoute = () => (
      <Period
        selectDate={this.props.route.params.selectDate}
        navigation={this.props.navigation}
        activeDateFilter={this.props.route.params.activeDateFilter}
        setActiveDateFilter={this.props.route.params.setActiveDateFilter}
      />
    );

    const SecondRoute = () => (
      <Custom
        selectDate={this.props.route.params.selectDate}
        navigation={this.props.navigation}
        startDate={this.props.route.params.startDate}
        endDate={this.props.route.params.endDate}
        setActiveDateFilter={this.props.route.params.setActiveDateFilter}
      />
    );

    const renderScene = SceneMap({
      first: FirstRoute,
      second: SecondRoute
      // third: ThirdRoute,
    });
    return (
      <View style={styles.container}>
        {this.props.route.params.DateRangeOnly ? SecondRoute()
          : <TabView
            navigationState={{ index: this.state.index, routes: this.state.routes }}
            renderScene={renderScene}
            onIndexChange={this.handleIndexChange}
            initialLayout={initialLayout}
            // swipeEnabled={false}
            renderTabBar={props => <CustomTabBar {...props}/>}
          />
        }
      </View>
    );
  }
}

export default AppDatePicker;
