import React from 'react';
import { DeviceEventEmitter, FlatList, StyleProp, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
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
import AntDesign from 'react-native-vector-icons/AntDesign';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { useTranslation } from 'react-i18next';

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
    const navigationRef = useNavigation();
    const { t } = useTranslation();


    const renderRightAction = (item) => {
        return (
            <TouchableOpacity
                onPress={async () => {
                    await navigationRef.navigate("AddEntryStack", {
                        screen: "AddEntryScreen",
                        params: {
                          item: item,
                        }
                      })
                    await DeviceEventEmitter.emit(constants.APP_EVENTS.RefreshAddEntryPage, {})
                }}
                style={styles.addEntry}   >
                <AntDesign
                    name="pluscircleo"
                    size={14}
                    color={colors.PRIMARY_NORMAL}
                />
                <Text style={styles.addEntryText} >{t('common.addEntry')}</Text>
            </TouchableOpacity>
        )

    }

    return (
        <Swipeable
            renderRightActions={() => renderRightAction(item)}>
            <TouchableOpacity
                onPress={() => {

                    navigationRef.navigate("Account.PartiesTransactions", {
                        initial: false,
                        item: item,
                        type: (item.groupUniqueName === 'sundrycreditors' ? 'Vendors' : 'Creditors'),
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
        </Swipeable>
    );
};
