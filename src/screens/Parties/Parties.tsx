/* eslint-disable semi */
// eslint-disable-next-line no-use-before-define
import React from 'react';
import { connect } from 'react-redux';
import { View, DeviceEventEmitter, Alert } from 'react-native';
import style from '@/screens/Parties/style';
import color from '@/utils/colors';
import { PartiesList } from '@/screens/Parties/components/parties-list.component';
import { CommonService } from '@/core/services/common/common.service';
import * as CommonActions from '@/redux/CommonAction';
import { PartiesPaginatedResponse } from '@/models/interfaces/parties';
import Realm from 'realm';
// @ts-ignore
import { Bars } from 'react-native-loader';
import { APP_EVENTS } from '@/utils/constants';
import { PartiesDBOptions } from '@/Database';
import { PARTIES_SCHEMA } from '@/Database/AllSchemas/parties-schema';

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
      Realm: Realm
    };
  }

  arrangeAZ = () => {
    this.setState({
      debtData: this.state.debtData.sort((a, b) =>
        a.name.toUpperCase().split(' ')[0].localeCompare(b.name.toUpperCase().split(' ')[0])
      ),
      showLoader: false
    }, () => this.updateDB());
  };

  updateDB = () => {
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
          existingData[0].timeStamp = new Date().toString();
          existingData[0].objects = objects;
        } else {
          this.state.Realm.create(PARTIES_SCHEMA, {
            timeStamp: new Date().toString(),
            objects: objects
          });
        }
      });
    } catch (error) {
      console.log("error updating db ", error);
    }
  }

  apiCalls = async () => {
    this.setState({
      showLoader: true
    })
    await this.getPartiesSundryDebtors();
    await this.getPartiesSundryCreditors();
    this.setState(
      {
        debtData: [...this.state.partiesDebtData, ...this.state.partiesCredData]
      },
      () => {
        this.arrangeAZ();
      }
    );
    // this.setState({
    //   debtData: this.state.debtData.sort((a, b) =>
    //     a.name.toUpperCase().split(' ')[0].localeCompare(b.name.toUpperCase().split(' ')[0]),
    //   ),
    //   showLoader: false,
    // });
  };

  componentDidMount() {
    // get parties data
    Realm.open(PartiesDBOptions)
      .then((Realm) => {
        this.setState({
          Realm: Realm
        })
        const partiesData: any = Realm.objects(PARTIES_SCHEMA);
        if (partiesData[0]?.objects?.length > 0) {
          console.log("rendered last fetched data");
          this.setState({
            debtData: partiesData[0].objects.toJSON(),
            showLoader: false,
          });
        }
      });
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.CustomerCreated, () => {
      this.setState(
        {
          showLoader: true
        },
        () => {
          this.apiCalls();
        }
      );
    });
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.comapnyBranchChange, () => {
      this.setState(
        {
          showLoader: true
        },
        () => this.apiCalls()
      );
    });
    this.apiCalls();
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
          {/* {this.FocusAwareStatusBar(this.props.isFocused)} */}
          {/* <View style={style.filterStyle}> */}
          {/* <View style={style.dateRangePickerStyle}> */}
          {/*  <GDRoundedInput */}
          {/*    svg={GdSVGIcons.search} */}
          {/*    label="Search Name or Phone No." */}
          {/*    svgWidth={14} */}
          {/*    svgHeight={14} */}
          {/*    value="" */}
          {/*    placeholder="Search Name or Phone No." */}
          {/*  /> */}
          {/* </View> */}
          {/* <View style={styles.iconPlacingStyle}> */}
          {/*  <GDButton label="+ Add New" type={ButtonType.secondary} shape={ButtonShape.rounded} /> */}
          {/* </View> */}
          {/* </View> */}
          {/* <TouchableOpacity
            style={{height: 50, width: 140, backgroundColor: 'pink'}}
            onPress={() => console.log(this.state.debtData)}>
            <Text>Hello</Text>
          </TouchableOpacity> */}

          <PartiesList partiesData={this.state.debtData} activeCompany={activeCompany} />

          {/* <View style={{backgroundColor: 'pink', height: 50, width: 150}}></View> */}
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
      this.setState({ debtData: new PartiesPaginatedResponse() });
      if (e.data.code != 'UNAUTHORISED') {
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
      this.setState({ partiesCredData: new PartiesPaginatedResponse() });
      if (e.data.code != 'UNAUTHORISED') {
        this.props.logout();
      }
      console.log("crashlog", e);
      this.setState({ showLoader: false });
    }
  }
}

const mapStateToProps = () => {
  return {
    // activeCompany: state.company.activeCompany,
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
