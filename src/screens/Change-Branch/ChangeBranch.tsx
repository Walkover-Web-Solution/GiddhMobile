import React from 'react';
import { GDContainer } from '@/core/components/container/container.component';
import { View, Text, TouchableOpacity, FlatList, DeviceEventEmitter, StatusBar,Alert } from 'react-native';
import style from './style';
import { connect } from 'react-redux';
import { APP_EVENTS, STORAGE_KEYS } from '@/utils/constants';
import AsyncStorage from '@react-native-community/async-storage';
import { useIsFocused } from '@react-navigation/native';

import { getCompanyAndBranches } from '../../redux/CommonAction';
import Icon from '@/core/components/custom-icon/custom-icon';
import color from '@/utils/colors';
import LogRocket from '@logrocket/react-native';

interface Props {
  navigation: any;
}

export class ChangeBranch extends React.Component<Props> {
  FocusAwareStatusBar = (isFocused) => {
    return isFocused ? <StatusBar backgroundColor="#1A237E" barStyle="light-content" /> : null;
  };

  /**
   * Add user deatils and current company to log Rocket
   * @param companyName 
   * @param BranchName 
   */
   addUserDeatilsToLogRocket = async (companyName: string, BranchName: string) => {
    var userName  = await AsyncStorage.getItem(STORAGE_KEYS.userName)
    var userEmail = await AsyncStorage.getItem(STORAGE_KEYS.googleEmail)
    if(userName==null){
      userName = "";
    }
    if(userEmail==null){
      userEmail = "";
    }
    LogRocket.identify(userEmail, {
      name: userName,
      email: userEmail,
      CompanyName:companyName,
      BranchName:BranchName
    });
  }

  render () {
    const branches = this.props.route.params.branches.sort((a, b) =>
      a.alias.toUpperCase().split(' ')[0].localeCompare(b.alias.toUpperCase().split(' ')[0])
    );
    const activeBranch = this.props.route.params.activeBranch;

    return (
      <GDContainer>
        {this.FocusAwareStatusBar(this.props.isFocused)}
        <View style={style.container}>
          <View style={{ flex: 1, backgroundColor: 'rgba(87,115,255,0.03)' }}>
            {/* <TouchableOpacity
              style={{height: 40, width: 140, backgroundColor: 'pink'}}
              onPress={() => console.log(branches)}></TouchableOpacity> */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 20 }}>
              <Icon
                size={20}
                name={'Backward-arrow'}
                onPress={() => {
                  this.props.navigation.goBack();
                }}
              />
              <Text style={{ fontSize: 20, margin: 20, fontFamily: 'AvenirLTStd-Black' }}>Switch Branch</Text>
            </View>
            <TouchableOpacity
              style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}
              onPress={async () => {
                await AsyncStorage.setItem(STORAGE_KEYS.activeBranchUniqueName, '');
                DeviceEventEmitter.emit(APP_EVENTS.comapnyBranchChange, {});
                // this.props.getCompanyAndBranches();
                this.props.navigation.goBack();
              }}>
              <Text style={style.goToCompanyText}>Go To Company</Text>
            </TouchableOpacity>
            <FlatList
              data={branches}
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={style.listItem}
                  delayPressIn={0}
                  onPress={async () => {
                    await AsyncStorage.setItem(STORAGE_KEYS.activeBranchUniqueName, item.uniqueName);
                    await this.addUserDeatilsToLogRocket(item.name,item.alias)
                    this.props.getCompanyAndBranches();
                    DeviceEventEmitter.emit(APP_EVENTS.comapnyBranchChange, {});
                    this.props.navigation.goBack();
                  }}>
                  <Text style={style.listItemName}>{item.alias}</Text>
                  {activeBranch && item.uniqueName == activeBranch.uniqueName && (
                    // <Icon name={'discount'} color={color.PRIMARY_BASIC} size={15} style={{alignself: 'center'}} />
                    <View style={{ height: 10, width: 10, borderRadius: 5, backgroundColor: color.PRIMARY_BASIC }}></View>
                  )}
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.uniqueName}
            />
          </View>
        </View>
      </GDContainer>
    );
  }
}

function mapStateToProps (state) {
  return {};
}
function mapDispatchToProps (dispatch) {
  return {
    getCompanyAndBranches: () => {
      dispatch(getCompanyAndBranches());
    }
  };
}

function Screen (props) {
  const isFocused = useIsFocused();

  return <ChangeBranch {...props} isFocused={isFocused} />;
}

// export default connect(mapStateToProps)(Screen);
const MyComponent = connect(mapStateToProps, mapDispatchToProps)(Screen);
export default MyComponent;
