import React from 'react';
import {GDContainer} from '@/core/components/container/container.component';
import {View, Text, TouchableOpacity, FlatList} from 'react-native';
import style from './style';
import {GdSVGIcons} from '@/utils/icons-pack';
import {Image} from 'react-native-svg';
import {GDInput} from '@/core/components/input/input.component';
import Input from './components/input';

export class CompanyInfoOne extends React.Component<any, any> {
  render() {
    return (
      <View style={style.container}>
        <Text style={style.heading}>Welcome Shubhendra!</Text>
        <Text style={style.message}>Enter the following details to start hastle free accounting with Giddh</Text>
        <View style={{marginTop: 20}} />
        <Input
          name={'Company Name'}
          icon={<GdSVGIcons.company color={'#F8B100'} width={22} height={22} />}
          placeholder={'Company Name'}
        />
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Input
            name={'Country'}
            width={'40%'}
            icon={<GdSVGIcons.location color={'#F8B100'} width={22} height={22} />}
            placeholder={'Select'}
          />
          <Input
            name={'Currency'}
            width={'40%'}
            icon={<GdSVGIcons.currency color={'#F8B100'} width={22} height={22} />}
            placeholder={'Select'}
          />
        </View>
        <Input
          name={'Mobile number'}
          icon={<GdSVGIcons.phone color={'#F8B100'} width={22} height={22} />}
          placeholder={'94256XXXXX'}
        />

        <TouchableOpacity
          style={style.buttonOne}
          delayPressIn={0}
          onPress={() => this.props.navigation.navigate('CompanyInfoTwo')}>
          <Text style={{fontSize: 20, color: 'white'}}>Next</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

export default CompanyInfoOne;
