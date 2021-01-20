import React from 'react';
import {connect} from 'react-redux';
import {GDContainer} from '@/core/components/container/container.component';
import {View, Text, DeviceEventEmitter, TouchableOpacity, Dimensions, Modal, TextInput} from 'react-native';
import style from '@/screens/Parties/style';
import StatusBarComponent from '@/core/components/status-bar/status-bar.component';
import color from '@/utils/colors';
import {PartiesMainList} from '@/screens/Parties/components/partiesmain-listcomponent';
import SortModal from '@/screens/Parties/components/sortModal';
import {CommonService} from '@/core/services/common/common.service';
import {CompanyService} from '@/core/services/company/company.service';
import _ from 'lodash';
import {BadgeButton} from '@/core/components/badge-button/badge-button.component';
import {PartiesPaginatedResponse} from '@/models/interfaces/parties';
import DropDownPicker from 'react-native-dropdown-picker';
// @ts-ignore
import {Bars} from 'react-native-loader';
import {APP_EVENTS} from '@/utils/constants';

import {Vendors} from './components/Vendors';
import {Customers} from './components/Customers';
import Icons from 'react-native-vector-icons/AntDesign';
import Icon from '@/core/components/custom-icon/custom-icon';
import {commonUrls} from '@/core/services/common/common.url';

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

export class PartiesMainScreen extends React.Component {
  constructor(props: any) {
    super(props);
    this.inputRef = React.createRef();
    this.state = {
      showLoader: true,
      searchQuery: '',
      badgeTabs: BadgeTabs,
      val: 0,
      vendorData: [],
      customerData: [],
      sortModal: false,
      sortBy: 'name',
      order: 'aesc',
      textInputOpen: false,
      count: 50,
      customerPage: 1,
      VendorPage: 1,
      totalCustomerPages: 0,
      totalVendorPages: 0,
      customerLoadingMore: false,
      vendorLoadingMore: false,
      activeFilter: 'AZ',
    };
  }

  handleCustomerRefresh = () => {
    console.log('customer refresh executed');
    if (this.state.customerPage < this.state.totalCustomerPages) {
      this.setState(
        {
          customerPage: this.state.customerPage + 1,
          customerLoadingMore: true,
        },
        () => {
          this.loadDebtors(
            this.state.searchQuery,
            this.state.sortBy,
            this.state.order,
            this.state.count,
            this.state.customerPage,
          );
          console.log('this executes now');
        },
      );
    }
  };
  handleVendorRefresh = () => {
    console.log('vendor refresh executed');
    // console.log(this.state.totalVendorPages);
    if (this.state.VendorPage < this.state.totalVendorPages) {
      this.setState(
        {
          VendorPage: this.state.VendorPage + 1,
          vendorLoadingMore: true,
        },
        () => {
          this.loadCreditors(
            this.state.searchQuery,
            this.state.sortBy,
            this.state.order,
            this.state.count,
            this.state.VendorPage,
          );
          console.log('this executes vendor now');
        },
      );
    }
  };
  func1 = () => {
    console.log(commonUrls.customer_vendor_report_sundry_debtors.replace('q=', `q=a`));
  };

