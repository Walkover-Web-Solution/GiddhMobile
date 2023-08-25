import React from 'react';
import { connect } from 'react-redux';
import { View, DeviceEventEmitter, Text, Image } from 'react-native';
import style from '@/screens/Parties/style';
import color from '@/utils/colors';
import { PartiesList } from '@/screens/Parties/components/parties-list.component';
import { CommonService } from '@/core/services/common/common.service';
import * as CommonActions from '@/redux/CommonAction';
import { PartiesPaginatedResponse } from '@/models/interfaces/parties';
// @ts-ignore
import { Bars } from 'react-native-loader';
import { APP_EVENTS } from '@/utils/constants';
import { ScrollView } from 'react-native-gesture-handler';

type PartiesScreenProp = {
  logout: Function;
};

type PartiesScreenState = {
  showLoader: boolean;
  partiesDebtData: any;
  partiesCredData: any;
  debtData: any;
  creditors: boolean;
  dataLoadedTime: string
};

export class PartiesScreen extends React.Component<PartiesScreenProp, PartiesScreenState> {
  constructor(props: PartiesScreenProp) {
    super(props);
    this.state = {
      showLoader: false,
      partiesDebtData: [],
      partiesCredData: [],
      debtData: [],
      creditors: false,
      dataLoadedTime: ''
    };
  }

  arrangeAZ = () => {
    this.setState({
      // debtData: this.state.debtData.sort((a, b) =>
      //   a.name.toUpperCase().split(' ')[0].localeCompare(b.name.toUpperCase().split(' ')[0])
      // ),
      showLoader: false
    });
  };

  apiCalls = async () => {
      this.setState({
        showLoader: true
      });
    await this.getPartiesSundryDebtors();
    await this.getPartiesSundryCreditors();
    this.setState(
      {
        debtData: [...this.state.partiesDebtData, ...this.state.partiesCredData]
      }
      , () => {
        this.arrangeAZ();
      }
    );
  };



  componentDidMount() {
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.CustomerCreated, () => {
      this.apiCalls();
    });
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.comapnyBranchChange, () => {
      this.apiCalls()
    });
    this.apiCalls();
  }

  render() {
    const { activeCompany }: any = this.props;

    if (this.state.showLoader) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Bars size={15} color={color.PRIMARY_NORMAL} />
        </View>
      );
    } else {
      return (
        this.state.debtData.length == 0
          ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFBFF' }}>
              <Image
                source={require('@/assets/images/noParty.png')}
                style={{ resizeMode: 'contain', height: 230, width: 300 }}
              />
              <Text style={{ fontFamily: 'AvenirLTStd-Black', fontSize: 25, marginTop: 0 }}>No Parties</Text>
            </View>
          )
          :
          (<ScrollView style={style.container}>
            {this.state.debtData.length > 9 ? <Text style={{ textAlign: "center",  fontFamily:'AvenirLTStd-Black' }}>TOP 10 Creditors and Debtors</Text> : null}
            <PartiesList partiesData={this.state.debtData} activeCompany={activeCompany} />
          </ScrollView>)
      );
    }
  }

  private async getPartiesSundryDebtors() {
    try {
      // console.log('debtors called');
      const debtors = await CommonService.getPartiesSundryDebtors();
      // console.log('data is', ...debtors.body.results, ...creditors.body.results);
      if(debtors?.body?.results){
        this.setState({
          partiesDebtData: debtors.body.results
        });
      }
    } catch (e) {
      console.log("Error in getPartiesSundryDebtors ", e);
    }
  }

  private async getPartiesSundryCreditors() {
    try {
      // console.log('Creditors called');
      const creditors = await CommonService.getPartiesSundryCreditors();
      // console.log('creditors are', creditors.body.results);
      this.setState({
        // debtData: this.state.debtData.concat(creditors.body.results),
        partiesCredData: creditors.body.results
      });
    } catch (e) {
      this.setState({ partiesCredData: new PartiesPaginatedResponse() });
      console.log("Error in getPartiesSundryCreditors ", e);
      this.setState({ showLoader: false });
    }
  }
}

const mapStateToProps = () => {
  return {
    // activeCompany: state.company.activeCompany,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    logout: () => {
      dispatch(CommonActions.logout());
    }
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(PartiesScreen);
