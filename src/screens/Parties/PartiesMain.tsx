import React from 'react';
import {connect} from 'react-redux';
import {GDContainer} from '@/core/components/container/container.component';
import {View, Text, DeviceEventEmitter, TouchableOpacity, Dimensions} from 'react-native';
import style from '@/screens/Parties/style';
import StatusBarComponent from '@/core/components/status-bar/status-bar.component';
import color from '@/utils/colors';
import {PartiesList} from '@/screens/Parties/components/parties-list.component';
import {CommonService} from '@/core/services/common/common.service';
import {CompanyService} from '@/core/services/company/company.service';
import _ from 'lodash';

import {PartiesPaginatedResponse} from '@/models/interfaces/parties';
// @ts-ignore
import {Bars} from 'react-native-loader';
import {APP_EVENTS} from '@/utils/constants';
import {TextInput} from 'react-native-gesture-handler';

export class PartiesScreen extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = {
      showLoader: true,
      partiesDebtData: new PartiesPaginatedResponse(),
      partiesCredData: new PartiesPaginatedResponse(),
      debtData: null,
      debtFullData: null,
      query: '',
    };
  }

  handleSearch = (text: any) => {
    const formatQuery = text.toUpperCase();
    const data = _.filter(this.state.debtFullData, (party) => {
      if (party.name.toUpperCase().includes(formatQuery)) {
        return 1;
      }
      return -1;
    });
    this.setState(
      {
        query: formatQuery,
        debtData: data,
      },

      () => console.log(this.state.debtData),
    );
  };

  apiCalls = async () => {
    await this.getPartiesSundryDebtors();
    await this.getPartiesSundryCreditors();
    // console.log(this.state.debtData[7].name.split(' ')[0]);
    this.setState(
      {
        debtFullData: this.state.debtFullData.sort((a, b) =>
          a.name.toUpperCase().split(' ')[0].localeCompare(b.name.toUpperCase().split(' ')[0]),
        ),
        showLoader: false,
      },
      // () => console.log(this.state.debtFullData),
    );
  };
  componentDidMount() {
    //get parties data
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.comapnyBranchChange, () => {
      this.apiCalls();
    });
    this.apiCalls();
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
        <View style={{flex: 1}}>
          <View style={{height: Dimensions.get('window').height * 0.08, backgroundColor: '#864DD3'}}>
            <TextInput placeholder={'search'} onChange={(text) => this.handleSearch(text)} />
          </View>
          {/* <TouchableOpacity
            style={{height: 50, width: 140, backgroundColor: 'pink'}}
            onPress={() => console.log(this.state.debtData)}>
            <Text>Hello</Text>
          </TouchableOpacity> */}
          <PartiesList
            partiesData={this.state.query ? this.state.debtData : this.state.debtFullData}
            activeCompany={activeCompany}
          />
        </View>
      );
    }
  }

  private async getPartiesSundryDebtors() {
    try {
      const debtors = await CommonService.getPartiesSundryDebtors();
      // console.log('data is', ...debtors.body.results, ...creditors.body.results);
      this.setState({
        debtFullData: debtors.body.results,
      });
    } catch (e) {
      this.setState({debtFullData: new PartiesPaginatedResponse()});
      console.log(e);
    }
  }
  private async getPartiesSundryCreditors() {
    try {
      const creditors = await CommonService.getPartiesSundryCreditors();
      // console.log('creditors are', creditors.body.results);
      this.setState({
        debtFullData: this.state.debtFullData.concat(creditors.body.results),
      });
    } catch (e) {
      this.setState({partiesCredData: new PartiesPaginatedResponse()});

      //   this.setState({showLoader: false});
    }
  }
}

const mapStateToProps = (state: RootState) => {
  return {
    // activeCompany: state.company.activeCompany,
  };
};
export default connect(mapStateToProps)(PartiesScreen);
