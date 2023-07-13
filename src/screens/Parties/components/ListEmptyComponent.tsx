import { View, Text, Image, TouchableOpacity, DeviceEventEmitter } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'
import * as constants from '@/utils/constants';
import styles from '@/screens/Parties/components/PMstyle';

type Props = {
  message: string
  buttonLable: string
  partiesScreenIndex: 0 | 1
}

const ListEmptyComponent: React.FC<Props> = ({message, buttonLable, partiesScreenIndex}) => {
  const navigation = useNavigation();

  return (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Image
      style={styles.noPartyImage}
      source={require('../../../assets/images/noParty.png')}
    />
    <Text style={styles.emptyContainerText}>
      {message}
    </Text>
    <TouchableOpacity
      activeOpacity={0.8} 
      style={styles.buttonContainer}
      onPress={() => {
        navigation.navigate('CustomerVendorScreens', { screen: 'CustomerVendorScreens', params: { index: partiesScreenIndex, uniqueName: null } });
        DeviceEventEmitter.emit(constants.APP_EVENTS.REFRESHPAGE, {});
      }}>
      <Text style={styles.buttonText}>
        {buttonLable}
      </Text>
    </TouchableOpacity>
  </View>
  )
}

export default ListEmptyComponent