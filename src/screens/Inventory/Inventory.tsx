import React from 'react';
import {connect} from 'react-redux';
import {GDContainer} from '@/core/components/container/container.component';
import {View} from 'react-native';
import style from '@/screens/Inventory/style';
import {GDRoundedDateRangeInput} from '@/core/components/input/rounded-date-range-input.component';
import styles from '@/screens/Transaction/components/styles';
import {ButtonShape, ButtonType} from '@/models/enums/button';
import {GDButton} from '@/core/components/button/button.component';
import InventoryList from '@/screens/Inventory/components/inventory-list.component';

type connectedProps = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;
type Props = connectedProps;

export class InventoryScreen extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props);
  }

  render() {
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

        <InventoryList />
      </View>
    );
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
