import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import moment from 'moment';
import Icon from '@/core/components/custom-icon/custom-icon';

const DateSection = ({ }) => {
  return (
    <View>
        <View style={style.dateView}>
          <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => {
            if (!partyName) {
              alert('Please select a party.');
            } else {
              this.setState({ showDatePicker: true })
            }
          }}>
            <Icon name={'Calendar'} color={'#229F5F'} size={16} />
            <Text style={style.selectedDateText}>{'Invoice Date - ' + this.formatDate('InvoiceDate')}</Text>
            {/* <Text style={style.selectedDateText}>{"Invoice Date "}</Text> */}
          </TouchableOpacity>
          <TouchableOpacity
            style={{ borderColor: '#D9D9D9', borderWidth: 1, paddingHorizontal: 4, paddingVertical: 2 }}
            onPress={() => {
              if (!partyName) {
                alert('Please select a party.');
              } else {
                date.startOf('day').isSame(moment().startOf('day'))
                  ? this.getYesterdayDate()
                  : this.getTodayDate()
              }
            }
            }>
            <Text style={{ color: '#808080' }}>
              {date.startOf('day').isSame(moment().startOf('day')) ? 'Yesterday?' : 'Today?'}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={style.dueDateView}>
          <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => {
            if (!partyName) {
              alert('Please select a party.');
            } else { this.setState({ showDueDatePicker: true }) }
          }}>
            <Icon name={'Calendar'} color={'#229F5F'} size={16} />
            <Text style={style.selectedDateText}>{'Due Date - ' + this.formatDate('DueDate')}</Text>
          </TouchableOpacity>
        </View>
      </View>
  )
}

export default DateSection

const style = StyleSheet.create({
    dateView: {
      flexDirection: 'row',
      justifyContent:'space-between',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 10,
    },
    dueDateView: {
      flexDirection: 'row',
      justifyContent:'space-between',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 10,
    },
    selectedDateText: {
      color: '#229F5F',
      fontSize: 16,
      fontFamily: 'Poppins-SemiBold',
    },
})