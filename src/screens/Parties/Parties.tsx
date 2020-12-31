import React from 'react';
import {RootState} from '@/core/store';
import {connect} from 'react-redux';
import {GDContainer} from '@/core/components/container/container.component';
import {View, Text, DeviceEventEmitter} from 'react-native';
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
  partiesDebtData: PartiesPaginatedResponse;
  partiesCredData: PartiesPaginatedResponse;
};

export class PartiesScreen extends React.Component<PartiesScreenProp, PartiesScreenState> {
  constructor(props: PartiesScreenProp) {
    super(props);
    this.state = {
      showLoader: true,
      partiesDebtData: new PartiesPaginatedResponse(),
      partiesCredData: new PartiesPaginatedResponse(),
    };
  }

  componentDidMount() {
    //get parties data
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.comapnyBranchChange, () => {
      this.getPartiesSundryDebtors();
      this.getPartiesSundryCreditors();
    });
    this.getPartiesSundryDebtors();
    this.getPartiesSundryCreditors();
  }

  render() {
    const {activeCompany} = this.props;

    if (this.state.showLoader) {
      return (
        <View style={{flex: 1}}>
          <View style={style.alignLoader}>
            <Bars size={15} color={color.PRIMARY_NORMAL} />
          </View>
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
          <View>
            <PartiesList partiesData={this.state.partiesDebtData} activeCompany={activeCompany} />
          </View>
          <View>
            <PartiesList partiesData={this.state.partiesCredData} activeCompany={activeCompany} />
          </View>
          {/* <View style={{backgroundColor: 'pink', height: 50, width: 150}}></View> */}
        </View>
      );
    }
  }

  private async getPartiesSundryDebtors() {
    try {
      const parties = await CommonService.getPartiesSundryDebtors();
      // console.log('debtors are', parties);
      this.setState({
        partiesDebtData: parties.body,
      });
    } catch (e) {
      this.setState({partiesDebtData: new PartiesPaginatedResponse()});
      console.log(e);
    }
  }
  private async getPartiesSundryCreditors() {
    try {
      const parties = await CommonService.getPartiesSundryCreditors();
      // console.log('creditors are', parties);
      this.setState({
        partiesCredData: parties.body,
      });
      this.setState({showLoader: false});
    } catch (e) {
      this.setState({partiesCredData: new PartiesPaginatedResponse()});
      console.log('gettin error');
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
