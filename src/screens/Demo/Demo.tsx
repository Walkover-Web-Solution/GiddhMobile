import React from 'react';
import { connect } from 'react-redux';
import { GDContainer } from '@/core/components/container/container.component';
import { CommonService } from '@/core/services/common/common.service';
import DemoComponent from '@/screens/Demo/components/Demo/demo.component';
import { View } from 'react-native';

type connectedProps = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;
type Props = connectedProps;

export class DemoScreen extends React.Component<Props, {}> {
  constructor (props: Props) {
    super(props);
  }

  getData = async () => {
    await CommonService.getCurrencies();
  };

  render () {
    return (
      <View style={{flex:1}}>
        <DemoComponent
          countries={this.props.countries}
          getCountriesAction={this.props.getCountriesAction}
          isCountriesLoading={this.props.isCountriesLoading}
          logoutAction={this.props.logoutAction}
        />
      </View>
    );
  }
}

const mapStateToProps = (state: RootState) => {
  return {
    isLoginInProcess: state.LoginReducer.isAuthenticatingUser
    // countries: state.common.countries,
    // isCountriesLoading: state.common.isCountriesLoading,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    getCountriesAction: dispatch.common.getCountriesAction,
    logoutAction: dispatch.auth.logoutAction
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(DemoScreen);
