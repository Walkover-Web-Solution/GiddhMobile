import React from 'react';
import {Text} from 'react-native';
import {Dispatch, RootState} from '@/core/store';
import {connect} from 'react-redux';
import {GDContainer} from '@/core/components/container/container.component';
import {CommonService} from '@/core/services/common/common.service';
import MoreComponent from '@/screens/More/components/More/more.component';

type connectedProps = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;
type Props = connectedProps & {navigation: any};

export class MoreScreen extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props);
  }

  getData = async () => {
    await CommonService.getCurrencies();
  };

  render() {
    return (
      <GDContainer>
        <MoreComponent
          navigation={this.props.navigation}
          countries={this.props.countries}
          getCountriesAction={this.props.getCountriesAction}
          isCountriesLoading={this.props.isCountriesLoading}
          logoutAction={this.props.logoutAction}
        />
      </GDContainer>
    );
  }
}

const mapStateToProps = (state: RootState) => {
  return {
    isLoginInProcess: state.LoginReducer.isAuthenticatingUser,
    // countries: state.common.countries,
    // isCountriesLoading: state.common.isCountriesLoading,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    getCountriesAction: dispatch.common.getCountriesAction,
    logoutAction: dispatch.auth.logoutAction,
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(MoreScreen);
