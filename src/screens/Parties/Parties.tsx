import React from 'react';
import { connect } from 'react-redux';
import { View, DeviceEventEmitter, Text, Image, EmitterSubscription } from 'react-native';
import style from '@/screens/Parties/style';
import color from '@/utils/colors';
import { CommonService } from '@/core/services/common/common.service';
import * as CommonActions from '@/redux/CommonAction';
import { PartiesPaginatedResponse } from '@/models/interfaces/parties';
// @ts-ignore
import LoaderKit  from 'react-native-loader-kit';
import { APP_EVENTS } from '@/utils/constants';
import { withTranslation, WithTranslation } from 'react-i18next';

type PartiesScreenProp = {
  logout: Function;
} & WithTranslation;

type PartiesScreenState = {
  showLoader: boolean;
  partiesDebtData: any;
  partiesCredData: any;
  debtData: any;
  creditors: boolean;
  dataLoadedTime: string
};

export class PartiesScreen extends React.Component<PartiesScreenProp, PartiesScreenState> {
  private listener1!: EmitterSubscription;
  private listener2!: EmitterSubscription;
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
    this.listener1 = DeviceEventEmitter.addListener(APP_EVENTS.CustomerCreated, () => {
      this.apiCalls();
    });
    this.listener2 = DeviceEventEmitter.addListener(APP_EVENTS.comapnyBranchChange, () => {
      this.apiCalls();
    });
    this.apiCalls();
  }

  componentWillUnmount(): void {
    this.listener1.remove();
    this.listener2.remove();
  }

  render() {
    const { activeCompany }: any = this.props;

    if (this.state.showLoader) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <LoaderKit
              style={{ width: 45, height: 45 }}
              name={'LineScale'}
              color={color.PRIMARY_NORMAL}
          />
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
              <Text style={{ fontFamily: 'AvenirLTStd-Black', fontSize: 25, marginTop: 0 }}>{this.props.t('parties.noParties')}</Text>
            </View>
          )
          :
          (<View style={style.container}>
            {this.state.debtData.length > 1 ? <Text style={{ textAlign: "center",  fontFamily:'AvenirLTStd-Black' }}>{this.props.t('parties.top20CreditorsDebtors')}</Text> : null}
          </View>)
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
    } catch (error: any) {
      console.log("----- Error in getPartiesSundryDebtors -----", error?.data);
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
    } catch (error: any) {
      console.log("----- Error in getPartiesSundryCreditors -----", error?.data);
      this.setState({ partiesCredData: new PartiesPaginatedResponse() });
      this.setState({ showLoader: false });
    }
  }
}

const mapStateToProps = () => {
  return {
    // activeCompany: state.company.activeCompany,
  };
};
const mapDispatchToProps = (dispatch: any) => {
  return {
    logout: () => {
      dispatch(CommonActions.logout());
    }
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(PartiesScreen));
