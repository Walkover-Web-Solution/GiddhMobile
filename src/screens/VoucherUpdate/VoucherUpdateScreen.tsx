import { Alert, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { ScrollContainer } from '@/components/Container'
import Header from '@/components/Header'
import useCustomTheme, { ThemeProps } from '@/utils/theme'
import { capitalizeName } from '@/utils/helper'
import PartyName from './components/PartyName'
import Amount from './components/Amount'
import moment from 'moment'
import Icon from '@/core/components/custom-icon/custom-icon';
import { FONT_FAMILY } from '@/utils/constants'


const voucherName = 'Sales'
const VoucherUpdateScreen = () => {
    const isSalesVoucher = voucherName === 'Sales';
    const { theme, statusBar, voucherBackground, styles } = useCustomTheme(getStyles, voucherName);
    const [salesInvoiceType, setSalesInvoiceType] = useState<'sales' | 'cash'>('sales');
    const [partyName, setPartyName] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [date, setDate] = useState(moment().startOf('day'));
    const [dueDate, setDueDate] = useState(moment().startOf('day'));
    const [invoiceDatePicker, setInvoiceDatePicker] = useState(false);
    const [dueDatePicker, setDueDatePicker] = useState(false);


    const resetAll = () => { }

    function getYesterdayDate() {
        setDate(moment().subtract(1, 'days'))
    }
    
    function getTodayDate() {
        setDate(moment());
    }
    
    function formatDate(dateType: any) {
        const fulldays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
        const someDateTimeStamp : any = dateType == 'InvoiceDate' ? date : dueDate;
        var dt: any = (dt = new Date(someDateTimeStamp));
        const _date = dt.getDate();
        const month = months[dt.getMonth()];
        const timeDiff = someDateTimeStamp - Date.now();
        const diffDays = new Date().getDate() - _date;
        const diffYears = new Date().getFullYear() - dt.getFullYear();
        const diffMonth = new Date().getMonth() - dt.getMonth();
        if (diffYears === 0 && diffDays === 0) {
          return 'Today';
        } else if (diffYears === 0 && diffDays === 1) {
          return 'Yesterday';
        } else if (diffYears === 0 && diffDays === -1) {
          return 'Tomorrow';
        } else if (diffYears === 0 && diffMonth === 0 && diffDays < -1 && diffDays > -7) {
          return fulldays[dt.getDay()];
        } else {
          return month + ' ' + _date + ', ' + new Date(someDateTimeStamp).getFullYear();
        }
      }

    const renderDateView = () => {
        return (
          <View>
            <View style={styles.dateView}>
              <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => {
                if (!partyName) {
                    Alert.alert('Please select a party.');
                } else {
                    setInvoiceDatePicker(true)
                }
              }}>
                <Icon name={'Calendar'} color={'#229F5F'} size={16} />
                <Text style={styles.selectedDateText}>{'Invoice Date - ' + formatDate('InvoiceDate')}</Text>
                {/* <Text style={style.selectedDateText}>{"Invoice Date "}</Text> */}
              </TouchableOpacity>
              <TouchableOpacity
                style={{ borderColor: '#D9D9D9', borderWidth: 1, paddingHorizontal: 4, paddingVertical: 2 }}
                onPress={() => {
                  if (!partyName) {
                    Alert.alert('Please select a party.');
                  } else {
                    date.startOf('day').isSame(moment().startOf('day'))
                      ? getYesterdayDate()
                      : getTodayDate()
                  }
                }
                }>
                <Text style={{ color: '#808080' }}>
                  {date.startOf('day').isSame(moment().startOf('day')) ? 'Yesterday?' : 'Today?'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.dueDateView}>
              <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => {
                if (!partyName) {
                  Alert.alert('Please select a party.');
                } else { 
                    setDueDatePicker(true)
                 }
              }}>
                <Icon name={'Calendar'} color={'#229F5F'} size={16} />
                <Text style={styles.selectedDateText}>{'Due Date - ' + formatDate('DueDate')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      }

    return (
        <ScrollContainer>
            <Header
                header={'Sales Invoice'}
                backgroundColor={voucherBackground}
                statusBarColor={statusBar}
                isBackButtonVisible={true}
                headerRightContent={
                    <>
                        { isSalesVoucher && 
                            <Pressable 
                                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                                onPress={() => setSalesInvoiceType((prev) => prev === 'sales' ? 'cash' : 'sales')}
                            >
                                <Text style={styles.salesInvoiceName}>
                                    {capitalizeName(salesInvoiceType)} ?
                                </Text> 
                            </Pressable>
                        } 
                    </>
                }
            />
            
            <PartyName
                partyName={partyName}
                placeHolder={salesInvoiceType === 'cash' ? 'Enter Party Name' : 'Search Party Name'}
                onChangeText={setPartyName}
                isSearching={isSearching}
                resetAll={resetAll}
            />

            <Amount currencySymbol={'RS.'} totalAmount={42342}/>

            {renderDateView()}


        </ScrollContainer>
    )
}

export default VoucherUpdateScreen

const getStyles = (theme : ThemeProps) => StyleSheet.create({
    salesInvoiceName: {
        fontFamily: theme.typography.fontFamily.semiBold,
        fontSize: theme.typography.fontSize.large.size,
        color: theme.colors.solids.white
    },
    dateView: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 50
      },
      dueDateView: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 45
      },
      selectedDateText: {
        fontFamily: FONT_FAMILY.regular,
        fontSize: 14,
        marginLeft: 10,
        alignSelf: 'center'
      },
})