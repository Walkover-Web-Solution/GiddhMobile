import React from 'react';
import utilStyles from '@/utils/style';
import { SafeAreaView } from 'react-native-safe-area-context';

type GDContainerProps = {
  children: React.ReactNode;
};

export const GDContainer = (props: GDContainerProps) => {
  return <SafeAreaView style={utilStyles.container}>{props.children}</SafeAreaView>;
};
