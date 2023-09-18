import React from 'react';
import { connect } from 'react-redux';
import { InventoryScreen } from './Inventory';
import { AccountScreen } from './Accounts';

type connectedProps = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;
type Props = connectedProps;
type State = {};

export class AccountMainScreen extends React.Component<Props, State> {
  constructor (props: Props) {
    super(props);
  }

  componentDidMount () { }

  render () {
    return (
      <AccountScreen
      navigation = {this.props.navigation}
      />
    );
  }
}

const mapStateToProps = () => {
  return {};
};

const mapDispatchToProps = () => {
  return {};
};
export default connect(mapStateToProps, mapDispatchToProps)(AccountMainScreen);
