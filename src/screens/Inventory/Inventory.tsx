import React from 'react';
import { connect } from 'react-redux';
import { View, Text, FlatList, DeviceEventEmitter, Image, Dimensions, TouchableOpacity, TouchableWithoutFeedback, Alert,StatusBar,Platform } from 'react-native';
import style from '@/screens/Inventory/style';
import InventoryList from '@/screens/Inventory/components/inventory-list.component';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_EVENTS, STORAGE_KEYS } from '@/utils/constants';
import LoaderKit  from 'react-native-loader-kit';
import colors from '@/utils/colors';
import moment from 'moment';
import { InventoryService } from '@/core/services/inventory/inventory.service';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
// import { catch } from 'metro.config';

type connectedProps = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;
type Props = connectedProps;
type State = {
  // Realm: Realm,
  inventoryData: any[],
  invalidAlertShown: Boolean,
  showLoader: Boolean,
  dataLoadedTime: string
};
export class InventoryScreen extends React.Component<Props, State> {
  listData = [
    {
      product_name: 'Product Name',
      opening_stock: '30 nos.',
      inward: '140 nos.',
      closing_stock: '130 nos.',
      outward: '40 nos.',
      email: 'proxqima@appdividend.com'
    },
    {
      product_name: 'Product Name',
      opening_stock: '30 nos.',
      inward: '140 nos.',
      closing_stock: '130 nos.',
      outward: '40 nos.',
      email: 'ebofny@appdividend.com'
    },
    {
      product_name: 'Product Name',
      opening_stock: '30 nos.',
      inward: '140 nos.',
      closing_stock: '130 nos.',
      outward: '40 nos.',
      email: 'proxafaima@appdividend.com'
    },
    {
      product_name: 'Product Name',
      opening_stock: '30 nos.',
      inward: '140 nos.',
      closing_stock: '130 nos.',
      outward: '40 nos.',
      email: 'ebsonyfa@appdividend.com'
    }
  ];
  listener: any;

  constructor(props: Props) {
    super(props);
    this.state = {
      showLoader: false,
      inventoryData: [],
      startDate: moment().subtract(30, 'd').format('DD-MM-YYYY'),
      endDate: moment().format('DD-MM-YYYY'),
      page: 1,
      loadingMore: false,
      activeDateFilter: '',
      invalidAlertShown: false,
      dataLoadedTime: ''
    };
  }

