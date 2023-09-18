import React from 'react';
import { FlatList, StyleProp, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import styles from '@/screens/Parties/components/styles';
import { GdSVGIcons } from '@/utils/icons-pack';
import { SwipeListView } from 'react-native-swipe-list-view';
import colors, { baseColor } from '@/utils/colors';
import * as constants from '@/utils/constants';
import { PartiesPaginatedResponse } from '@/models/interfaces/parties';
// @ts-ignore
import getSymbolFromCurrency from 'currency-symbol-map';
import { Company } from '@/models/interfaces/company';
import { useNavigation } from '@react-navigation/native';
import routes from '@/navigation/routes';
import { formatAmount } from '@/utils/helper';

type PartiesListProp = {
    item: any;
    activeCompany: Company | null;
};

const amountColorStyle = (type: string) => {
    let bgColor = colors.TEXT_NORMAL;
    if (type === 'CREDIT') {
        bgColor = baseColor.PRIMARY_RED;
    } else if (type === 'DEBIT') {
        bgColor = baseColor.PRIMARY_GREEN;
    } else {
        bgColor = colors.INPUT_COLOR;
    }
    return {
        color: '#000',
        fontFamily: 'AvenirLTStd-Black',
        fontSize: constants.GD_FONT_SIZE.medium
    };
};

export const AccountsList = (props: PartiesListProp) => {
    const { item, activeCompany } = props;
    const navigationRef = useNavigation()

    // function currencyFormat(amount: number, currencyType: string | undefined) {
    //     switch (currencyType) {
    //         case 'IND_COMMA_SEPARATED':
    //             // eslint-disable-next-line no-lone-blocks
    //             {
    //                 if (amount.toString().length > 4) {
    //                     return amount
    //                         .toFixed(1)
    //                         .toString()
    //                         .replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    //                 } else if (amount.toString().length === 3) {
    //                     return amount.toFixed(1).toString();
    //                 } else if (amount.toString().length === 4) {
    //                     return amount
    //                         .toFixed(1)
    //                         .toString()
    //                         .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    //                 }
    //             }
    //             break;
    //         case 'INT_SPACE_SEPARATED': {
    //             return amount
    //                 .toFixed(1)
    //                 .toString()
    //                 .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    //         }
    //         case 'INT_APOSTROPHE_SEPARATED': {
    //             return amount
    //                 .toFixed(1)
    //                 .toString()
    //                 .replace(/\B(?=(\d{3})+(?!\d))/g, "'");
    //         }
    //         default: {
    //             return amount
    //                 .toFixed(1)
    //                 .toString()
    //                 .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    //         }
    //     }
    // }
    return (
        <TouchableOpacity
            onPress={() => {
                console.log('itemitemitemitem', item)

                navigationRef.navigate("Account.PartiesTransactions", {
                    initial: false,
                    item: item,
                    type: (item.category === 'liabilities' ? 'Vendors' : 'Creditors'),
                    activeCompany: activeCompany
                });
            }}
            style={styles.rowFront}>
            <View style={styles.flatList}>
                <View style={styles.viewWrap}>
                    <Text style={styles.partiesName} numberOfLines={1}>
                        {item.name}
                    </Text>

                </View>
                <View style={{
                    flexDirection: 'row',
                    alignSelf: 'flex-end'
                }} >
                    {item.closingBalance?.amount !== 0 && (
                        <View style={styles.amountWrap}>
                            {item.country.code === 'IN' && (
                                <Text
                                    style={{
                                        color: '#000',
                                        fontFamily: 'AvenirLTStd-Book',
                                        fontSize: constants.GD_FONT_SIZE.medium
                                    }}
                                    numberOfLines={1}>
                                    {getSymbolFromCurrency('INR')}
                                    {formatAmount(item.closingBalance?.amount)}
                                </Text>
                            )}
                            {item.country.code !== 'IN' && (
                                <Text
                                    style={{
                                        color: '#000',
                                        fontFamily: 'AvenirLTStd-Book',
                                        fontSize: constants.GD_FONT_SIZE.medium
                                    }}
                                    numberOfLines={1}>
                                    {getSymbolFromCurrency(item.country.code)}
                                    {formatAmount(item.closingBalance?.amount)}
                                </Text>
                            )}
                            <View style={{ width: 2 }} />
                            {item.closingBalance.type == 'CREDIT' && (
                                <GdSVGIcons.outgoing style={styles.iconStyle} width={10} height={10} />
                            )}
                            {item.closingBalance.type == 'DEBIT' && (
                                <GdSVGIcons.incoming style={styles.iconStyle} width={10} height={10} />
                            )}
                        </View>
                    )}
                    {item.closingBalance?.amount === 0 && (
                        <View style={styles.amountWrap}>
                            <Text style={amountColorStyle(item.category) as StyleProp<ViewStyle>}>-</Text>
                        </View>
                    )}
                </View>
                <View style={styles.seperator} />
            </View>
        </TouchableOpacity>
    );
};
