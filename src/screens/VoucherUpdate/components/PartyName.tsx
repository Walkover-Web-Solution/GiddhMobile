import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, TextInput, View } from 'react-native'
import React, { useState } from 'react'
import Icon from '@/core/components/custom-icon/custom-icon';
import { FONT_FAMILY } from '@/utils/constants';

const PartyName = ({ placeHolder, partyName, isSearching, onChangeText, resetAll }) => {
  return (
    <View style={{ flexDirection: 'row', minHeight: 50, alignItems: 'center', paddingTop: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>

          <Icon name={'Profile'} color={'#229F5F'} style={{ margin: 16 }} size={16} />
          <TextInput
            placeholderTextColor={'#808080'}
            placeholder={placeHolder}
            returnKeyType={'done'}
            value={partyName}
            onChangeText={onChangeText} 
            style={styles.searchTextInputStyle}
          />
          <ActivityIndicator color={'#5773FF'} size="small" animating={isSearching} />
        </View>
        <TouchableOpacity onPress={resetAll}>
          <Text style={{ color: '#1C1C1C', marginRight: 16, fontFamily: 'AvenirLTStd-Book' }}>Clear All</Text>
        </TouchableOpacity>
      </View>
  )
}

export default PartyName

const styles = StyleSheet.create({
    searchTextInputStyle: {
        color: '#1C1C1C',
        position: 'absolute',
        left: 40,
        fontFamily: FONT_FAMILY.bold,
        fontSize: 16,
        width: '60%'
      }
})