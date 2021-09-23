/* eslint-disable semi */
// eslint-disable-next-line no-use-before-define
import React from 'react';
import { connect } from 'react-redux';
import { View, DeviceEventEmitter, Text } from 'react-native';
import style from '@/screens/Parties/style';
import color from '@/utils/colors';
import { PartiesList } from '@/screens/Parties/components/parties-list.component';
import { CommonService } from '@/core/services/common/common.service';
import * as CommonActions from '@/redux/CommonAction';
import { PartiesPaginatedResponse } from '@/models/interfaces/parties';
import Realm from 'realm';
// @ts-ignore
import { Bars } from 'react-native-loader';
import { APP_EVENTS, STORAGE_KEYS } from '@/utils/constants';
import { PartiesDBOptions, RootDBOptions } from '@/Database';
import { PARTIES_SCHEMA } from '@/Database/AllSchemas/display-data-schemas/parties-schema';
import LastDataLoadedTime from '@/core/components/data-loaded-time/LastDataLoadedTime';
import { calculateDataLoadedTime } from '@/utils/helper';
import AsyncStorage from '@react-native-community/async-storage';
import { ROOT_DB_SCHEMA } from '@/Database/AllSchemas/company-branch-schema';

type PartiesScreenProp = {
  logout: Function;
};

type PartiesScreenState = {
  showLoader: boolean;
  partiesDebtData: any;
  partiesCredData: any;
  debtData: any;
  creditors: boolean;
  Realm: Realm;
  dataLoadedTime: string
};

export class PartiesScreen extends React.Component<PartiesScreenProp, PartiesScreenState> {
  constructor(props: PartiesScreenProp) {
    super(props);
    this.state = {
      showLoader: false,
      partiesDebtData: [],
      partiesCredData: [],
      debtData: [],
      creditors: false,
      Realm: Realm,
      dataLoadedTime: ''
    };
  }

  arrangeAZ = () => {
    this.setState({
      debtData: this.state.debtData.sort((a, b) =>
        a.name.toUpperCase().split(' ')[0].localeCompare(b.name.toUpperCase().split(' ')[0])
      )
    }, () => {
      this.setState({
        showLoader: false
      });
    });
  };

  updateDB = () => {
    console.log('updating db');
    try {
      const objects: any[] = [];
      this.state.debtData.forEach(element => {
        objects.push({
          uniqueName: element.uniqueName,
          name: element.name,
          closingBalance: element.closingBalance,
          category: element.category,
          country: {
            code: element.country.code
          }
        });
      });
      const existingData = this.state.Realm.objects(PARTIES_SCHEMA);
      this.state.Realm.write(() => {
        if (existingData.length > 0) {
          existingData[0].timeStamp = calculateDataLoadedTime(new Date());
          existingData[0].objects = objects;
        } else {
          this.state.Realm.create(PARTIES_SCHEMA, {
            timeStamp: calculateDataLoadedTime(new Date()),
            objects: objects
          });
        }
      });
    } catch (error) {
      console.log("error updating db ", error);
    }
  }

  apiCalls = async () => {
    await this.getPartiesSundryDebtors();
    await this.getPartiesSundryCreditors();
    if (this.state.partiesCredData || this.state.partiesDebtData) {
      this.setState(
        {
          debtData: [...this.state.partiesDebtData, ...this.state.partiesCredData]
        },
        () => {
          this.arrangeAZ();
        }
      );
    }
  };

  manageApiCalls = async () => {
    this.setState({
      showLoader: true
    })
    if (this.props.isInternetReachable) {
      await this.apiCalls();
    } else {
      await this.getDbData();
      this.setState({
        showLoader: false
      });
    }
  }

  getDbData = async () => {
    try {
      const realm = await Realm.open(RootDBOptions);
      const userEmail: any = await AsyncStorage.getItem(STORAGE_KEYS.googleEmail);
      const data: any = realm.objectForPrimaryKey(ROOT_DB_SCHEMA, userEmail);
      const currentCompany = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyUniqueName);
      const currentBranch = await AsyncStorage.getItem(STORAGE_KEYS.activeBranchUniqueName);
      for (let i = 0; i < data?.companies?.length; i++) {
        if (data.companies[i].uniqueName == currentCompany) {
          for (let j = 0; j < data?.companies[i]?.branches?.length; j++) {
            const elem = data.companies[i].branches[j];
            if (currentBranch == elem.uniqueName) {
              if (elem?.parties?.timeStamp) {
                this.setState({
                  debtData: elem?.parties?.objects,
                  dataLoadedTime: elem?.parties?.timeStamp
                  // }, () => {
                  //   setInterval(() => {
                  //     this.setState({
                  //       dataLoadedTime: ''
                  //     });
                  //   }, 3 * 1000);
                })
              }
              break;
            }
          }
          break;
        }
      }
    } catch (error) {
      console.log('error fetching parties data from db');
    }
  }

  componentDidMount() {
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.InternetAvailable, () => {
      this.manageApiCalls();
    });
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.InternetLost, () => {
      this.manageApiCalls();
    });
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.CustomerCreated, () => {
      this.manageApiCalls();
    });
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.comapnyBranchChange, () => {
      this.manageApiCalls();
    });
    this.manageApiCalls();
  }

  render() {
    const { activeCompany } = this.props;

    if (this.state.showLoader) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Bars size={15} color={color.PRIMARY_NORMAL} />
        </View>
      );
    } else {
      return (
        <View style={style.container}>
          {this.state.dataLoadedTime.length > 0 ?
            <LastDataLoadedTime
              paddingHorizontal={10}
              text={this.state.dataLoadedTime} /> : null}
          <PartiesList partiesData={this.state.debtData} activeCompany={activeCompany} />
        </View>
      );
    }
  }

  private async getPartiesSundryDebtors() {
    try {
      // console.log('debtors called');
      const debtors = await CommonService.getPartiesSundryDebtors();
      // console.log('data is', ...debtors.body.results, ...creditors.body.results);
      this.setState({
        partiesDebtData: debtors.body.results
      });
    } catch (e) {
      this.setState({ partiesDebtData: null });
      if (e && e.data && e.data.code && e?.data?.code != 'UNAUTHORISED') {
        this.props.logout();
      }
      console.log("crashlog", e);
    }
  }

  private async getPartiesSundryCreditors() {
    try {
      // console.log('Creditors called');
      const creditors = await CommonService.getPartiesSundryCreditors();
      // console.log('creditors are', creditors.body.results);
      this.setState({
        // debtData: this.state.debtData.concat(creditors.body.results),
        partiesCredData: creditors.body.results
      });
    } catch (e) {
      this.setState({ partiesCredData: null });
      if (e && e.data && e.data.code && e?.data?.code != 'UNAUTHORISED') {
        this.props.logout();
      }
      console.log("crashlog", e);
      this.setState({ showLoader: false });
    }
  }
}

const mapStateToProps = (state: any) => {
  const { commonReducer } = state;
  return {
    ...commonReducer,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    logout: () => {
      dispatch(CommonActions.logout());
    }
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(PartiesScreen);
