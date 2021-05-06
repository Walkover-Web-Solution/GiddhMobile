import React from 'react';
import { SafeAreaView, StyleProp, Text, TouchableOpacity, View, ViewStyle, FlatList } from 'react-native';
import styles from '@/screens/Parties/components/PMstyle';
import { GdSVGIcons } from '@/utils/icons-pack';
import { SwipeListView } from 'react-native-swipe-list-view';
import colors, { baseColor } from '@/utils/colors';
import * as constants from '@/utils/constants';
import { PartiesPaginatedResponse } from '@/models/interfaces/parties';
// @ts-ignore
import getSymbolFromCurrency from 'currency-symbol-map';
import { Company } from '@/models/interfaces/company';
import { Bars } from 'react-native-loader';
import { Props } from '@ui-kitten/components/devsupport/services/props/props.service';


export const Customers = (props: Props) => {
  const { navigation } = props;
  return (
    <View>
    </View>
  );
};
