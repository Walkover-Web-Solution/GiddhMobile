/* eslint-disable eqeqeq */
/* eslint-disable no-use-before-define */
/* eslint-disable semi */
import React from 'react';
import { connect } from 'react-redux';
import {
  View,
  Text,
  DeviceEventEmitter,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  TextInput,
  StatusBar
} from 'react-native';
import style from '@/screens/Parties/style';
import { useIsFocused } from '@react-navigation/native';
import color from '@/utils/colors';
import SortModal from '@/screens/Parties/components/sortModal';
import { CommonService } from '@/core/services/common/common.service';
import _ from 'lodash';
import { PartiesPaginatedResponse } from '@/models/interfaces/parties';
// @ts-ignore
import { Bars } from 'react-native-loader';
import { APP_EVENTS, STORAGE_KEYS } from '@/utils/constants';

import { Vendors } from './components/Vendors';
import { Customers } from './components/Customers';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Icon from '@/core/components/custom-icon/custom-icon';
import AsyncStorage from '@react-native-community/async-storage';
import Realm from 'realm';
import { CustomerVendorDBOptions, PartiesDBOptions } from '@/Database';
import { calculateDataLoadedTime } from '@/utils/helper';
import { PARTIES_SCHEMA } from '@/Database/AllSchemas/parties-schema';
import { CUSTOMER_VENDOR_SCHEMA } from '@/Database/AllSchemas/customer-vendor-schema';

const { width } = Dimensions.get('window');

export class PartiesMainScreen extends React.Component {
  private scrollRef;
  constructor(props: any) {
    super(props);
    this.inputRef = React.createRef();
    this.scrollRef = React.createRef();
    this.state = {
      showLoader: false,
      searchQuery: '',
      vendorData: [],
      customerData: [],
      sortModal: false,
      sortBy: 'closingBalance',
      order: 'desc',
      textInputOpen: false,
      count: 50,
      customerPage: 1,
      VendorPage: 1,
      totalCustomerPages: 0,
      totalVendorPages: 0,
      customerLoadingMore: false,
      vendorLoadingMore: false,
      activeFilter: 'AZ',
      currentPage: 0,
      screenWidth: Dimensions.get('window').width,
      screenHeight: Dimensions.get('window').height,
      dataLoadedTime: 'Date and Time',
      Realm: Realm
    };
    Dimensions.addEventListener('change', () => {
      this.setState({
        screenWidth: Dimensions.get('window').width,
        screenHeight: Dimensions.get('window').height,
      });
    });
  }

  FocusAwareStatusBar = (isFocused: any) => {
    return isFocused ? <StatusBar backgroundColor="#520EAD" barStyle="light-content" /> : null;
  };

  setSliderPage = (event: any) => {
    const { currentPage } = this.state;
    const { x } = event.nativeEvent.contentOffset;
    const indexOfNextScreen = Math.round(x / this.state.screenWidth);

    if (indexOfNextScreen !== currentPage) {
      this.setState({
        currentPage: indexOfNextScreen
      });
    }
  };

  activeFilter = () => {
    if (this.state.sortBy == 'closingBalance' && this.state.order == 'desc') {
      return '01';
    } else if (this.state.sortBy == 'closingBalance' && this.state.order == 'aesc') {
      return '10';
    } else if (this.state.sortBy == 'name' && this.state.order == 'aesc') {
      return 'AZ';
    } else {
      return 'ZA';
    }
  };

  defaultFilters = async () => {
    const sortBy = await AsyncStorage.getItem(STORAGE_KEYS.sortBy);
    const order = await AsyncStorage.getItem(STORAGE_KEYS.order);
    if (sortBy && order) {
      this.setState({ sortBy: sortBy, order: order });
    }
  };

