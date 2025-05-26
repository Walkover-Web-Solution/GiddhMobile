import React from 'react';
import { StatusBar,Platform, View } from 'react-native';
import { connect } from 'react-redux';
import { GDContainer } from '@/core/components/container/container.component';
import { CommonService } from '@/core/services/common/common.service';
import MoreComponent from '@/screens/More/components/More/more.component';
import * as CommonActions from '@/redux/CommonAction';
import { useIsFocused } from '@react-navigation/native';

type connectedProps = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;
type Props = connectedProps & {navigation: any};

export class MoreScreen extends React.Component<Props, {}> {
  constructor (props: Props) {
    super(props);
  }

  FocusAwareStatusBar = (isFocused) => {
    return isFocused ? <StatusBar backgroundColor="#1A237E" barStyle={Platform.OS=='ios'?"dark-content":"light-content"} /> : null;
  };

  getData = async () => {
    await CommonService.getCurrencies();
  };

  render () {
    return (
      // <GDContainer>
      <View style={{flex:1}}>
        {/* {this.FocusAwareStatusBar(this.props.isFocused)} */}
        <MoreComponent
          navigation={this.props.navigation}
          countries={this.props.countries}
          getCountriesAction={this.props.getCountriesAction}
          isCountriesLoading={this.props.isCountriesLoading}
          logout={this.props.logout}
          companyList={this.props.comapnyList}
          branchList={this.props.branchList}
          isFetchingCompanyList={this.props.isFetchingCompanyList}
        />
      </View>
      // </GDContainer>
    );
  }
}

const mapStateToProps = (state) => {
  const { commonReducer } = state;

  return {
    isLoginInProcess: state.LoginReducer.isAuthenticatingUser,
    ...commonReducer
    // countries: state.common.countries,
    // isCountriesLoading: state.common.isCountriesLoading,
  };
};

const mapDispatchToProps = (dispatch) => {
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

  return <MoreScreen {...props} isFocused={isFocused} />;
}

// export default connect(mapStateToProps)(Screen);

export default connect(mapStateToProps, mapDispatchToProps)(Screen);
