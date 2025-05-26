import React from 'react';
// import SafeAreaView from 'react-native-safe-area-view';
import utilStyles from '@/utils/style';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from 'react-native';

type GDContainerProps = {
  children: React.ReactNode;
};

export const GDContainer = (props: GDContainerProps) => {
  // return <View style={utilStyles.container}>{props.children}</View>;
  return <SafeAreaView style={utilStyles.container}>{props.children}</SafeAreaView>;
};
