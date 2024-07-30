import React from 'react';
import { connect } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';
import { StatusBar,Platform } from 'react-native';
import * as CommonActions from '../../redux/CommonAction';
import { GDContainer } from '@/core/components/container/container.component';
import HomeComponent from '@/screens/Home/components/Home/home.component';
import { CommonService } from '@/core/services/common/common.service';

type connectedProps = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;
type Props = connectedProps;

export class HomeScreen extends React.Component<Props, {}> {
  constructor (props: Props) {
    super(props);
  }

  FocusAwareStatusBar = (isFocused) => {
    return isFocused ? <StatusBar backgroundColor="#1A237E" barStyle={Platform.OS=="ios"?"dark-content":"light-content"} /> : null;
  };

  getData = async () => {
    await CommonService.getCurrencies();
  };

  render () {
    return (
      <GDContainer>
        {this.FocusAwareStatusBar(this.props.isFocused)}
        <HomeComponent
          countries={this.props.countries}
          logout={this.props.logout}
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
    isLoginInProcess: state.LoginReducer.isAuthenticatingUser
    // countries: state.common.countries,
    // isCountriesLoading: state.common.isCountriesLoading,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    logout: () => {
      dispatch(CommonActions.logout());
    }
    // getCountriesAction: dispatch.common.getCountriesAction,
    // logoutAction: dispatch.auth.logoutAction,
  };
};

function Screen (props) {
  const isFocused = useIsFocused();

  return <HomeScreen {...props} isFocused={isFocused} />;
}

export default connect(mapStateToProps, mapDispatchToProps)(Screen);
// export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);
