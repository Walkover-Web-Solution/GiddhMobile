import React from 'react';
import { GDContainer } from '@/core/components/container/container.component';
import { View, Text, TouchableOpacity, FlatList, DeviceEventEmitter, StatusBar ,Platform} from 'react-native';
import style from './style';
import { connect } from 'react-redux';
import { APP_EVENTS, STORAGE_KEYS } from '@/utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';

import { getCompanyAndBranches, updateBranchStateDetails } from '../../redux/CommonAction';
import Icon from '@/core/components/custom-icon/custom-icon';
import color from '@/utils/colors';
// import LogRocket from '@logrocket/react-native';
import Loader from '@/components/Loader';

interface Props {
  navigation: any;
}

export class ChangeBranch extends React.Component<Props> {
  FocusAwareStatusBar = (isFocused) => {
    return isFocused ? <StatusBar backgroundColor="#1A237E" barStyle={Platform.OS=='ios'?"dark-content":"light-content"} /> : null;
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
    console.log("Current company and Branch name "+userName+" "+userName+" "+companyName+" "+BranchName)
    // LogRocket.identify(userEmail, {
    //   name: userName,
    //   email: userEmail,
    //   CompanyName:companyName,
    //   BranchName:BranchName,
    //   newUser:false
    // });
  }

  render () {
    const branches = this.props?.branchList?.sort((a, b) =>
      a.alias.toUpperCase().split(' ')[0].localeCompare(b.alias.toUpperCase().split(' ')[0])
    );

    const activeBranch = this.props.route.params.activeBranch;

    return (
      // <GDContainer>
      <View style={{flex:1}}>

        {/* {this.FocusAwareStatusBar(this.props.isFocused)} */}
        <View style={style.container}>
          <View style={{ flex: 1, backgroundColor: 'rgba(87,115,255,0.03)' }}>
            {/* <TouchableOpacity
              style={{height: 40, width: 140, backgroundColor: 'pink'}}
              onPress={() => console.log(branches)}></TouchableOpacity> */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 20 }}>
              <TouchableOpacity
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
              <Text style={{ fontSize: 20, margin: 20, fontFamily: 'AvenirLTStd-Black' }}>Switch Branch</Text>
            </View>
            <TouchableOpacity
              style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}
              onPress={async () => {
                await AsyncStorage.setItem(STORAGE_KEYS.activeBranchUniqueName, " ");
                DeviceEventEmitter.emit(APP_EVENTS.comapnyBranchChange, {});
                DeviceEventEmitter.emit(APP_EVENTS.consolidateBranch, {activeBranch : " "})
                // this.props.getCompanyAndBranches();
                this.props.navigation.goBack();
              }}>
              <Text style={style.goToCompanyText}>Go To Company</Text>
            </TouchableOpacity>
            
            { !this.props.isFetchingCompanyList ? <FlatList
              data={branches}
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                style={style.listItem}
                delayPressIn={0}
                onPress={async () => {
                  const activeCompany = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyUniqueName);
                  await AsyncStorage.setItem(STORAGE_KEYS.activeBranchUniqueName, item.uniqueName);
                  const payload = {
                    body : {
                      companyUniqueName: activeCompany,
                      lastState: "pages/home"
                    },
                    branchUniqueName : item.uniqueName
                  }
                  // this.addUserDeatilsToLogRocket(item.name,item.alias)
                  this.props.getCompanyAndBranches();
                  this.props.updateBranchStateDetails(payload);
                  this.props.navigation.reset({
                    index: 0,
                    routes: [{ name: 'Home' }],
                  });
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
              : <Loader isLoading={ this.props.isFetchingCompanyList }/>}
          </View>
        </View>
        </View>
      // </GDContainer>
    );
  }
}

function mapStateToProps (state:any) {
  const { commonReducer } = state;
  // console.log("state update",commonReducer);
  return {
    ...commonReducer
    // branches : state.commonReducer.branchList
  };
  // return {}
}
function mapDispatchToProps (dispatch) {
  return {
    getCompanyAndBranches: () => {
      dispatch(getCompanyAndBranches());
    },
    updateBranchStateDetails : (payload:any) => {
      dispatch(updateBranchStateDetails(payload));
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
