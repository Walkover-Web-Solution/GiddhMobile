import React from 'react';
import {connect} from 'react-redux';
import {GDContainer} from '@/core/components/container/container.component';
import {View, Text, DeviceEventEmitter, TouchableOpacity, Dimensions} from 'react-native';
import style from '@/screens/Parties/style';
import StatusBarComponent from '@/core/components/status-bar/status-bar.component';
import color from '@/utils/colors';
import {PartiesMainList} from '@/screens/Parties/components/partiesmain-listcomponent';
import {CommonService} from '@/core/services/common/common.service';
import {CompanyService} from '@/core/services/company/company.service';
import _ from 'lodash';
import {BadgeButton} from '@/core/components/badge-button/badge-button.component';
import {PartiesPaginatedResponse} from '@/models/interfaces/parties';
// @ts-ignore
import {Bars} from 'react-native-loader';
import {APP_EVENTS} from '@/utils/constants';
import {TextInput} from 'react-native-gesture-handler';
import {Vendors} from './components/Vendors';
import {Customers} from './components/Customers';

const BadgeTabs = [
  {
    label: 'Customers',
    isActive: true,
  },
  {
    label: 'Vendors',
    isActive: false,
  },
];

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
      badgeTabs: BadgeTabs,
      val: 0,
      vendorData: null,
      customerData: null,
    };
  }

  selectedTab = async (tab, index) => {
    // eslint-disable-next-line no-shadow
    this.state.badgeTabs.forEach((tab: BadgeTab) => {
      tab.isActive = false;
    });
    tab.isActive = !tab.isActive;
    this.state.badgeTabs[index] = tab;
    this.setState({badgeTabs: this.state.badgeTabs, val: index});
  };
  renderElement() {
    if (this.state.val === 0) {
      return <Customers partiesData={this.state.customerData} activeCompany={this.props.activeCompany} />;
    } else if (this.state.val === 1) {
      return <Vendors partiesData={this.state.vendorData} activeCompany={this.props.activeCompany} />;
    }
  }

  contains = ({name}, query) => {
    if (name.toUpperCase().includes(query)) {
      return true;
    }

    return false;
  };

  handleSearch = (text: any) => {
    // console.log(text);
    const formatQuery = text.toUpperCase();
    const data = _.filter(this.state.debtFullData, (party) => {
      return this.contains(party, formatQuery);
    });
    this.setState(
      {
        query: formatQuery,
        debtData: data,
      },

      () => console.log(this.state.debtData),
    );
  };

  reverseData = () => {
    this.setState({
      debtFullData: this.state.debtFullData.reverse(),
    });
  };

  apiCalls = async () => {
    await this.getPartiesSundryDebtors();
    await this.getPartiesSundryCreditors();
    // console.log(this.state.debtData[7].name.split(' ')[0]);
    this.setState(
      {
        customerData: this.state.customerData.sort((a, b) =>
          a.name.toUpperCase().split(' ')[0].localeCompare(b.name.toUpperCase().split(' ')[0]),
        ),
        vendorData: this.state.vendorData.sort((a, b) =>
          a.name.toUpperCase().split(' ')[0].localeCompare(b.name.toUpperCase().split(' ')[0]),
        ),
        showLoader: false,
      },
      () => console.log('mission successful'),
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
            <TextInput placeholder={'search'} onChangeText={(text) => this.handleSearch(text)} />
          </View>
          <View
            style={{
              marginLeft: 15,
              marginRight: 15,
              // marginLeft: 70,
              // marginRight: 70,
              marginTop: 10,
              display: 'flex',
              justifyContent: 'space-around',
              flexDirection: 'row',
              marginBottom: 15,
            }}>
            {this.state.badgeTabs.map((tab, index) => (
              <BadgeButton
                label={tab.label}
                key={tab.label}
                onPress={() => this.selectedTab(tab, index)}
                isActive={tab.isActive}
              />
            ))}
          </View>
          {/* <TouchableOpacity
            style={{height: 50, width: 140, backgroundColor: 'pink'}}
            onPress={() => this.reverseData()}><View>{this.renderElement()}</View>
            <Text>Hello</Text>
          </TouchableOpacity> */}
          {/* <PartiesMainList
            partiesData={this.state.query ? this.state.debtData : this.state.debtFullData}
            activeCompany={activeCompany}
          /> */}
          {this.renderElement()}
        </View>
      );
    }
  }

  private async getPartiesSundryDebtors() {
    try {
      const debtors = await CommonService.getPartiesSundryDebtors();
      // console.log('data is', ...debtors.body.results, ...creditors.body.results);
      this.setState({
        customerData: debtors.body.results,
      });
    } catch (e) {
      this.setState({customerData: new PartiesPaginatedResponse()});
      console.log(e);
    }
  }
  private async getPartiesSundryCreditors() {
    try {
      const creditors = await CommonService.getPartiesSundryCreditors();
      // console.log('creditors are', creditors.body.results);
      this.setState({
        vendorData: creditors.body.results,
      });
    } catch (e) {
      this.setState({vendorData: new PartiesPaginatedResponse()});

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