  modalVisible = () => {
    this.setState({sortModal: false});
  };

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
      return (
        <Customers
          navigation={this.props.navigation}
          partiesData={this.state.customerData}
          activeCompany={this.props.activeCompany}
          handleRefresh={this.handleCustomerRefresh}
          loadMore={this.state.customerLoadingMore}
        />
      );
    } else if (this.state.val === 1) {
      return (
        <Vendors
          navigation={this.props.navigation}
          partiesData={this.state.vendorData}
          activeCompany={this.props.activeCompany}
          handleRefresh={this.handleVendorRefresh}
          loadMore={this.state.vendorLoadingMore}
        />
      );
    }
  }

  apiCalls = async () => {
    // console.log(this.state.searchQuery, this.state.customerPage);
    await this.getPartiesMainSundryDebtors(
      this.state.searchQuery,
      this.state.sortBy,
      this.state.order,
      this.state.count,
      this.state.customerPage,
    );
    await this.getPartiesMainSundryCreditors(
      this.state.searchQuery,
      this.state.sortBy,
      this.state.order,
      this.state.count,
      this.state.VendorPage,
    );
  };

  searchCalls = _.debounce(this.apiCalls, 2000);

  handleSearch = (text: any) => {
    this.setState(
      {
        searchQuery: text,
        showLoader: true,
        customerPage: 1,
        VendorPage: 1,
      },
      () => {
        this.searchCalls();
      },
    );
  };

  filter = (filterType) => {
    if (filterType == 'AZ') {
      this.setState(
        {
          sortBy: 'name',
          order: 'aesc',
          activeFilter: 'AZ',
          customerPage: 1,
          VendorPage: 1,
          showLoader: true,
        },
        () => {
          this.apiCalls();
        },
      );
    } else if (filterType == 'ZA') {
      this.setState(
        {
          sortBy: 'name',
          order: 'desc',
          activeFilter: 'ZA',
          customerPage: 1,
          VendorPage: 1,
          showLoader: true,
        },
        () => {
          this.apiCalls();
        },
      );
    } else if (filterType == '10') {
      this.setState(
        {
          sortBy: 'closingBalance',
          order: 'aesc',
          activeFilter: '10',
          customerPage: 1,
          VendorPage: 1,
          showLoader: true,
        },
        () => {
          this.apiCalls();
        },
      );
    } else {
      this.setState(
        {
          sortBy: 'closingBalance',
          order: 'desc',
          activeFilter: '01',
          customerPage: 1,
          VendorPage: 1,
          showLoader: true,
        },
        () => {
          this.apiCalls();
        },
      );
    }
  };

  componentDidMount() {
    //get parties data
    this.apiCalls();
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.comapnyBranchChange, () => {
      this.setState({showLoader: true}, () => {
        this.apiCalls();
      });
    });
  }

  render() {
    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
        <View
          style={{
            height: Dimensions.get('window').height * 0.08,
            backgroundColor: '#864DD3',
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
          }}>
          {this.state.textInputOpen ? (
            <>
              <Icon name={'search'} size={20} color={'#FFFFFF'} />

              <TextInput
                placeholder={'Search name'}
                ref={this.inputRef}
                placeholderTextColor={'white'}
                style={{fontSize: 18, width: Dimensions.get('window').width * 0.6, marginLeft: 10, color: '#fff'}}
                onChangeText={this.handleSearch}
                value={this.state.searchQuery}
              />

              <TouchableOpacity
                style={{position: 'absolute', right: 20, padding: 8}}
                onPress={() => this.setState({textInputOpen: false})}>
                <Icons name={'close'} size={25} color={'#FFFFFF'} />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={{fontSize: 20, fontWeight: 'bold', color: '#fff'}}>Parties</Text>
              <View style={{position: 'absolute', right: 20, flexDirection: 'row', padding: 10}}>
                <TouchableOpacity
                  delayPressIn={0}
                  onPress={() => this.setState({sortModal: true})}
                  style={{padding: 8}}>
                  <Icon name={'sort'} size={20} color={'#FFFFFF'} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={{padding: 8, marginLeft: 15}}
                  delayPressIn={0}
                  onPress={() => this.setState({textInputOpen: true}, () => this.inputRef.current.focus())}>
                  <Icon name={'search'} size={20} color={'#FFFFFF'} />
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* <TouchableOpacity
              style={{position: 'absolute', right: 20}}
              delayPressIn={0}
              onPress={() => this.setState({sortModal: true})}>
              <Icon name={'sort'} size={20} color={'#FFFFFF'} />
            </TouchableOpacity> */}
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
        {this.state.showLoader ? (
          <View style={{flex: 1}}>
            <View style={style.alignLoader}>
              <Bars size={15} color={color.PRIMARY_NORMAL} />
            </View>
          </View>
        ) : (
          <>{this.renderElement()}</>
        )}
        <SortModal
          modalVisible={this.state.sortModal}
          setModalVisible={this.modalVisible}
          filter={this.filter}
          activeFilter={this.state.activeFilter}
        />
        {/* <TouchableOpacity style={{height: 50, width: 140, backgroundColor: 'pink'}} onPress={this.func1}>
            <Text>Hello</Text>
          </TouchableOpacity> */}
        {/* <PartiesMainList
            partiesData={this.state.query ? this.state.debtData : this.state.debtFullData}
            activeCompany={activeCompany}
          /> */}
      </View>
    );
  }

  private async getPartiesMainSundryDebtors(query, sortBy, order, count, page) {
    try {
      const debtors = await CommonService.getPartiesMainSundryDebtors(query, sortBy, order, count, page);
      // console.log('data is', ...debtors.body.results, ...creditors.body.results);
      this.setState(
        {
          customerData: debtors.body.results,
          totalCustomerPages: debtors.body.totalPages,
        },
        // () => console.log(this.state.customerData),
      );
    } catch (e) {
      this.setState({customerData: new PartiesPaginatedResponse()});
      console.log(e);
    }
  }

  private async getPartiesMainSundryCreditors(query, sortBy, order, count, page) {
    try {
      // console.log('api called');
      const creditors = await CommonService.getPartiesMainSundryCreditors(query, sortBy, order, count, page);

      this.setState({
        vendorData: creditors.body.results,
        totalVendorPages: creditors.body.totalPages,
        showLoader: false,
      });
    } catch (e) {
      this.setState({vendorData: new PartiesPaginatedResponse()});

      //   this.setState({showLoader: false});
    }
  }
  private async loadDebtors(query, sortBy, order, count, page) {
    try {
      const debtors = await CommonService.getPartiesMainSundryDebtors(query, sortBy, order, count, page);
      // console.log('data is', ...debtors.body.results, ...creditors.body.results);
      this.setState(
        {
          customerData: [...this.state.customerData, ...debtors.body.results],
          customerLoadingMore: false,
        },
        // () => console.log(this.state.customerData),
      );
    } catch (e) {
      this.setState({customerData: new PartiesPaginatedResponse()});
      console.log(e);
    }
  }
  private async loadCreditors(query, sortBy, order, count, page) {
    try {
      const creditors = await CommonService.getPartiesMainSundryCreditors(query, sortBy, order, count, page);
      // console.log('creditors are', creditors.body.results);
      this.setState({
        vendorData: [...this.state.vendorData, ...creditors.body.results],
        vendorLoadingMore: false,
      });
    } catch (e) {
      this.setState({vendorData: new PartiesPaginatedResponse()});
    }
  }
}

const mapStateToProps = (state: RootState) => {
  return {
    // activeCompany: state.company.activeCompany,
  };
};
export default connect(mapStateToProps)(PartiesMainScreen);
