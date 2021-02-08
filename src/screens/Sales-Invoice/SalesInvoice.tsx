import React from 'react';
import {GDContainer} from '@/core/components/container/container.component';
import {View, Text, TouchableOpacity, FlatList, DeviceEventEmitter} from 'react-native';
import style from './style';
import {connect} from 'react-redux';
import AsyncStorage from '@react-native-community/async-storage';

import Icon from '@/core/components/custom-icon/custom-icon';
import {Bars} from 'react-native-loader';
import color from '@/utils/colors';
import _ from 'lodash';
import {APP_EVENTS, STORAGE_KEYS} from '@/utils/constants';

interface Props {
  navigation: any;
}

export class SalesInvoice extends React.Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }
  render() {
    

    return (
      <GDContainer>
        <View style={style.container}>
        
        </View>
        {this.state.loading && (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              top: 0,
            }}>
            <Bars size={15} color={color.PRIMARY_NORMAL} />
          </View>
        )}
      </GDContainer>
    );
  }
}

function mapStateToProps(state) {
  const {commonReducer} = state;
  return {
    ...commonReducer,
  };
}
function mapDispatchToProps(dispatch) {
  return {
    getCompanyAndBranches: () => {
      dispatch(getCompanyAndBranches());
    },
  };
}

const MyComponent = connect(mapStateToProps, mapDispatchToProps)(ChangeCompany);
export default MyComponent;
