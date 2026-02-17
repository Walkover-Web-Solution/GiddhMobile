import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import BottomSheet, { setBottomSheetVisible } from '@/components/BottomSheet'
import { FONT_FAMILY, GD_FONT_SIZE } from '@/utils/constants'
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { connect } from 'react-redux'
import { setVoucherForBottomTabs } from '@/redux/CommonAction'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next';

const Vouchers = {
    SALES: 'Sales',
    PURCHASE: 'Purchase',
    CREDIT_NOTE: 'Credit Note',
    DEBIT_NOTE: 'Debit Note',
    RECEIPT: 'Receipt',
    PAYMENT: 'Payment'
}

type Props = {
    moreOptionsRef: any
    selectedVouchersForBottomTabs: Array<string>
    dispatchSetVoucherForBottomTabs: (vouchers: Array<string>) => void
}

const MoreOptions: React.FC<Props> = ({ moreOptionsRef, selectedVouchersForBottomTabs, dispatchSetVoucherForBottomTabs }) => {
    const navigation = useNavigation();
    const vouchersArray: Array<string> = Object.values(Vouchers)
    const [selectedVouchers, setSelectedVouchers] = useState<Array<string>>(selectedVouchersForBottomTabs)
    const { t } = useTranslation();

    const RenderFooter = () => {
        return (
            <TouchableOpacity 
                activeOpacity={0.7}
                style={styles.doneButton}
                onPress={() => {
                    dispatchSetVoucherForBottomTabs(selectedVouchers)
                    setBottomSheetVisible(moreOptionsRef, false)
                }}
            >
                <Text style={styles.boldText}>{t('common.done')}</Text>
            </TouchableOpacity>
        )
    }

    useEffect(() => {
        setSelectedVouchers(selectedVouchersForBottomTabs);
    }, [selectedVouchersForBottomTabs])

    return (
        <BottomSheet
            bottomSheetRef={moreOptionsRef}
            headerText={t('AddButton.Vouchers')}
            headerTextColor='#1C1C1C'
            FooterComponent={<RenderFooter />}
            onClose={() => setSelectedVouchers(selectedVouchersForBottomTabs)}
        >
            <Text style={styles.smallText}>{t('MoreOptions.clickOnStar')} <FontAwesome name={'star-o'} size={14} color={'#1C1C1C'}/> {t('MoreOptions.toPinTheVoucherInMenu')}</Text>
            {
                vouchersArray.map((voucher) => {
                    const isSelected = selectedVouchers.includes(voucher);
                    return (
                        <View
                            key={voucher}
                            style={styles.buttonView}
                        >
                            <TouchableOpacity
                                activeOpacity={0.7}
                                style={styles.buttonIcon}
                                onPress={() => {
                                    setSelectedVouchers((prevVouchers) => {
                                        return [...prevVouchers.slice(1), voucher]
                                    })
                                }}
                            >
                                <FontAwesome
                                    name={isSelected ? 'star' : 'star-o'}
                                    size={20}
                                    color={isSelected ? '#5773FF' : '#808080'}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                style={styles.buttonText}
                                onPress={() => {
                                    setBottomSheetVisible(moreOptionsRef, false);
                                    navigation.navigate('VoucherScreen', { voucherName: voucher });
                                }}
                            >

                                <Text style={[styles.text, isSelected && { color: '#5773FF' }]}>{t(`Vouchers.${voucher}`)}</Text>
                            </TouchableOpacity>
                        </View>
                    )
                })
            }
        </BottomSheet>
    )
}

const styles = StyleSheet.create({
    text: {
        fontFamily: FONT_FAMILY.semibold,
        fontSize: GD_FONT_SIZE.normal,
        color: '#1C1C1C'
    },
    buttonView: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    buttonIcon: {
        paddingLeft: 16,
        paddingRight: 10,
        paddingVertical: 12,
    },
    buttonText: {
        flex: 1,
        paddingVertical: 12,
    },
    boldText: {
        color: '#FFFFFF',
        fontFamily: FONT_FAMILY.bold,
        fontSize: 14,
    },
    doneButton: { 
        backgroundColor: '#3553E6', 
        width: "30%", 
        margin: 10, 
        padding: 5, 
        paddingVertical: 10, 
        borderRadius: 10, 
        alignItems: "center", 
        alignSelf: "flex-end" 
    },
    smallText: {
        color: '#1C1C1C',
        fontFamily: FONT_FAMILY.semibold,
        fontSize: 12,
        alignSelf: 'center',
        paddingVertical: 4
    }
})

const mapStateToProps = (state: any) => {
    return {
        selectedVouchersForBottomTabs: state.commonReducer.selectedVouchersForBottomTabs
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return {
        dispatchSetVoucherForBottomTabs: (vouchers: Array<string>) => {
            dispatch(setVoucherForBottomTabs(vouchers));
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MoreOptions);