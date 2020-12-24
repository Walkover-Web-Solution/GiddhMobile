import React from 'react';
import {Dispatch, RootState} from '@/core/store';
import {connect} from 'react-redux';
import {GDContainer} from '@/core/components/container/container.component';
import {GDRoundedDateRangeInput} from '@/core/components/input/rounded-date-range-input.component';
import TransactionList from '@/screens/Transaction/components/transaction-list.component';
import {View} from 'react-native';
import style from '@/screens/Transaction/style';
import styles from '@/screens/Transaction/components/styles';
import {GdSVGIcons} from '@/utils/icons-pack';

type connectedProps = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;
type Props = connectedProps;

export class TransactionScreen extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    return (
      <GDContainer>
        <View style={style.container}>
          <View style={style.filterStyle}>
            <View style={style.dateRangePickerStyle}>
              <GDRoundedDateRangeInput label="Select Date" />
            </View>
            <View style={styles.iconPlacingStyle}>
              <View style={style.iconCard}>
                <GdSVGIcons.download style={styles.iconStyle} width={18} height={18} />
              </View>
              <View style={{width: 15}} />
              <View style={style.iconCard}>
                <GdSVGIcons.sort style={styles.iconStyle} width={18} height={18} />
              </View>
            </View>
          </View>
          <View style={{marginTop: 10}} />
          <TransactionList />
        </View>
      </GDContainer>
    );
  }
}

const mapStateToProps = (state: RootState) => {
  return {
    isLoginInProcess: state.LoginReducer.isAuthenticatingUser,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    // getCountriesAction: dispatch.common.getCountriesAction,
    // logoutAction: dispatch.auth.logoutAction,
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(TransactionScreen);
