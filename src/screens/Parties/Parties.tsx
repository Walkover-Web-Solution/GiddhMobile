import React from 'react';
import {RootState} from '@/core/store';
import {connect} from 'react-redux';
import {GDContainer} from '@/core/components/container/container.component';
import {View} from 'react-native';
import style from '@/screens/Parties/style';
import StatusBarComponent from '@/core/components/status-bar/status-bar.component';
import color from '@/utils/colors';
import {PartiesList} from '@/screens/Parties/components/parties-list.component';
import {CommonService} from '@/core/services/common/common.service';
import {CompanyService} from '@/core/services/company/company.service';

import {PartiesPaginatedResponse} from '@/models/interfaces/parties';
// @ts-ignore
import {Bars} from 'react-native-loader';

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

    this.getPartiesSundryDebtors();
    this.getPartiesSundryCreditors();
  }

  render() {
    const {activeCompany} = this.props;

    if (this.state.showLoader) {
      return (
        <GDContainer>
          <StatusBarComponent backgroundColor={color.SECONDARY} barStyle="light-content" />
          <View style={style.alignLoader}>
            <Bars size={15} color={color.PRIMARY_NORMAL} />
          </View>
        </GDContainer>
      );
    } else {
      return (
        <GDContainer>
          <StatusBarComponent backgroundColor={color.SECONDARY} barStyle="light-content" />

          <View style={style.container}>
            <View style={style.filterStyle}>
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
            </View>
            <View style={{marginTop: 10}} />
            <PartiesList partiesData={this.state.partiesDebtData} activeCompany={activeCompany} />
            <PartiesList partiesData={this.state.partiesCredData} activeCompany={activeCompany} />
          </View>
        </GDContainer>
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