  componentDidMount() {
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.comapnyBranchChange, () => {
      this.setState(
        {
          showLoader: false,
          inventoryData: [],
          startDate: moment().subtract(30, 'd').format('DD-MM-YYYY'),
          endDate: moment().format('DD-MM-YYYY'),
          page: 1,
          loadingMore: false,
          activeDateFilter: ''
        },
        () => this.getInventories()
      );
    });
    this.getInventories();
  }

  async getInventories() {
    if (this.state.inventoryData.length == 0) {
      this.setState({
        showLoader: true
      });
    }
    try {
      let totalPages = 0;
      let result = [];
      const companyName = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyUniqueName);
      const Inventory = await InventoryService.getInventories(
        companyName,
        this.state.startDate,
        this.state.endDate,
        1);
      if (Inventory.body) {
        totalPages = Inventory.body.totalPages;
        let check = 0;
        if (totalPages > 3) {
          check = 1;
        }
        //console.log("Pages to load " + totalPages);
        for (let i = 1; i <= totalPages; i++) {
          try {
            let InventoryPageData = null;
            try {
              InventoryPageData = await InventoryService?.getInventories(
                companyName,
                this.state.startDate,
                this.state.endDate,
                i);
            } catch (e) {
              // console.log('error in fetching', e?.message);
              continue;
            }
            if (InventoryPageData && InventoryPageData?.status == 'success') {
              result = [...result, ...InventoryPageData?.body?.stockReport];
            } else {
              console.log('error', InventoryPageData);
              if (!this.state.invalidAlertShown && InventoryPageData && InventoryPageData?.message) {
                console.log("shown");
                Alert.alert('Alert', InventoryPageData?.message);
                this.setState({
                  invalidAlertShown: true
                });
              }
            }
            if (check && i > 3) {
              this.setState({
                inventoryData: result,
                showLoader: false
              });
              check = 0;
            }
            if (i % 5 === 0) {
              this.setState({
                inventoryData: result
              });
            }
          } catch (_err) {
            console.log('catched', _err);
          }
        }
        this.setState({
          inventoryData: result,
          showLoader: false
        });
      }
    } catch (e) {
      console.log('Something went wrong while fetching inventories', e);
      this.setState({ showLoader: false });
    }
  }

  changeDate = (SD, ED) => {
    if (SD) {
      this.setState({
        startDate: SD
      });
    }
    if (ED) {
      this.setState(
        {
          endDate: ED
        },
        () => {
          this.getInventories();
        }
      );
    }
  };

  setActiveDateFilter = (activeDateFilter, dateMode) => {
    this.setState({
      activeDateFilter: activeDateFilter,
      dateMode: dateMode
    });
  };

  dateShift = (button) => {
    if (button == 'left') {
      this.setState(
        {
          startDate: moment(this.state.startDate, 'DD-MM-YYYY')
            .subtract(
              moment(this.state.endDate, 'DD-MM-YYYY').diff(moment(this.state.startDate, 'DD-MM-YYYY'), 'days'),
              'days'
            )
            .format('DD-MM-YYYY'),
          endDate: moment(this.state.endDate, 'DD-MM-YYYY')
            .subtract(
              moment(this.state.endDate, 'DD-MM-YYYY').diff(moment(this.state.startDate, 'DD-MM-YYYY'), 'days'),
              'days'
            )
            .format('DD-MM-YYYY'),
          activeDateFilter: '',
          transactionsLoader: true
        },
        () => this.getInventories()
      );
    } else if (button == 'right') {
      this.setState(
        {
          startDate: moment(this.state.startDate, 'DD-MM-YYYY')
            .add(
              moment(this.state.endDate, 'DD-MM-YYYY').diff(moment(this.state.startDate, 'DD-MM-YYYY'), 'days'),
              'days'
            )
            .format('DD-MM-YYYY'),
          endDate: moment(this.state.endDate, 'DD-MM-YYYY')
            .add(
              moment(this.state.endDate, 'DD-MM-YYYY').diff(moment(this.state.startDate, 'DD-MM-YYYY'), 'days'),
              'days'
            )
            .format('DD-MM-YYYY'),
          activeDateFilter: '',
          transactionsLoader: true
        },
        () => this.getInventories()
      );
    }
  };

  render() {
    return (
      <View style={style.container}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 10,
            marginTop: 15
          }}>
          <View style={{
            borderRadius: 20,
            borderWidth: 1,
            borderColor: '#D9D9D9',
            height: 40,
            width: Dimensions.get('window').width * 0.75,
            justifyContent: 'center'
          }}>
            <TouchableWithoutFeedback
              style={{
                alignItems: 'center',
                flexDirection: 'row'
              }}
              onPress={() =>
                this.props.navigation.navigate('AppDatePicker', {
                  selectDate: this.changeDate,
                  startDate: this.state.startDate,
                  endDate: this.state.endDate,
                  activeDateFilter: this.state.activeDateFilter,
                  setActiveDateFilter: this.setActiveDateFilter,
                  DateRangeOnly: true
                })
              }>
              <View style={{ marginLeft: 10, flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons name="calendar-month" size={22} color={'#808080'} />
                <Text style={{ fontFamily: 'AvenirLTStd-Book', marginLeft: 5 }}>
                  {moment(this.state.startDate, 'DD-MM-YYYY').format('DD MMM YY') +
                    ' - ' +
                    moment(this.state.endDate, 'DD-MM-YYYY').format('DD MMM YY')}
                </Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity style={{ padding: 5 }}
              onPress={() => this.dateShift('left')}>
              <Entypo name="chevron-left" size={22} color={'#808080'} />
            </TouchableOpacity>
            <TouchableOpacity
              style={{ padding: 5 }}
              onPress={() => this.dateShift('right')}
            // onPress={this.tryDate}
            >
              <Entypo name="chevron-right" size={22} color={'#808080'} />
            </TouchableOpacity>
          </View>
        </View>
        {this.state.showLoader
          ? <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <LoaderKit
                style={{ width: 45, height: 45 }}
                name={'LineScale'}
                color={colors.PRIMARY_NORMAL}
            />
          </View>
          : <View style={style.container}>
            {this.state.inventoryData.length == 0
              ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 30 }}>
                  <Image
                    source={require('@/assets/images/noInventory.png')}
                    style={{ resizeMode: 'contain', height: 250, width: 300 }}
                  />
                  <Text style={{ fontFamily: 'AvenirLTStd-Black', fontSize: 25, marginTop: 10 }}>No Inventory</Text>
                </View>
              )
              : (
                <View>
                  {/* {this.state.dataLoadedTime.length > 0 ?
                    <LastDataLoadedTime
                      paddingHorizontal={10}
                      text={this.state.dataLoadedTime} /> : null} */}
                  <FlatList
                    data={this.state.inventoryData}
                    renderItem={({ item }) => <InventoryList item={item} />}
                    keyExtractor={(item) => item.stockUniqueName}
                  />
                </View>
              )}
          </View>
        }
      </View>
    );
  }
}

const mapStateToProps = () => {
  return {
  };
};

const mapDispatchToProps = () => {
  return {
    // getCountriesAction: dispatch.common.getCountriesAction,
    // logoutAction: dispatch.auth.logoutAction,
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(InventoryScreen);
