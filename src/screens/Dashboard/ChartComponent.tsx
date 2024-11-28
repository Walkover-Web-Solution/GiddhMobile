import useCustomTheme, { ThemeProps } from '@/utils/theme';
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import DateFilter from './component/DateFilter';
import moment from 'moment';
import { CommonService } from '@/core/services/common/common.service';
import Loader from '@/components/Loader';
import getSymbolFromCurrency from 'currency-symbol-map';
import { formatAmount } from '@/utils/helper';
import { Text as SvgText} from 'react-native-svg';
import Toast from '@/components/Toast';

const ChartComponent = () => {
    const {styles, theme} = useCustomTheme(makeStyles, 'Stock');
    const [date, setDate] = useState<{ startDate: string, endDate: string }>({ startDate: moment().subtract(30, 'd').format('DD-MM-YYYY'), endDate: moment().format('DD-MM-YYYY') });
    const [dateMode, setDateMode] = useState('defaultDates');
    const [activeDateFilter, setActiveDateFilter] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chartLoading, setChartLoading] = useState(false);
    const optionModalizeRef = useRef(null);
    const [totalExpense, setTotalExpense] = useState({});
    const [totalIncome, setTotalIncome] = useState({});
    const [netPL, setnetPL] = useState({});
    const formatNumber = (value : number) => { 
        return value ? parseFloat(value.toFixed(2)) : 0; 
    }

    // const formatNumberToShorthand = (num) => {
    //   if (num >= 10000000) {
    //     return (num / 10000000).toFixed(1) + "Cr";
    //   } else if (num >= 100000) {
    //     return (num / 100000).toFixed(1) + "L";
    //   } else if (num >= 1000) {
    //     return (num / 1000).toFixed(1) + "K";
    //   } else {
    //     return num.toString();
    //   }
    // }
    const changeDate = (startDate: string, endDate: string) => {
        setDate({ startDate, endDate });
    }

    const _setActiveDateFilter = (activeDateFilter: string, dateMode: string) => {
        setActiveDateFilter(activeDateFilter);
        setDateMode(dateMode);
    };


    const fetchProfitLossDetails = async () => {
      try {
          const response = await CommonService.fetchProfitLossDetails(date.startDate, date.endDate);
          console.log("-------------------------",response);
          if(response?.body && response?.status == "success"){
              setChartLoading(false);
              setTotalExpense({...response?.body?.incomeStatment?.totalExpenses})
              setTotalIncome({...response?.body?.incomeStatment?.revenue})
              setnetPL({...response?.body?.incomeStatment?.incomeBeforeTaxes})
          }else{
            setChartLoading(false);
            Toast({message: response?.data?.message, position:'BOTTOM',duration:'LONG'})
        }
    } catch (error) {
        console.log("error while fetching profit and loss details");
        setChartLoading(false);
      }
    }

    useEffect(() => {
        setChartLoading(true);
        setTimeout(()=>fetchProfitLossDetails(),1000);
    }, [date]);

    console.log("tota",totalExpense,totalIncome);
    

    const pieData = [
    {   value: (totalExpense?.amount == 0 && totalIncome?.amount == 0) ? 50 : formatNumber(totalIncome?.amount), 
        color: totalIncome?.amount == 0 ? theme.colors.solids.grey.light : '#a5292a', 
        gradientCenterColor: totalIncome?.amount == 0 ? theme.colors.solids.grey.light : theme.colors.solids.red.medium ,
        tooltipText:'Income',
        text:'Income'
    },
    {   value: (totalExpense?.amount == 0 && totalIncome?.amount == 0) ? 50 : formatNumber(totalExpense?.amount), 
        color: totalExpense?.amount == 0 ? theme.colors.solids.grey.light : '#1a237e', 
        gradientCenterColor: totalExpense?.amount == 0 ? theme.colors.solids.grey.light : theme.colors.solids.blue.light,
        tooltipText:'Expense',
        text:'Expense'
    }
    ];

    return (
    <View style={styles.container}>
        <DateFilter 
            startDate={date.startDate}
            endDate={date.endDate}
            dateMode={dateMode}
            activeDateFilter={activeDateFilter}
            disabled={isLoading}
            changeDate={changeDate}
            setActiveDateFilter={_setActiveDateFilter}
            optionModalRef={optionModalizeRef}
            showHeading={true}
        />
        
        { !chartLoading ? 
        <View style={styles.chartContainer}>
            <View>
                <PieChart
                    data={pieData}
                    donut
                    isAnimated
                    radius={105}
                    innerRadius={55}
                    strokeWidth={3}
                    strokeColor={theme.colors.solids.white}
                    textColor={theme.colors.solids.black}
                    font={theme.typography.fontFamily.bold}
                    textSize={theme.typography.fontSize.xSmall.size}
                    extraRadius={42}
                    // tooltipHorizontalShift={10}
                    // tooltipVerticalShift={-10}
                    // tooltipBackgroundColor='#FAF9F6'
                    // showTooltip = {(totalExpense?.amount == 0 && totalIncome?.amount == 0 ) ? false : true}
                    showExternalLabels = {(totalExpense?.amount == 0 && totalIncome?.amount == 0 ) ? false : true}
                    labelLineConfig={{length:-20,labelComponentWidth: 45,}}
                    paddingHorizontal={10}
                    externalLabelComponent={(item) => {
                    return <SvgText fontSize={theme.typography.fontSize.small.size} fontFamily={theme.typography.fontFamily.bold}>
                            {item?.text}
                        </SvgText>
                    }}
                    centerLabelComponent={(totalExpense?.amount == 0 && totalIncome?.amount == 0 ) ? ()=>(<><Text style={styles.spending}>No Data</Text></>) : ()=>(<></>)}
                />
            </View>
            <View style={{paddingHorizontal: 16,width:'100%'}}>
                <View style={{flexDirection:'row',justifyContent:'space-between',alignContent:'center'}}>
                    <Text style={styles.totalAmount}>Net Profit/Loss</Text>
                    <Text style={styles.totalAmount}>{(netPL?.amount ? (netPL?.amount !==0 && (netPL?.type?.charAt?.(0) == 'C') ? '+ ' : '- ') : '') }{getSymbolFromCurrency('INR')} {formatAmount(netPL?.amount)}</Text>
                </View>
                <View style={{flexDirection:'row',justifyContent:'space-between',alignContent:'center'}}>
                    <Text style={styles.totalAmount}>Total Income</Text>
                    <Text style={[styles.totalAmount,{color:'#a5292a'}]}>{getSymbolFromCurrency('INR')} {formatAmount(totalIncome?.amount)}{(formatNumber(totalIncome?.amount)!==0) && (totalIncome?.type?.charAt(0) == 'C' ? ' Cr.' : ' Dr.')}</Text>
                </View>
                <View style={{flexDirection:'row',justifyContent:'space-between',alignContent:'center'}}>
                    <Text style={styles.totalAmount}>Total Expenses</Text>
                    <Text style={[styles.totalAmount,{color:'#1a237e'}]}>{getSymbolFromCurrency('INR')} {formatAmount(totalExpense?.amount)}{(formatNumber(totalExpense?.amount)!==0) && (totalExpense?.type?.charAt(0) == 'C' ? ' Cr.' : ' Dr.')}</Text>
                </View>
            </View>
        </View>
         : <View style={styles.chartContainer}><Loader isLoading={chartLoading}/></View>}
    </View>
);
};

const makeStyles= (theme:ThemeProps) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.solids.white,
  },
  chartContainer: {
    backgroundColor: theme.colors.solids.white,
    alignItems: 'center',
    minHeight:300,
    minWidth:310
  },
  centerLabel: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalAmount: {
    fontSize: theme.typography.fontSize.regular.size,
    lineHeight: theme.typography.fontSize.regular.lineHeight,
    color: theme.colors.solids.black,
    fontFamily:theme.typography.fontFamily.semiBold,
    marginVertical:2
  },
  spending: {
    fontSize: theme.typography.fontSize.regular.size,
    lineHeight: theme.typography.fontSize.regular.lineHeight,
    color: theme.colors.solids.grey.dark,
    fontFamily:theme.typography.fontFamily.bold,
  },
});

export default ChartComponent;
