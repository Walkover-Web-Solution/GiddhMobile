import React from 'react';
import {connect} from 'react-redux';
import {GDContainer} from '@/core/components/container/container.component';
import {View, Text, DeviceEventEmitter, TouchableOpacity, Alert} from 'react-native';
import style from '@/screens/Parties/style';
import StatusBarComponent from '@/core/components/status-bar/status-bar.component';
import color from '@/utils/colors';
import {PartiesList} from '@/screens/Parties/components/parties-list.component';
import {CommonService} from '@/core/services/common/common.service';
import {CompanyService} from '@/core/services/company/company.service';

import {PartiesPaginatedResponse} from '@/models/interfaces/parties';
// @ts-ignore
import {Bars} from 'react-native-loader';
import {APP_EVENTS} from '@/utils/constants';

type connectedProps = ReturnType<typeof mapStateToProps>;
type PartiesScreenProp = connectedProps;

type PartiesScreenState = {
  showLoader: boolean;
  partiesDebtData: any;
  partiesCredData: any;
  debtData: any;
  creditors: boolean;
};

export class PartiesScreen extends React.Component<PartiesScreenProp, PartiesScreenState> {
  constructor(props: PartiesScreenProp) {
    super(props);
    this.state = {
      showLoader: true,
      partiesDebtData: [],
      partiesCredData: [],
      debtData: [],
      creditors: false,
    };
  }

  arrangeAZ = () => {
    this.setState({
      debtData: this.state.debtData.sort((a, b) =>
        a.name.toUpperCase().split(' ')[0].localeCompare(b.name.toUpperCase().split(' ')[0]),
      ),
      showLoader: false,
    });
  };

  apiCalls = async () => {
    await this.getPartiesSundryDebtors();
    await this.getPartiesSundryCreditors();
    this.setState(
      {
        debtData: [...this.state.partiesDebtData, ...this.state.partiesCredData],
      },
      () => this.arrangeAZ(),
    );
    // this.setState({
    //   debtData: this.state.debtData.sort((a, b) =>
    //     a.name.toUpperCase().split(' ')[0].localeCompare(b.name.toUpperCase().split(' ')[0]),
    //   ),
    //   showLoader: false,
    // });
  };
  componentDidMount() {
    //get parties data
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.comapnyBranchChange, () => {
      this.setState(
        {
          showLoader: true,
        },
        () => this.apiCalls(),
      );
    });
    this.apiCalls();
  }

  render() {
    const {activeCompany} = this.props;

    if (this.state.showLoader) {
      return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Bars size={15} color={color.PRIMARY_NORMAL} />
        </View>
      );
    } else {
      return (
        <View style={style.container}>
          {/* <View style={style.filterStyle}> */}
          {/*<View style={style.dateRangePickerStyle}>*/}
          {/*  <GDRoundedInput*/}
          {/*    svg={GdSVGIcons.search}*/}
          {/*    label="Search Name or Phone No."*/}
          {/*    svgWidth={14}*/}
          {/*    svgHeight={14}*/}
          {/*    value=""*/}
          {/*    placeholder="Search Name or Phone No."*/}
          {/*  />*/}
          {/*</View>*/}
          {/*<View style={styles.iconPlacingStyle}>*/}
          {/*  <GDButton label="+ Add New" type={ButtonType.secondary} shape={ButtonShape.rounded} />*/}
          {/*</View>*/}
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
        partiesDebtData: debtors.body.results,
      });
    } catch (e) {
      this.setState({debtData: new PartiesPaginatedResponse()});
      console.log(e);
    }
  }
  private async getPartiesSundryCreditors() {
    try {
      // console.log('Creditors called');
      const creditors = await CommonService.getPartiesSundryCreditors();
      // console.log('creditors are', creditors.body.results);
      this.setState({
        // debtData: this.state.debtData.concat(creditors.body.results),
        partiesCredData: creditors.body.results,
      });
    } catch (e) {
      this.setState({partiesCredData: new PartiesPaginatedResponse()});

      this.setState({showLoader: false});
    }
  }
}

const mapStateToProps = (state: RootState) => {
  return {
    // activeCompany: state.company.activeCompany,
  };
};
export default connect(mapStateToProps)(PartiesScreen);
