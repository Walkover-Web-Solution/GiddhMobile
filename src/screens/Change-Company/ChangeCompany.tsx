import React from 'react';
import { GDContainer } from '@/core/components/container/container.component';
import { View, Text, TouchableOpacity, FlatList, DeviceEventEmitter, StatusBar, Platform } from 'react-native';
import style from './style';
import { connect } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';

import { getCompanyAndBranches, updateStateDetails } from '../../redux/CommonAction';
import Icon from '@/core/components/custom-icon/custom-icon';
import LoaderKit  from 'react-native-loader-kit';
import color from '@/utils/colors';
import _ from 'lodash';
import { APP_EVENTS, STORAGE_KEYS } from '@/utils/constants';
// import LogRocket from '@logrocket/react-native';
import Entypo from 'react-native-vector-icons/Entypo';


interface Props {
  navigation: any;
}
const SIZE = 48;

export class ChangeCompany extends React.Component<Props> {
  constructor(props: MoreComponentProp) {
    super(props);
    this.state = {
      loading: false
    };
  }

  FocusAwareStatusBar = (isFocused) => {
    return isFocused ? <StatusBar backgroundColor="#1A237E" barStyle={Platform.OS == 'ios' ? "dark-content" : "light-content"} /> : null;
  };

  /**
   * Add user deatils and current company to log Rocket
   * @param companyName 
   * @param BranchName 
   */
  addUserDeatilsToLogRocket = async (companyName: string, BranchName: string) => {
    var userName = await AsyncStorage.getItem(STORAGE_KEYS.userName)
    var userEmail = await AsyncStorage.getItem(STORAGE_KEYS.googleEmail)
    if (userName == null) {
      userName = "";
    }
    if (userEmail == null) {
      userEmail = "";
    }
    console.log("Current company and Branch name " + userName + " " + userEmail + " " + companyName + " " + BranchName)
    // LogRocket.identify(userEmail, {
    //   name: userName,
    //   email: userEmail,
    //   CompanyName: companyName,
    //   BranchName: BranchName,
    //   newUser: false
    // });
  }

  render() {
    const activeCompany = this.props.route.params.activeCompany;
    const companyList = this.props.comapnyList.sort((a, b) =>
      a.name.toUpperCase().split(' ')[0].localeCompare(b.name.toUpperCase().split(' ')[0])
    );

    return (
      <View style={{flex:1}}>
        <View style={style.container}>
          <View style={{ flex: 1, backgroundColor: 'rgba(87,115,255,0.03)' }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center'
              }}>
              <TouchableOpacity
                style={{marginLeft: 20}}
                hitSlop={{right: 20, left: 20, top: 10, bottom: 10}}
                onPress={() => {
                  this.props.navigation.goBack();
                }}
              >
                <Icon
                  size={20}
                  name={'Backward-arrow'}
                />
              </TouchableOpacity>
              <Text style={{ fontSize: 20, margin: 20, fontFamily: 'AvenirLTStd-Black' }}>Switch Company</Text>
            </View>
            <FlatList
              data={companyList}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={style.listItem}
                  delayPressIn={0}
                  onPress={async () => {
                    // await AsyncStorage.setItem(STORAGE_KEYS.activeCompanyCountryCode, item.subscription.country.countryCode);
                    await AsyncStorage.setItem(STORAGE_KEYS.activeCompanyUniqueName, item.uniqueName);
                    await AsyncStorage.setItem(STORAGE_KEYS.activeCompanyName, item.name);
                    
                    const activeBranch = await AsyncStorage.getItem(STORAGE_KEYS.activeBranchUniqueName);
                    if (item.uniqueName !== activeCompany.uniqueName) {
                      await AsyncStorage.setItem(STORAGE_KEYS.activeBranchUniqueName, " ");
                      // this.addUserDeatilsToLogRocket(item.name, " ")
                    }
                    
                    const payload = {
                      companyUniqueName : item.uniqueName,
                      lastState : "pages/home?queryParams=[object Object]"
                    }
                    this.props.getCompanyAndBranches();
                    this.props.updateStateDetails(payload);

                    item?.branchCount > 1 
                    ? this.props.navigation.navigate('ChangeCompanyBranch', {
                      screen: 'BranchChange',
                      initial: false,
                      params: {
                        activeBranch: activeBranch,
                        branches: this.props.branchList
                      }
                    })
                    : this.props.navigation.reset({
                        index: 0,
                        routes: [{ name: 'Home' }],
                      });
                  }}>
                  <Text
                    numberOfLines={2}
                    style={[
                      style.listItemName,
                      { color: item.uniqueName == activeCompany.uniqueName ? color.PRIMARY_BASIC : 'black' }
                    ]}>
                    {item.name}
                  </Text>
                  {item.uniqueName == activeCompany.uniqueName && (
                    <View style={{ height: 10, width: 10, borderRadius: 5, backgroundColor: color.PRIMARY_BASIC }}></View>
                  )}
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.uniqueName}
            />
            {/* <TouchableOpacity
              style={{height: 50, width: 100, backgroundColor: 'pink'}}
              onPress={() => console.log(companyList)}></TouchableOpacity> */}
          </View>
          {/* ------------ Create Company Button ----------- */}
          {/* <View style={{ alignItems: "flex-end", paddingBottom: 20, paddingHorizontal: 15 }}>
            <TouchableOpacity
              onPress={() => this.props.navigation.navigate('createCompany', { oldUser: true })}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                width: SIZE,
                height: SIZE,
                borderRadius: SIZE / 2,
                backgroundColor: '#5773FF',
                //bottom: SIZE / 2
              }}>
              <Entypo name="plus" size={24} color={'#fff'} />
            </TouchableOpacity>
          </View> */}
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
              top: 0
            }}>
            <LoaderKit
                style={{ width: 45, height: 45 }}
                name={'LineScale'}
                color={color.PRIMARY_NORMAL}
            />
          </View>
        )}
      </View>
    );
  }
}

function mapStateToProps(state) {
  const { commonReducer } = state;
  return {
    ...commonReducer
  };
}
function mapDispatchToProps(dispatch) {
  return {
    getCompanyAndBranches: () => {
      dispatch(getCompanyAndBranches());
    },
    updateStateDetails: (payload:any)=>{
      dispatch(updateStateDetails(payload))
    }
  };
}

function Screen(props) {
  const isFocused = useIsFocused();

  return <ChangeCompany {...props} isFocused={isFocused} />;
}

const MyComponent = connect(mapStateToProps, mapDispatchToProps)(Screen);
export default MyComponent;

