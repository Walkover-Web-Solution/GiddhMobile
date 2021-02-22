import React from 'react';
import {View, Text, TouchableOpacity, FlatList, Dimensions, Platform, PermissionsAndroid, Alert} from 'react-native';
import style from './style';
import {GdSVGIcons} from '@/utils/icons-pack';
import {Image} from 'react-native-svg';
import {GDInput} from '@/core/components/input/input.component';
import {TextInput} from 'react-native-gesture-handler';
import {createEndpoint} from '@/utils/helper';
import AsyncStorage from '@react-native-community/async-storage';
import {STORAGE_KEYS} from '@/utils/constants';
import {GDRoundedDateRangeInput} from '@/core/components/input/rounded-date-range-input.component';
import httpInstance from '@/core/services/http/http.service';
import moment from 'moment';
import RNFetchBlob from 'rn-fetch-blob';
import base64 from 'react-native-base64';

import Share from 'react-native-share';

const {height, width} = Dimensions.get('window');

export class Invoice extends React.Component<any, any> {
  func1 = async () => {
    const activeCompany = await AsyncStorage.getItem(STORAGE_KEYS.googleEmail);
    // const branchName = await AsyncStorage.getItem(STORAGE_KEYS.activeBranchUniqueName);
    console.log(activeCompany);
    // console.log(moment().subtract(30, 'd').format('DD-MM-YYYY'));
  };
  // func2 = async () => {
  //   const bodyData = {voucherNumber: ['SA-RCPT-20210129-1'], voucherType: 'receipt'};
  //   try {
  //     const activeCompany = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyUniqueName);
  //     const token = await AsyncStorage.getItem(STORAGE_KEYS.token);
  //     RNFetchBlob.fetch(
  //       'POST',
  //       `https://api.giddh.com/company/${activeCompany}/accounts/shebakhan/vouchers/download-file?fileType=pdf`,
  //       {
  //         'session-id': `${token}`,
  //         'Content-Type': 'application/json',
  //       },
  //       JSON.stringify(bodyData),
  //     ).then((res) => {
  //       let base64Str = res.base64();
  //       let pdfLocation = `${RNFetchBlob.fs.dirs.DownloadDir}/downloaded.pdf`;
  //       RNFetchBlob.fs.writeFile(pdfLocation, base64Str, 'base64');
  //     });
  //   } catch (e) {
  //     console.log(e);
  //     console.log(e);
  //   }
  // };
  func2 = async () => {
    const shareOptions = {
      title: 'Share via',
      message: 'some message',
      url: `file://${RNFetchBlob.fs.dirs.DownloadDir}/downloaded.pdf`,
      social: Share.Social.WHATSAPP,
      whatsAppNumber: '918770132578', // country code + phone number
      filename: 'test', // only for base64 file in Android
    };

    Share.shareSingle(shareOptions)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        err && console.log(err);
      });
  };
  downloadFile = async () => {
    try {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        this.func2();
      } else {
        Alert.alert('Permission Denied!', 'You need to give storage permission to download the file');
      }
    } catch (err) {
      console.warn(err);
    }
  };
  render() {
    return (
      <View style={style.container}>
        <View style={{width: '100%', backgroundColor: '#229F5F', padding: 15}}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <GdSVGIcons.back color={'#fff'} width={20} height={20} />
            <Text style={{fontSize: 19, fontFamily: 'AvenirLTStd-Black', color: '#fff', marginLeft: 15}}>
              Sales Invoice
            </Text>
            <Text style={{fontSize: 16, position: 'absolute', right: 15, color: '#fff'}}>credit</Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              marginTop: 15,

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
            style={{marginLeft: 30, paddingHorizontal: 5, fontSize: 20, marginTop: 5, color: '#fff'}}
          />
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 15,
            paddingVertical: 10,
            marginTop: 15,
          }}>
          <GdSVGIcons.calendar color={'#fff'} width={22} height={22} />
          <Text style={{marginLeft: 15, fontSize: 18, fontFamily: 'AvenirLTStd-Black'}}>Today</Text>
          <View style={{padding: 5, borderColor: '#000', borderWidth: 1, position: 'absolute', right: 15}}>
            <Text>Yesterday?</Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 15,
            marginTop: 15,
            paddingVertical: 10,
          }}>
          <GdSVGIcons.location color={'#fff'} width={22} height={22} />
          <Text style={{marginLeft: 15, fontSize: 18, fontFamily: 'AvenirLTStd-Black'}}>Billing Address</Text>
          <View style={{position: 'absolute', right: 15}}>
            <GdSVGIcons.arrowRight color={'#fff'} width={20} height={20} />
          </View>
        </View>
        <View style={{flexDirection: 'row', paddingHorizontal: 15, marginTop: 15, paddingVertical: 10}}>
          <GdSVGIcons.inventory color={'#fff'} width={22} height={22} />

          <View style={{paddingHorizontal: 15}}>
            <Text style={{fontSize: 18, fontFamily: 'AvenirLTStd-Black'}}>Select product/Service</Text>
            <View
              style={{
                height: 80,
                width: 80,
                backgroundColor: '#e0e0e0',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 10,
              }}>
              <Text style={{fontSize: 35, color: '#424242'}}>{'+'}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          delayPressIn={0}
          style={{
            height: 60,
            width: 120,
            backgroundColor: 'pink',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={this.func2}>
          <Text>Press</Text>
        </TouchableOpacity>
        {/* <GDRoundedDateRangeInput label={'dates'} /> */}
        {/* <TouchableOpacity
          delayPressIn={0}
          style={{
            height: 60,
            width: 120,
            backgroundColor: 'pink',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={this.func1}>
          <Text>Press 1</Text>
        </TouchableOpacity> */}
      </View>
    );
  }
}

export default Invoice;
