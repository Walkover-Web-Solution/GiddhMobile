import React from 'react';
import {connect} from 'react-redux';
import {GDContainer} from '@/core/components/container/container.component';
import {GDRoundedDateRangeInput} from '@/core/components/input/rounded-date-range-input.component';
import {View, TouchableOpacity, Text, FlatList, DeviceEventEmitter, Image, Dimensions} from 'react-native';
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

const {height, width} = Dimensions.get('window');

export class InventoryMainScreen extends React.Component<Props, {}> {
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
  // componentDidMount() {
  //   this.listener = DeviceEventEmitter.addListener(APP_EVENTS.comapnyBranchChange, () => {
  //     this.setState(
  //       {
  //         showLoader: true,
  //       },
  //       () => this.getInventories(),
  //     );
  //   });
  //   this.getInventories();
  // }

  async getInventories() {
    try {
      console.log(this.state.startDate, this.state.endDate, 'api called');
      const companyName = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyUniqueName);
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

  changeDate = (SD, ED) => {
    if (SD) {
      this.setState({
        startDate: moment(SD).format('DD-MM-YYYY'),
      });
    }
    if (ED) {
      this.setState(
        {
          endDate: moment(ED).format('DD-MM-YYYY'),
        },
        () => this.getInventories(),
      );
    }
  };

  render() {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Image
          source={require('@/assets/images/noInventory.png')}
          style={{resizeMode: 'contain', height: height * 0.3, width: width * 0.8}}
        />
        <Text style={{fontFamily: 'AvenirLTStd-Black', fontSize: 25, marginTop: 10}}>Inventory coming soon</Text>
      </View>
    );

    // if (this.state.showLoader) {
    //   return (
    //     <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
    //       <Bars size={15} color={colors.PRIMARY_NORMAL} />
    //     </View>
    //   );
    // } else {
    //   return (
    //     <View style={style.container}>
    //       <GDRoundedDateRangeInput
    //         label="Select Date"
    //         startDate={this.state.startDate}
    //         endDate={this.state.endDate}
    //         onChangeDate={this.changeDate}
    //       />
    //       {/* <View style={style.filterStyle}>
    //         <View style={style.dateRangePickerStyle}>
    //           <GDRoundedDateRangeInput label="Select Date" />
    //         </View>
    //         <View style={styles.iconPlacingStyle}>
    //           <GDButton label="+ Add New" type={ButtonType.secondary} shape={ButtonShape.rounded} />
    //         </View>
    //       </View> */}
    //       {/* <TouchableOpacity
    //       style={{height: 60, width: 120, backgroundColor: 'pink'}}
    //       onPress={() => console.log(this.state.inventoryData)}>
    //       <Text>press</Text>
    //     </TouchableOpacity> */}
    //       <FlatList
    //         data={this.state.inventoryData}
    //         renderItem={({item}) => <InventoryList item={item} />}
    //         keyExtractor={(item) => item.stockUniqueName}
    //       />
    //       {/* <InventoryList /> */}
    //     </View>
    //   );
    // }
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
export default connect(mapStateToProps, mapDispatchToProps)(InventoryMainScreen);
