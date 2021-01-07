import React from 'react';
import {GDContainer} from '@/core/components/container/container.component';
import {View, Text, TouchableOpacity, FlatList, DeviceEventEmitter} from 'react-native';
import style from './style';
import {connect} from 'react-redux';
import AsyncStorage from '@react-native-community/async-storage';

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
  render() {
    let activeCompany = this.props.route.params.activeCompany;

    return (
      <GDContainer>
        <View style={style.container}>
          <View style={{flexDirection: 'row', alignItems: 'center', marginLeft: 20}}>
            <Icon
              size={20}
              name={'Backward'}
              onPress={() => {
                this.props.navigation.goBack();
              }}
            />
            <Text style={{fontSize: 20, margin: 20, fontFamily: 'OpenSans-Bold'}}>Switch Company</Text>
          </View>
          <FlatList
            data={this.props.comapnyList}
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
                  <Icon name={'discount'} color={color.PRIMARY_BASIC} size={15} style={{alignself: 'center'}} />
                )}
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.uniqueName}
          />
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

const MyComponent = connect(mapStateToProps, mapDispatchToProps)(ChangeCompany);
export default MyComponent;
