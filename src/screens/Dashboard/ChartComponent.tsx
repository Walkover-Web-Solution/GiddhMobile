import useCustomTheme, { ThemeProps } from '@/utils/theme';
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Platform, DeviceEventEmitter, Keyboard, TouchableOpacity, Dimensions } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import Loader from '@/components/Loader';
import { formatAmount } from '@/utils/helper';
import { Text as SvgText} from 'react-native-svg';
import Toast from '@/components/Toast';
import { useSelector } from 'react-redux';
import { commonUrls } from '@/core/services/common/common.url';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_EVENTS, STORAGE_KEYS } from '@/utils/constants';
import MatButton from '@/components/OutlinedButton';
import BottomSheet from '@/components/BottomSheet';
import Icon from '@/core/components/custom-icon/custom-icon';
import { CommonService } from '@/core/services/common/common.service';

const {height, width} = Dimensions.get('window');

const ChartComponent = ({date, modalRef, setConsolidatedBranch, consolidatedBranch, setSelectedBranch, selectedBranch}) => {
    const {styles, theme} = useCustomTheme(makeStyles, 'Stock');
    const [chartLoading, setChartLoading] = useState(true);
    const [totalExpense, setTotalExpense] = useState({});
    const [totalIncome, setTotalIncome] = useState({});
    const [netPL, setnetPL] = useState({});
    const countryV2 = useSelector((state)=> state?.commonReducer?.companyDetails?.countryV2)
    const branchList = useSelector((state) => state?.commonReducer?.branchList);

    //funciton
    const formatNumber = (value : number) => { 
        return value ? parseFloat(value.toFixed(2)) : 0; 
    }

    const setBottomSheetVisible = (modalRef: React.Ref<BottomSheet>, visible: boolean) => {
        if (visible) {
          Keyboard.dismiss();
          modalRef?.current?.open();
        } else {
          modalRef?.current?.close();
        }
    };

    //api calls
    const fetchProfitLossDetails = async (branchUniqueName: string) => {
      try {
        setChartLoading(true);
        const consolidateState = await AsyncStorage.getItem(STORAGE_KEYS.activeBranchUniqueName);
        setConsolidatedBranch(consolidateState ? consolidateState : ' ');
        const response = await CommonService.fetchProfitLossDetails(date.startDate, date.endDate, branchUniqueName ? branchUniqueName : consolidateState ? consolidateState : '');
        if(response?.body && response?.status == "success"){
            setTotalExpense({...response?.body?.incomeStatement?.totalExpenses})
            setTotalIncome({...response?.body?.incomeStatement?.revenue})
            setnetPL({...response?.body?.incomeStatement?.incomeBeforeTaxes})
        }else{
            Toast({message: response?.message, position:'BOTTOM',duration:'LONG'})
        }
        setChartLoading(false);
    } catch (error) {
        console.log("error while fetching profit and loss details");
        setChartLoading(false);
      }
    }

    //component
    const RenderBranchModal = (
        <BottomSheet
          bottomSheetRef={modalRef}
          headerText="Select Branch"
          headerTextColor="#084EAD"
          adjustToContentHeight={branchList?.length * 47 > height - 100 ? false : true}
          flatListProps={{
            data: branchList,
            renderItem: ({item}) => {
              return (
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    fetchProfitLossDetails(item?.uniqueName);
                    setSelectedBranch(item);
                    setBottomSheetVisible(modalRef, false);
                  }}>
                  <Icon
                    name={item?.alias === selectedBranch?.alias ? 'radio-checked2' : 'radio-unchecked'}
                    color={'#084EAD'}
                    size={16}
                  />
                  <Text style={styles.radiobuttonText}>{item?.alias}</Text>
                </TouchableOpacity>
              );
            },
            ListEmptyComponent: () => {
              return (
                <View style={styles.modalCancelView}>
                  <Text style={styles.modalCancelText}>No Data</Text>
                </View>
              );
            },
          }}
        />
      );

    useEffect(() => {
        setTimeout(()=>fetchProfitLossDetails(consolidatedBranch?.length == 1 ? selectedBranch?.uniqueName : ''),1500);
        DeviceEventEmitter.addListener(APP_EVENTS.consolidateBranch, (payload) => {
            setConsolidatedBranch(payload?.activeBranch);
            setSelectedBranch({});
        });
    }, [date]);


    const pieData = [
    {   value: (Object.keys(totalIncome).length === 0 || (totalExpense?.amount == 0 && totalIncome?.amount == 0)) ? 50 : formatNumber(totalIncome?.amount), 
        color: (Object.keys(totalIncome).length === 0 || totalIncome?.amount == 0) ? theme.colors.solids.grey.light : '#a5292a', 
        gradientCenterColor: totalIncome?.amount == 0 ? theme.colors.solids.grey.light : theme.colors.solids.red.medium ,
        tooltipText:'Income',
        text:'Income'
    },
    {   value: (Object.keys(totalExpense).length === 0 || (totalExpense?.amount == 0 && totalIncome?.amount == 0)) ? 50 : formatNumber(totalExpense?.amount), 
        color: (Object.keys(totalExpense).length === 0 || totalExpense?.amount == 0) ? theme.colors.solids.grey.light : '#1a237e', 
        gradientCenterColor: totalExpense?.amount == 0 ? theme.colors.solids.grey.light : theme.colors.solids.blue.light,
        tooltipText:'Expense',
        text:'Expense'
    }
    ];

    return (
    <View style={styles.container}>
        { !chartLoading ? 
        <View style={styles.chartContainer}>
            <View style={styles.pieChart}>
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
                    showExternalLabels = {(Object.keys(totalExpense).length === 0 || (totalExpense?.amount == 0 && totalIncome?.amount == 0 )) ? false : true}
                    labelLineConfig={{length:-20,labelComponentWidth: 45,}}
                    paddingHorizontal={10}
                    externalLabelComponent={(item) => {
                    return <SvgText fontSize={theme.typography.fontSize.small.size} fontFamily={theme.typography.fontFamily.bold}>
                            {item?.text}
                        </SvgText>
                    }}
                    centerLabelComponent={(Object.keys(totalExpense).length === 0 || (totalExpense?.amount == 0 && totalIncome?.amount == 0 )) ? ()=>(<><Text style={styles.spending}>No Data</Text></>) : ()=>(<></>)}
                />
            </View>
            <View style={{paddingHorizontal: 16,width:'100%'}}>
                <View style={{flexDirection:'row',justifyContent:'space-between',alignContent:'center'}}>
                    <Text style={styles.totalAmount}>Net Profit/Loss</Text>
                    <Text style={styles.totalAmount}>{(netPL?.amount ? (netPL?.amount !==0 && (netPL?.type?.charAt?.(0) == 'C') ? '+ ' : '- ') : '') }{countryV2?.currency?.symbol ? countryV2?.currency?.symbol : ''} {formatAmount(netPL?.amount)}</Text>
                </View>
                <View style={{flexDirection:'row',justifyContent:'space-between',alignContent:'center'}}>
                    <Text style={styles.totalAmount}>Total Income</Text>
                    <Text style={[styles.totalAmount,{color:'#a5292a'}]}>{countryV2?.currency?.symbol ? countryV2?.currency?.symbol : ''} {formatAmount(totalIncome?.amount)}{(formatNumber(totalIncome?.amount)!==0) && (totalIncome?.type?.charAt(0) == 'C' ? ' Cr.' : ' Dr.')}</Text>
                </View>
                <View style={{flexDirection:'row',justifyContent:'space-between',alignContent:'center'}}>
                    <Text style={styles.totalAmount}>Total Expenses</Text>
                    <Text style={[styles.totalAmount,{color:'#1a237e'}]}>{countryV2?.currency?.symbol ? countryV2?.currency?.symbol : ''} {formatAmount(totalExpense?.amount)}{(formatNumber(totalExpense?.amount)!==0) && (totalExpense?.type?.charAt(0) == 'C' ? ' Cr.' : ' Dr.')}</Text>
                </View>
            </View>
        </View>
         : <View style={styles.chartContainer}><Loader isLoading={chartLoading}/></View>}
         {RenderBranchModal}
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
    minWidth:310,
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
  matBtn:{
    width: '40%', 
    paddingRight: 16, 
    marginTop: -4
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  radiobuttonText: {
    color: '#1C1C1C',
    fontFamily: theme.typography.fontFamily.regular,
    lineHeight: theme.typography.fontSize.regular.lineHeight,
    marginLeft: 10,
  },
  modalCancelView: {
    height: height * 0.3,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  modalCancelText: {
    flex: 1,
    color: '#1C1C1C',
    paddingVertical: 4,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 14,
    textAlign: 'center',
    alignSelf: 'center',
  },
  pieChart: {
    marginTop:-10
  }
});

export default ChartComponent;
