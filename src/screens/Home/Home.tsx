import React from 'react';
import {Dispatch, RootState} from '@/core/store';
import {connect} from 'react-redux';
import {GDContainer} from '@/core/components/container/container.component';
import HomeComponent from '@/screens/Home/components/Home/home.component';
import {CommonService} from '@/core/services/common/common.service';

type connectedProps = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;
type Props = connectedProps;

export class HomeScreen extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props);
  }

  getData = async () => {
    await CommonService.getCurrencies();
  };

  render() {
    return (
      <GDContainer>
        <HomeComponent
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
    isLoginInProcess: state.auth.isLoginInProcess,
    countries: state.common.countries,
    isCountriesLoading: state.common.isCountriesLoading,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    getCountriesAction: dispatch.common.getCountriesAction,
    logoutAction: dispatch.auth.logoutAction,
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);
