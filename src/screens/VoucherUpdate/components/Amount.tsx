import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { formatAmount } from '@/utils/helper'
import { FONT_FAMILY } from '@/utils/constants'

const Amount = ({ currencySymbol, totalAmount }) => {
  return (
    <View style={styles.content}>
        <Text style={styles.invoiceAmountText}>{`${currencySymbol} ${formatAmount(totalAmount)}`}</Text>
    </View>
  )
}

export default Amount

const styles = StyleSheet.create({
    content : { paddingVertical: 10, paddingHorizontal: 15 },
    invoiceAmountText: {
        fontFamily: FONT_FAMILY.bold,
        color: '#1C1C1C',
        fontSize: 18
      }

})