import React, { useRef } from 'react'
import { Dimensions, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native'
import { setBottomSheetVisible } from '@/components/BottomSheet'
import { FONT_FAMILY, GD_FONT_SIZE } from '@/utils/constants'
import { connect } from 'react-redux'
import Icon from '@/core/components/custom-icon/custom-icon';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import MoreOptions from './MoreOptions'
import Routes from '../routes';
import AddButtonOptions from './AddButton';
import SalesInvoice from '@/assets/images/icons/options/SalesInvoice.svg'
import CreditNote from '@/assets/images/icons/options/CreditNote.svg'
import PurchaseBill from '@/assets/images/icons/options/PurchaseBill.svg'
import DebitNote from '@/assets/images/icons/options/DebitNote.svg'
import Payment from '@/assets/images/icons/options/Payment.svg'
import Receipt from '@/assets/images/icons/options/Receipt.svg'
import VoucherSVG from '@/assets/images/icons/options/Voucher.svg'

const Vouchers = {
    'Sales' : (color: any) => <SalesInvoice color={color} height={20} width={20}/>,
    'Purchase' : (color: any) => <PurchaseBill color={color} height={20} width={20}/>,
    'Credit Note' : (color: any) => <CreditNote color={color} height={20} width={20}/>,
    'Debit Note' : (color: any) => <DebitNote color={color} height={20} width={20}/>,
    'Receipt' : (color: any) => <Receipt color={color} height={20} width={20}/>,
    'Payment' : (color: any) => <Payment color={color} height={20} width={20}/>
}
const { height } = Dimensions.get('window');
const SIZE = 48;

const TabBar = ({ state, descriptors, navigation, branchSelected, disableTabs, selectedVouchersForBottomTabs }) => {
    const moreOptionsRef = useRef(null);
    const plusButtonRef = useRef(null);

    return (
        <View style={styles.container}>
            { state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const label =
                    options.tabBarLabel !== undefined
                        ? options.tabBarLabel
                        : options.title !== undefined
                            ? options.title
                            : route.name;

                const isFocused = state.index === index;

                const onPress = () => {
                    if (route.name === Routes.More) {
                        setBottomSheetVisible(moreOptionsRef, true);
                    } else if (route.name == 'add') {
                        console.log('nothing');
                    } else {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    }
                };

                const onLongPress = () => {
                    navigation.emit({
                        type: 'tabLongPress',
                        target: route.key
                    });
                };

                const renderIcon = (label: string) => {
                    if (label === Routes.BottomTabScreen1) {
                        return (
                            <View style={{ backgroundColor: disableTabs ? '#eeeeee' : isFocused ? '#e3e8ff' : '#eeeeee', padding: 8, borderRadius: 20 }}>
                                {Vouchers[selectedVouchersForBottomTabs[0]](disableTabs ? '#808080' : isFocused ? '#5773FF' : '#808080')}
                            </View>
                        );
                    } else if (label === Routes.BottomTabScreen2) {
                        return (
                            <View style={{ backgroundColor: disableTabs ? '#eeeeee' : isFocused ? '#e3e8ff' : '#eeeeee', padding: 8, borderRadius: 20 }}>
                                {Vouchers[selectedVouchersForBottomTabs[1]](disableTabs ? '#808080' : isFocused ? '#5773FF' : '#808080')}
                            </View>
                        );
                    } else if (label == 'Dashboard') {
                        return (
                            <View style={{ backgroundColor: disableTabs ? '#eeeeee' : isFocused ? '#e3e8ff' : '#eeeeee', padding: 8, borderRadius: 20 }}>
                                <MaterialCommunityIcons name="view-dashboard" size={20} color={disableTabs ? '#808080' : isFocused ? '#5773FF' : '#808080'} />
                            </View>
                        );
                    } else if (label == 'Parties') {
                        return (
                            <View style={{ backgroundColor: isFocused ? '#e3e8ff' : '#eeeeee', padding: 8, borderRadius: 20 }}>
                                <MaterialIcons name="person" size={20} color={isFocused ? '#5773FF' : '#808080'} />
                            </View>
                        )
                    } else if (label == 'More') {
                        return (
                            <View style={{ backgroundColor: isFocused ? '#e3e8ff' : '#eeeeee', padding: 8, borderRadius: 20 }}>
                                <VoucherSVG height={20} width={20} color={isFocused ? '#5773FF' : '#808080'}/>
                            </View>
                        );
                    } else if (label == 'Inventory') {
                        return (
                            <View style={{ backgroundColor: isFocused ? '#e3e8ff' : '#eeeeee', padding: 10.5, borderRadius: 20 }}>
                                <Icon name="Path-13016" size={20} color={isFocused ? '#5773FF' : '#808080'} />
                            </View>)
                    }
                    else if (label == 'Accounts') {
                        return (
                            <View style={{ backgroundColor: isFocused ? '#e3e8ff' : '#eeeeee', padding: 8.0, borderRadius: 20 }}>
                                <Text style={{ color: isFocused ? '#5773FF' : '#808080', fontSize: 12, fontFamily: 'AvenirLTStd-Black', lineHeight: 20 }}>
                                    A/c</Text>
                            </View>)
                    }
                };

                return (
                    <TouchableOpacity
                        key={index?.toString()}
                        disabled={disableTabs}
                        accessibilityLabel={options.tabBarAccessibilityLabel}
                        onPress={onPress}
                        onLongPress={onLongPress}
                        style={{ alignItems: 'center', width: Dimensions.get('window').width * 0.2 }}
                    >
                        {renderIcon(label)}
                        <Text
                            style={{ color: disableTabs ? '#808080' : isFocused ? '#5773FF' : '#808080', fontSize: 13, fontFamily: 'AvenirLTStd-Book' }}
                            numberOfLines={1}
                        >
                            {   label === Routes.BottomTabScreen1 ? selectedVouchersForBottomTabs[0]
                                    : label === Routes.BottomTabScreen2 ? selectedVouchersForBottomTabs[1]
                                        : label
                            }
                        </Text>
                    </TouchableOpacity>
                );
            })}
            <MoreOptions moreOptionsRef={moreOptionsRef} />
            { branchSelected && 
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => { setBottomSheetVisible(plusButtonRef, true); }}
                    style={styles.plusButton}
                >
                    <Entypo name="plus" size={24} color={'#fff'} />
                </TouchableOpacity>
            }
            <AddButtonOptions key={'add'} plusButtonRef={plusButtonRef} closeModal={() => setBottomSheetVisible(plusButtonRef, false)} isDisabled={disableTabs} navigation={navigation} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: 'white',
        height: height * 0.08,
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        shadowOffset: {
            width: 0,
            height: 1
        },
    },
    text: {
        fontFamily: FONT_FAMILY.regular,
        fontSize: GD_FONT_SIZE.normal,
        color: '#1C1C1C',
        marginLeft: 8
    },
    button: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center'
    },
    boldText: {
        color: '#FFFFFF',
        fontFamily: FONT_FAMILY.bold,
        fontSize: 14,
    },
    plusButton: {
        alignItems: 'center',
        justifyContent: 'center',
        width: SIZE,
        height: SIZE,
        borderRadius: 50,
        backgroundColor: '#5773FF',

        position: 'absolute', 
        bottom: height * 0.08 + SIZE / 2, 
        right: 16,
        ...Platform.select({
            android: {
                elevation: 8,
            },
            ios: {
                shadowColor: '#000000',
                shadowOffset: {
                width: 2,
                height: 5,
                },
                shadowOpacity: 0.3,
                shadowRadius: 4,
            },
        }),
    }
})

const mapStateToProps = (state) => {
    return {
        disableTabs: state.commonReducer.isUnauth,
        selectedVouchersForBottomTabs: state.commonReducer.selectedVouchersForBottomTabs,
    }
}

export default connect(mapStateToProps)(TabBar);