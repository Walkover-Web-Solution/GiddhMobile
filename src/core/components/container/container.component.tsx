import React from 'react';
import SafeAreaView from 'react-native-safe-area-view';
import utilStyles from '@/utils/style';

type GDContainerProps = {
  children: React.ReactNode;
};

export const GDContainer = (props: GDContainerProps) => {
  return <SafeAreaView style={utilStyles.container}>{props.children}</SafeAreaView>;
};