  handleCustomerRefresh = () => {
    console.log('customer refresh executed');
    if (this.state.customerPage < this.state.totalCustomerPages) {
      this.setState(
        {
          customerPage: this.state.customerPage + 1,
          customerLoadingMore: true
        },
        () => {
          this.loadDebtors(
            this.state.searchQuery,
            this.state.sortBy,
            this.state.order,
            this.state.count,
            this.state.customerPage
          );
          console.log('this executes now');
        }
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
          vendorLoadingMore: true
        },
        () => {
          this.loadCreditors(
            this.state.searchQuery,
            this.state.sortBy,
            this.state.order,
            this.state.count,
            this.state.VendorPage
          );
          console.log('this executes vendor now');
        }
      );
    }
  };

  modalVisible = () => {
    this.setState({ sortModal: false });
  };

  updateDB = () => {
    console.log('updating db');
    try {
      const customerObjects: any[] = [];
      const vendorObjects: any[] = [];
      this.state.customerData.forEach(element => {
        customerObjects.push({
          uniqueName: element.uniqueName,
          name: element.name,
          closingBalance: {
            amount: element.closingBalance.amount,
            type: element.closingBalance.type
          },
          category: element.category,
          country: {
            code: element.country.code
          }
        });
      });
      this.state.vendorData.forEach(element => {
        vendorObjects.push({
          uniqueName: element.uniqueName,
          name: element.name,
          closingBalance: {
            amount: element.closingBalance.amount,
            type: element.closingBalance.type
          },
          category: element.category,
          country: {
            code: element.country.code
          }
        });
      });
      const existingData = this.state.Realm.objects(CUSTOMER_VENDOR_SCHEMA);
      this.state.Realm.write(() => {
        if (existingData.length > 0) {
          existingData[0].timeStamp = calculateDataLoadedTime(new Date());
          existingData[0].customerObjects = customerObjects;
          existingData[0].vendorObjects = vendorObjects;
        } else {
          this.state.Realm.create(CUSTOMER_VENDOR_SCHEMA, {
            timeStamp: calculateDataLoadedTime(new Date()),
            customerObjects: customerObjects,
            vendorObjects: vendorObjects
          });
        }
      });
    } catch (error) {
      console.log("error updating db ", error);
    }
  }

  apiCalls = async () => {
    await this.defaultFilters();
    if (this.state.customerData.length == 0 || this.state.vendorData.length == 0) {
      this.setState({
        showLoader: true
      });
    }
    await this.getPartiesMainSundryDebtors(
      this.state.searchQuery,
      this.state.sortBy,
      this.state.order,
      this.state.count,
      this.state.customerPage
    );
    await this.getPartiesMainSundryCreditors(
      this.state.searchQuery,
      this.state.sortBy,
      this.state.order,
      this.state.count,
      this.state.VendorPage
    );
    console.log("done fetchoing", this.state.customerData);
    this.updateDB();
    this.setState({
      dataLoadedTime: 'Updated!'
    }, () => {
      setInterval(() => {
        this.setState({
          dataLoadedTime: ''
        });
      }, 3 * 1000);
    });
  };

  filterCalls = async () => {
    await this.getPartiesMainSundryDebtors(
      this.state.searchQuery,
      this.state.sortBy,
      this.state.order,
      this.state.count,
      this.state.customerPage
    );
    await this.getPartiesMainSundryCreditors(
      this.state.searchQuery,
      this.state.sortBy,
      this.state.order,
      this.state.count,
      this.state.VendorPage
    );
  };

  searchCalls = _.debounce(this.apiCalls, 2000);

  handleSearch = (text: any) => {
    this.setState(
      {
        searchQuery: text,
        showLoader: true,
        customerPage: 1,
        VendorPage: 1
      },
      () => {
        this.searchCalls();
      }
    );
  };

  filter = async (filterType: string) => {
    if (filterType == 'AZ') {
      await AsyncStorage.setItem(STORAGE_KEYS.sortBy, 'name');
      await AsyncStorage.setItem(STORAGE_KEYS.order, 'aesc');
      this.setState(
        {
          sortBy: 'name',
          order: 'aesc',
          customerPage: 1,
          VendorPage: 1,
          showLoader: true
        },
        () => {
          this.filterCalls();
        }
      );
    } else if (filterType == 'ZA') {
      await AsyncStorage.setItem(STORAGE_KEYS.sortBy, 'name');
      await AsyncStorage.setItem(STORAGE_KEYS.order, 'desc');
      this.setState(
        {
          sortBy: 'name',
          order: 'desc',
          customerPage: 1,
          VendorPage: 1,
          showLoader: true
        },
        () => {
          this.filterCalls();
        }
      );
    } else if (filterType == '10') {
      await AsyncStorage.setItem(STORAGE_KEYS.sortBy, 'closingBalance');
      await AsyncStorage.setItem(STORAGE_KEYS.order, 'aesc');
      this.setState(
        {
          sortBy: 'closingBalance',
          order: 'aesc',
          customerPage: 1,
          VendorPage: 1,
          showLoader: true
        },
        () => {
          this.filterCalls();
        }
      );
    } else {
      await AsyncStorage.setItem(STORAGE_KEYS.sortBy, 'closingBalance');
      await AsyncStorage.setItem(STORAGE_KEYS.order, 'desc');
      this.setState(
        {
          sortBy: 'closingBalance',
          order: 'desc',
          customerPage: 1,
          VendorPage: 1,
          showLoader: true
        },
        () => {
          this.filterCalls();
        }
      );
    }
  };

  componentDidMount() {
    Realm.open(CustomerVendorDBOptions)
      .then((Realm) => {
        this.setState({
          Realm: Realm
        })
        const partiesData: any = Realm.objects(CUSTOMER_VENDOR_SCHEMA);
        if (partiesData[0]?.customerObjects?.length > 0 && partiesData[0]?.vendorObjects?.length) {
          this.setState({
            customerData: partiesData[0]?.customerObjects,
            vendorData: partiesData[0]?.vendorObjects,
            dataLoadedTime: partiesData[0]?.timeStamp,
            showLoader: false
          }, () => {
            console.log("rendered last fetched data");
          });
        }
      });
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.CustomerCreated, () => {
      this.setState(
        {
          customerPage: 1,
          VendorPage: 1
        },
        () => {
          this.apiCalls();
        }
      );
    });
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.comapnyBranchChange, () => {
      this.setState(
        {
          customerPage: 1,
          VendorPage: 1
        },
        () => {
          this.apiCalls();
        }
      );
    });
    this.apiCalls();
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        {this.FocusAwareStatusBar(this.props.isFocused)}
        <View
          style={{
            height: Dimensions.get('window').height * 0.08,
            backgroundColor: '#864DD3',
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20
          }}>
          {this.state.textInputOpen
            ? (
              <>
                <AntDesign name={'search1'} size={20} color={'#FFFFFF'} />

                <TextInput
                  placeholder={'Search name'}
                  ref={this.inputRef}
                  placeholderTextColor={'white'}
                  style={{ fontSize: 18, width: this.state.screenWidth * 0.6, marginLeft: 10, color: '#fff' }}
                  onChangeText={this.handleSearch}
                  value={this.state.searchQuery}
                />

                <TouchableOpacity
                  style={{ position: 'absolute', right: 20, padding: 8 }}
                  onPress={() => {
                    if (this.state.searchQuery != '') {
                      this.inputRef.current.clear();
                      this.handleSearch('');
                    }
                    this.setState({ textInputOpen: false });
                  }}>
                  <AntDesign name={'close'} size={25} color={'#FFFFFF'} />
                </TouchableOpacity>
              </>
            )
            : (
              <>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fff' }}>Parties</Text>
                <View style={{ position: 'absolute', right: 20, flexDirection: 'row', padding: 10 }}>
                  <TouchableOpacity
                    delayPressIn={0}
                    onPress={() => this.setState({ sortModal: true })}
                    style={{ padding: 8 }}>
                    <Icon name={'Group-6191'} size={20} color={'#FFFFFF'} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ padding: 8, marginLeft: 15 }}
                    delayPressIn={0}
                    onPress={() => this.setState({ textInputOpen: true }, () => this.inputRef.current.focus())}
                  >
                    <AntDesign name={'search1'} size={20} color={'#FFFFFF'} />
                  </TouchableOpacity>
                </View>
              </>
            )}
        </View>
        <View
          style={{
            marginTop: 10,

            justifyContent: 'space-around',
            flexDirection: 'row',
            marginBottom: 15
          }}>
          <TouchableOpacity
            style={{
              borderTopEndRadius: 17,
              borderTopLeftRadius: 17,
              borderBottomLeftRadius: 17,
              borderColor: this.state.currentPage == 0 ? '#5773FF' : '#D9D9D9',
              width: this.state.screenWidth * 0.4,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 7,
              borderWidth: 1
            }}
            onPress={() =>
              this.scrollRef.current.scrollTo({
                animated: true,
                y: 0,
                x: this.state.screenWidth * -1
              })
            }>
            <Text
              numberOfLines={1}
              style={{
                color: this.state.currentPage == 0 ? '#5773FF' : '#808080',
                fontWeight: this.state.currentPage == 0 ? 'bold' : 'normal'
              }}>
              Customers
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              borderTopEndRadius: 17,
              borderTopLeftRadius: 17,
              borderBottomLeftRadius: 17,
              borderColor: this.state.currentPage == 1 ? '#5773FF' : '#D9D9D9',
              width: this.state.screenWidth * 0.4,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 2,
              borderWidth: 1
            }}
            onPress={() =>
              this.scrollRef.current.scrollTo({
                animated: true,
                y: 0,
                x: this.state.screenWidth * 2
              })
            }>
            <Text
              numberOfLines={1}
              style={{
                color: this.state.currentPage == 1 ? '#5773FF' : '#808080',
                fontWeight: this.state.currentPage == 1 ? 'bold' : 'normal'
              }}>
              Vendors
            </Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          ref={this.scrollRef}
          style={{ flex: 1 }}
          horizontal={true}
          scrollEventThrottle={16}
          pagingEnabled={true}
          showsHorizontalScrollIndicator={false}
          onScroll={(event) => {
            this.setSliderPage(event);
          }}>
          <View style={{ height: '100%', width: this.state.screenWidth }}>
            {this.state.showLoader
              ? (
                <View style={{ flex: 1 }}>
                  <View style={style.alignLoader}>
                    <Bars size={15} color={color.PRIMARY_NORMAL} />
                  </View>
                </View>
              )
              : (
                <Customers
                  navigation={this.props.navigation}
                  partiesData={this.state.customerData}
                  activeCompany={this.props.activeCompany}
                  handleRefresh={this.handleCustomerRefresh}
                  loadMore={this.state.customerLoadingMore}
                  dataLoadedTime={this.state.dataLoadedTime}
                />
              )}
          </View>
          <View style={{ height: '100%', width: this.state.screenWidth }}>
            {this.state.showLoader
              ? (
                <View style={{ flex: 1 }}>
                  <View style={style.alignLoader}>
                    <Bars size={15} color={color.PRIMARY_NORMAL} />
                  </View>
                </View>
              )
              : (
                <Vendors
                  navigation={this.props.navigation}
                  partiesData={this.state.vendorData}
                  activeCompany={this.props.activeCompany}
                  handleRefresh={this.handleVendorRefresh}
                  loadMore={this.state.vendorLoadingMore}
                  dataLoadedTime={this.state.dataLoadedTime}
                />
              )}
          </View>
        </ScrollView>
        <SortModal
          modalVisible={this.state.sortModal}
          setModalVisible={this.modalVisible}
          filter={this.filter}
          activeFilter={this.activeFilter()}
        />
      </View>
    );
  }

  private async getPartiesMainSundryDebtors(query: any, sortBy: any, order: any, count: any, page: any) {
    try {
      const debtors = await CommonService.getPartiesMainSundryDebtors(query, sortBy, order, count, page);
      this.setState(
        {
          customerData: debtors.body.results,
          totalCustomerPages: debtors.body.totalPages
        }
      );
    } catch (e) {
      console.log(e);
    }
  }

  private async getPartiesMainSundryCreditors(query: any, sortBy: any, order: any, count: any, page: any) {
    try {
      const creditors = await CommonService.getPartiesMainSundryCreditors(query, sortBy, order, count, page);
      this.setState({
        vendorData: creditors.body.results,
        totalVendorPages: creditors.body.totalPages,
        showLoader: false
      });
    } catch (e) {
    }
  }

  private async loadDebtors(query: any, sortBy: any, order: any, count: any, page: any) {
    try {
      const debtors = await CommonService.getPartiesMainSundryDebtors(query, sortBy, order, count, page);
      this.setState({
        customerData: [...this.state.customerData, ...debtors.body.results],
        customerLoadingMore: false
      });
    } catch (e) {
      console.log(e);
    }
  }

  private async loadCreditors(query: any, sortBy: any, order: any, count: any, page: any) {
    try {
      const creditors = await CommonService.getPartiesMainSundryCreditors(query, sortBy, order, count, page);

      this.setState({
        vendorData: [...this.state.vendorData, ...creditors.body.results],
        vendorLoadingMore: false
      });
    } catch (e) {
      this.setState({ vendorData: new PartiesPaginatedResponse() });
    }
  }
}

const mapStateToProps = () => {
  return {
    // activeCompany: state.company.activeCompany,
  };
};

function Screen(props: JSX.IntrinsicAttributes & JSX.IntrinsicClassAttributes<PartiesMainScreen> & Readonly<{}> & Readonly<{ children?: React.ReactNode; }>) {
  const isFocused = useIsFocused();

  return <PartiesMainScreen {...props} isFocused={isFocused} />;
}
export default connect(mapStateToProps)(Screen);
