import React from 'react';
import {connect} from 'react-redux';
import {GDContainer} from '@/core/components/container/container.component';
import {View, TouchableOpacity, Text, FlatList, DeviceEventEmitter} from 'react-native';
import style from '@/screens/Inventory/style';
import InventoryList from '@/screens/Inventory/components/inventory-list.component';
import AsyncStorage from '@react-native-community/async-storage';
import {APP_EVENTS, STORAGE_KEYS} from '@/utils/constants';
import httpInstance from '@/core/services/http/http.service';
import {Bars} from 'react-native-loader';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import colors from '@/utils/colors';
import moment from 'moment';

type connectedProps = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;
type Props = connectedProps;

export class InventoryScreen extends React.Component<Props, {}> {
  listData = [
    {
      product_name: 'Product Name',
      opening_stock: '30 nos.',
      inward: '140 nos.',
      closing_stock: '130 nos.',
      outward: '40 nos.',
      email: 'proxqima@appdividend.com',
    },
    {
      product_name: 'Product Name',
      opening_stock: '30 nos.',
      inward: '140 nos.',
      closing_stock: '130 nos.',
      outward: '40 nos.',
      email: 'ebofny@appdividend.com',
    },
    {
      product_name: 'Product Name',
      opening_stock: '30 nos.',
      inward: '140 nos.',
      closing_stock: '130 nos.',
      outward: '40 nos.',
      email: 'proxafaima@appdividend.com',
    },
    {
      product_name: 'Product Name',
      opening_stock: '30 nos.',
      inward: '140 nos.',
      closing_stock: '130 nos.',
      outward: '40 nos.',
      email: 'ebsonyfa@appdividend.com',
    },
  ];
  constructor(props: Props) {
    super(props);
    this.state = {
      showLoader: true,
      inventoryData: [],
      startDate: moment().subtract(30, 'd').format('DD-MM-YYYY'),
      endDate: moment().format('DD-MM-YYYY'),
      page: 1,
      loadingMore: false,
    };
  }
  componentDidMount() {
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.comapnyBranchChange, () => {
      this.setState(
        {
          showLoader: true,
        },
        () => this.getInventories(),
      );
    });
    this.getInventories();
  }

  async getInventories() {
    try {
      const companyName = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyUniqueName);
      const branchName = await AsyncStorage.getItem(STORAGE_KEYS.activeBranchUniqueName);

      await httpInstance
        .post(
          `https://api.giddh.com/company/${companyName}/stock-summary?from=${this.state.startDate}&to=${this.state.endDate}&page=1&nonZeroInward=true&nonZeroOutward=true`,
          {},
        )
        .then((res) => {
          this.setState({
            inventoryData: res.data.body.stockReport,
            showLoader: false,
          });
        });
    } catch (e) {
      this.setState({showLoader: false});
    }
  }
  render() {
    if (this.state.showLoader) {
      return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Bars size={15} color={colors.PRIMARY_NORMAL} />
        </View>
      );
    } else {
      return (
        <View style={style.container}>
          {/* <View style={style.filterStyle}>
            <View style={style.dateRangePickerStyle}>
              <GDRoundedDateRangeInput label="Select Date" />
            </View>
            <View style={styles.iconPlacingStyle}>
              <GDButton label="+ Add New" type={ButtonType.secondary} shape={ButtonShape.rounded} />
            </View>
          </View> */}
          {/* <TouchableOpacity
          style={{height: 60, width: 120, backgroundColor: 'pink'}}
          onPress={() => console.log(this.state.inventoryData)}>
          <Text>press</Text>
        </TouchableOpacity> */}
          <FlatList
            data={this.state.inventoryData}
            renderItem={({item}) => <InventoryList item={item} />}
            keyExtractor={(item) => item.stockUniqueName}
          />
          {/* <InventoryList /> */}
        </View>
      );
    }
  }
}

const mapStateToProps = (state) => {
  return {
    isLoginInProcess: state.LoginReducer.isAuthenticatingUser,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    // getCountriesAction: dispatch.common.getCountriesAction,
    // logoutAction: dispatch.auth.logoutAction,
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(InventoryScreen);