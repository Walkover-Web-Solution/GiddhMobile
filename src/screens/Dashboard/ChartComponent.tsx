import useCustomTheme, { ThemeProps } from '@/utils/theme';
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { useSelector } from 'react-redux';

const ChartComponent = () => {
    const {styles, theme} = useCustomTheme(makeStyles, 'Stock');

    useEffect(() => {
        
    }, []);

    const profit = 30;
    const loss = 50;

    const pieData = [
    { value: loss, color: theme.colors.solids.red.dark, gradientCenterColor: theme.colors.solids.red.medium },
    { value: profit, color: theme.colors.solids.blue.darkest, gradientCenterColor: theme.colors.solids.blue.light },
    ];

    return (
    <View style={styles.container}>
        <View style={styles.chartContainer}>
        <PieChart
            data={pieData}
            donut
            showGradient
            sectionAutoFocus
            radius={105}
            innerRadius={65}
            innerCircleColor={'white'}
            curvedEndEdges          
        />
        </View>
    </View>
);
};

const makeStyles= (theme:ThemeProps) => StyleSheet.create({
  container: {
    paddingTop: 20,
    backgroundColor: theme.colors.solids.white,
    marginBottom: 30,
  },
  chartContainer: {
    borderRadius: 20,
    backgroundColor: theme.colors.solids.white,
    alignItems: 'center',
  },
  centerLabel: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalAmount: {
    fontSize: theme.typography.fontSize.xLarge.size,
    lineHeight: theme.typography.fontSize.xLarge.lineHeight,
    color: theme.colors.solids.black,
    fontFamily:theme.typography.fontFamily.regular,
  },
  spending: {
    fontSize: theme.typography.fontSize.regular.size,
    lineHeight: theme.typography.fontSize.regular.lineHeight,
    color: theme.colors.solids.grey.dark,
    fontFamily:theme.typography.fontFamily.bold,
  },
});

export default ChartComponent;
