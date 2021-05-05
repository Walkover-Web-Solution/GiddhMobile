import React from 'react';
import {GDContainer} from '@/core/components/container/container.component';
import {View, Text, TouchableOpacity, FlatList, DeviceEventEmitter, StatusBar} from 'react-native';
import style from './style';
import {connect} from 'react-redux';
import AsyncStorage from '@react-native-community/async-storage';
import {useIsFocused} from '@react-navigation/native';

import {getCompanyAndBranches} from '../../redux/CommonAction';
import Icon from '@/core/components/custom-icon/custom-icon';
import {Bars} from 'react-native-loader';
import color from '@/utils/colors';
import _ from 'lodash';
import {APP_EVENTS, STORAGE_KEYS} from '@/utils/constants';

interface Props {
  navigation: any;
}

export class ChangeCompany extends React.Component<Props> {
  constructor(props: MoreComponentProp) {
    super(props);
    this.state = {
      loading: false,
    };
  }
  FocusAwareStatusBar = (isFocused) => {
    return isFocused ? <StatusBar backgroundColor="#1A237E" barStyle="light-content" /> : null;
  };

  render() {
    let activeCompany = this.props.route.params.activeCompany;
    let companyList = this.props.comapnyList.sort((a, b) =>
      a.name.toUpperCase().split(' ')[0].localeCompare(b.name.toUpperCase().split(' ')[0]),
    );

    return (
      <GDContainer>
        {this.FocusAwareStatusBar(this.props.isFocused)}
        <View style={style.container}>
          <View style={{flex: 1, backgroundColor: 'rgba(87,115,255,0.03)'}}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <View style={{marginLeft: 20}}>
                <Icon
                  size={20}
                  name={'Backward-arrow'}
                  onPress={() => {
                    this.props.navigation.goBack();
                  }}
                />
              </View>

              <Text style={{fontSize: 20, margin: 20, fontFamily: 'AvenirLTStd-Black'}}>Switch Company</Text>
            </View>
            <FlatList
              data={companyList}
              showsVerticalScrollIndicator={false}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={style.listItem}
                  delayPressIn={0}
                  onPress={async () => {
                    await AsyncStorage.setItem(STORAGE_KEYS.activeCompanyUniqueName, item.uniqueName);
                    if (item.uniqueName !== activeCompany.uniqueName) {
                      await AsyncStorage.setItem(STORAGE_KEYS.activeBranchUniqueName, '');
                    }
                    this.props.getCompanyAndBranches();
                    DeviceEventEmitter.emit(APP_EVENTS.comapnyBranchChange, {});
                    this.props.navigation.popToTop();
                  }}>
                  <Text
                    style={[
                      style.listItemName,
                      {color: item.uniqueName == activeCompany.uniqueName ? color.PRIMARY_BASIC : 'black'},
                    ]}>
                    {item.name}
                  </Text>
                  {item.uniqueName == activeCompany.uniqueName && (
                    <View style={{height: 10, width: 10, borderRadius: 5, backgroundColor: color.PRIMARY_BASIC}}></View>
                  )}
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.uniqueName}
            />
            {/* <TouchableOpacity
              style={{height: 50, width: 100, backgroundColor: 'pink'}}
              onPress={() => console.log(companyList)}></TouchableOpacity> */}
          </View>
        </View>
        {this.state.loading && (
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
        )}
      </GDContainer>
    );
  }
}

function mapStateToProps(state) {
  const {commonReducer} = state;
  return {
    ...commonReducer,
  };
}
function mapDispatchToProps(dispatch) {
  return {
    getCompanyAndBranches: () => {
      dispatch(getCompanyAndBranches());
    },
  };
}

function Screen(props) {
  const isFocused = useIsFocused();

  return <ChangeCompany {...props} isFocused={isFocused} />;
}

const MyComponent = connect(mapStateToProps, mapDispatchToProps)(Screen);
export default MyComponent;
