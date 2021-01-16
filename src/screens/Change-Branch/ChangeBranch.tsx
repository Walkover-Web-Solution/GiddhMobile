import React from 'react';
import {GDContainer} from '@/core/components/container/container.component';
import {View, Text, TouchableOpacity, FlatList, DeviceEventEmitter} from 'react-native';
import style from './style';
import {connect} from 'react-redux';
import {APP_EVENTS, STORAGE_KEYS} from '@/utils/constants';
import AsyncStorage from '@react-native-community/async-storage';

import {getCompanyAndBranches} from '../../redux/CommonAction';
import Icon from '@/core/components/custom-icon/custom-icon';
import color from '@/utils/colors';

interface Props {
  navigation: any;
}

export class ChangeBranch extends React.Component<Props> {
  render() {
    let branches = this.props.route.params.branches;
    let activeBranch = this.props.route.params.activeBranch;

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
            <Text style={{fontSize: 20, margin: 20, fontFamily: 'AvenirLTStd-Black-Bold'}}>Switch Branch</Text>
          </View>
          <TouchableOpacity
            style={{justifyContent: 'center', alignItems: 'center'}}
            onPress={async () => {
              await AsyncStorage.setItem(STORAGE_KEYS.activeBranchUniqueName, '');
              DeviceEventEmitter.emit(APP_EVENTS.comapnyBranchChange, {});
              this.props.getCompanyAndBranches();
              this.props.navigation.goBack();
            }}>
            <Text style={style.goToCompanyText}>Go To Company</Text>
          </TouchableOpacity>
          <FlatList
            data={branches}
            showsVerticalScrollIndicator={false}
            style={{flex: 1}}
            renderItem={({item}) => (
              <TouchableOpacity
                style={style.listItem}
                delayPressIn={0}
                onPress={async () => {
                  await AsyncStorage.setItem(STORAGE_KEYS.activeBranchUniqueName, item.alias);
                  this.props.getCompanyAndBranches();
                  DeviceEventEmitter.emit(APP_EVENTS.comapnyBranchChange, {});
                  this.props.navigation.goBack();
                }}>
                <Text style={style.listItemName}>{item.alias}</Text>
                {activeBranch && item.uniqueName == activeBranch.uniqueName && (
                  <Icon name={'discount'} color={color.PRIMARY_BASIC} size={15} style={{alignself: 'center'}} />
                )}
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.uniqueName}
          />
        </View>
      </GDContainer>
    );
  }
}

function mapStateToProps(state) {
  return {};
}
function mapDispatchToProps(dispatch) {
  return {
    getCompanyAndBranches: () => {
      dispatch(getCompanyAndBranches());
    },
  };
}

const MyComponent = connect(mapStateToProps, mapDispatchToProps)(ChangeBranch);
export default MyComponent;
