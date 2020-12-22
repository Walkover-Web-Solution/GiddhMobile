import React from 'react';
import {View, Text, TouchableOpacity, FlatList, Dimensions} from 'react-native';
import style from './style';
import {GdSVGIcons} from '@/utils/icons-pack';
import {Image} from 'react-native-svg';
import {GDInput} from '@/core/components/input/input.component';
import {TextInput} from 'react-native-gesture-handler';
import {createEndpoint} from '@/utils/helper';

const {height, width} = Dimensions.get('window');

export class Invoice extends React.Component<any, any> {
  render() {
    return (
      <View style={style.container}>
        <View style={{height: height * 0.25, backgroundColor: '#229F5F'}}>
          <View style={{flexDirection: 'row', marginTop: 15, paddingHorizontal: 15, alignItems: 'center'}}>
            <GdSVGIcons.back color={'#fff'} width={20} height={20} />
            <Text style={{fontSize: 19, fontWeight: 'bold', color: '#fff', marginLeft: 15}}>Sales Invoice</Text>
            <Text style={{fontSize: 16, position: 'absolute', right: 15, color: '#fff'}}>credit</Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              marginTop: 15,
              paddingHorizontal: 15,
              alignItems: 'center',
            }}>
            <GdSVGIcons.profile color={'#fff'} width={20} height={20} />
            <TextInput
              placeholder={'Select party Name'}
              placeholderTextColor={'#fff'}
              style={{marginLeft: 10, paddingHorizontal: 5}}
            />
          </View>
          <TextInput
            placeholder={'₹00.00'}
            placeholderTextColor={'#fff'}
            keyboardType={'number-pad'}
            style={{marginLeft: 30, paddingHorizontal: 5, fontSize: 20, marginTop: 5}}
          />
        </View>
        <Text style={{fontSize: 20, fontWeight: 'bold'}}>Welcome Shubhendra!</Text>
        {/* <TouchableOpacity
          delayPressIn={0}
          style={{
            height: 60,
            width: 120,
            backgroundColor: 'pink',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() =>
            console.log(
              createEndpoint(
                'v2/company/:companyUniqueName/groups/sundrycreditors/account-balances?page=1&count=10&sort=desc&sortBy=closingBalance&refresh=false',
              ),
            )
          }>
          <Text>Press</Text>
        </TouchableOpacity> */}
      </View>
    );
  }
}

export default Invoice;
