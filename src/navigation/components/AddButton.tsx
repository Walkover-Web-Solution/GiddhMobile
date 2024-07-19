import React from 'react';
import {
    View,
    Dimensions,
    FlatList,
    Text,
    TouchableOpacity,
    DeviceEventEmitter,
    StyleSheet
} from 'react-native';
import SalesInvoice from '@/assets/images/icons/options/SalesInvoice.svg'
import CreditNote from '@/assets/images/icons/options/CreditNote.svg'
import PurchaseBill from '@/assets/images/icons/options/PurchaseBill.svg'
import DebitNote from '@/assets/images/icons/options/DebitNote.svg'
import Payment from '@/assets/images/icons/options/Payment.svg'
import Receipt from '@/assets/images/icons/options/Receipt.svg'
import Customer from '@/assets/images/icons/options/Customer.svg'
import Vendor from '@/assets/images/icons/options/Vendor.svg'
import Service from '@/assets/images/icons/options/service.svg'
import Group from '@/assets/images/icons/options/group-wise.svg'
import Stock from '@/assets/images/icons/options/stock.svg'
import Variant from '@/assets/images/icons/options/varient-wise.svg'
import { APP_EVENTS, FONT_FAMILY, GD_FONT_SIZE } from '@/utils/constants';
import Product from 'react-native-vector-icons/Ionicons'
import Service2 from 'react-native-vector-icons/FontAwesome'
import { Modalize } from 'react-native-modalize';
import { Portal } from 'react-native-portalize';
import { DefaultTheme } from '@/utils/theme';

const SIZE = 48;
const padding = 10;
const { height, width } = Dimensions.get('window');
const itemWidth = (Dimensions.get('window').width - (SIZE + padding * 10)) / (width > 550 ? 5 : 4);

const arrButtons = [
    { name: 'Sales Invoice', navigateTo: 'InvoiceScreens', icon: <SalesInvoice color={'#229F5F'} />, color: '#229F5F' },
    { name: 'Credit Note', navigateTo: 'CreditNoteScreens', icon: <CreditNote color={'#3497FD'} />, color: '#3497FD' },
    { name: 'Purchase Bill', navigateTo: 'PurchaseBillScreens', icon: <PurchaseBill color={'#FC8345'} />, color: '#FC8345' },
    { name: 'Debit Note', navigateTo: 'DebitNoteScreens', icon: <DebitNote color={'#ff6961'} />, color: '#ff6961' },
    { name: 'Payment', navigateTo: 'PaymentScreens', icon: <Payment color={'#084EAD'} />, color: '#084EAD' },
    { name: 'Receipt', navigateTo: 'ReceiptScreens', icon: <Receipt color={'#00B795'} />, color: '#00B795' },
    { name: 'Customer', navigateTo: 'CustomerVendorScreens', icon: <Customer color={'#864DD3'} />, color: '#864DD3' },
    { name: 'Vendor', navigateTo: 'CustomerVendorScreens', icon: <Vendor color={'#FF72BE'} />, color: '#FF72BE' },
    // { name: 'Advance Rcpt', navigateTo: 'AdvanceReceiptScreens', icon: 'Group-6188', color: '#51C445' }
    // {name: 'Purchase Bill', navigateTo: 'Purchase_Bill', icon: 'Purchase_Bill', color: '#FC8345'},
    // {name: 'Receipt', navigateTo: 'Receipt', icon: 'Receipt', color: '#00B795'},
    // {name: 'Payment', navigateTo: 'Payment', icon: 'Payment', color: '#084EAD'},
    // {name: 'Sales Invoice', navigateTo: 'Sales_Invoice', icon: 'shopping-bag', color: '#229F5F'},
    // {name: 'Purchase Bill', navigateTo: 'Purchase_Bill', icon: 'Purchase_Bill', color: '#FC8345'},
    // {name: 'Receipt', navigateTo: 'Receipt', icon: 'Receipt', color: '#00B795'},
    // {name: 'Payment', navigateTo: 'Payment', icon: 'Payment', color: '#084EAD'},
];

const inventoryButtons:any = {
    item1 : {
        name: 'Product Stock', 
        navigateTo: 'ProductScreen', 
        icon: <Stock color='#000' />, 
        color: DefaultTheme.colors.secondary,
        event : 'ProductScreenRefresh'
    },
    item2 : {
        name: 'Product Group', 
        navigateTo: 'productGroupScreen', 
        icon: <Variant color='#008000' />, 
        color: DefaultTheme.colors.secondary,
        event : 'ProductGroupRefresh'   
    },
    item3 : {   
        name: 'Service Stock', 
        navigateTo: 'ServiceScreen', 
        icon: <Service color={'#A52A2A'}/>, 
        color: 'red',
        event : 'ServiceScreenRefresh'
    },
    item4 : {
        name: 'Service Group', 
        navigateTo: 'productGroupScreen', 
        icon: <Group color={'#FFA500'} />, 
        color: 'red',
        event: 'ServiceGroupRefresh'
    }
}

type Props = {
    navigation: any;
    isDisabled: any;
    plusButtonRef: any;
    productOptionRef:any;
    closeModal: () => void;
}

class AddButtonOptions extends React.PureComponent<Props> {
    constructor(props: Props) {
        super(props);
    }

    render() {
        const data = Object.keys(inventoryButtons).map(key => inventoryButtons[key]);

        const getRows = (items:any, itemsPerRow:number) => {
            const rows = [];
            for (let i = 0; i < items.length; i += itemsPerRow) {
              rows.push(items.slice(i, i + itemsPerRow));
            }
            return rows;
        };


        const rows = getRows(data, 4);
        return (
            <Portal>
                <Modalize
                    ref={this?.props?.plusButtonRef}
                    adjustToContentHeight={true}
                    withHandle={false}
                    modalStyle={styles.modalStyle}
                >
                    <View style={{flex:1,padding:12}}>
                        <Text style={styles.listTitle}>Inventory</Text>
                        {rows.map((rowItems, rowIndex) => (
                            <View style={styles.buttonContainer} key={rowIndex}>
                            {rowItems.map((item) => (
                                <TouchableOpacity
                                key={item.name}
                                activeOpacity={0.7}
                                style={styles.button}
                                onPress={async ()=>{
                                    this?.props?.closeModal();
                                    console.log("event emitted-->",APP_EVENTS?.[item?.event]);
                                    
                                    await DeviceEventEmitter.emit(APP_EVENTS?.[item?.event], {});
                                    await this.props.navigation.navigate(item.navigateTo, { params : { name : item.name } });
                                }}
                                >
                                <View style={styles.iconContainer}>
                                    {item.icon}
                                </View>
                                <Text style={styles.name}>{item.name}</Text>
                                </TouchableOpacity>
                            ))}
                            </View>
                        ))}
                    </View>
                    <FlatList
                        numColumns={4}
                        data={arrButtons}
                        showsVerticalScrollIndicator={false}
                        style={styles.flatlistStyle}
                        ListHeaderComponent = {()=>(<Text style={styles.listTitle}>Vouchers</Text>)}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                            activeOpacity={0.7}
                            style={styles.button}
                            onPress={async () => {
                                this?.props?.closeModal();
                                if (item.name == 'Customer') {
                                    await this.props.navigation.navigate(item.navigateTo, { screen: 'CustomerVendorScreens', params: { index: 0, uniqueName: null } });
                                    await DeviceEventEmitter.emit(APP_EVENTS.REFRESHPAGE, {});
                                } else if (item.name == 'Vendor') {
                                    await this.props.navigation.navigate(item.navigateTo, { screen: 'CustomerVendorScreens', params: { index: 1, uniqueName: null } });
                                    await DeviceEventEmitter.emit(APP_EVENTS.REFRESHPAGE, {});
                                } else {
                                    await DeviceEventEmitter.emit(APP_EVENTS.REFRESHPAGE, {});
                                    await this.props.navigation.navigate(item.navigateTo);
                                }
                            }}>
                                <View style={styles.iconContainer}>
                                    {item.icon}
                                </View>
                                <Text style={styles.name}>{item.name}</Text>
                            </TouchableOpacity>
                        )}
                        keyExtractor={(item) => item.name}
                        />
                </Modalize>
            </Portal>
        );
    }
}

export default AddButtonOptions;

const styles = StyleSheet.create({
    buttonContainer : {
        flexDirection:'row'
    },
    button: {
        width: itemWidth,
        alignItems: 'center',
        margin: padding
    },
    modalStyle: { 
        margin: 20, 
        marginBottom: 50, 
        borderRadius: 12, 
        overflow: 'hidden' 
    },
    flatlistStyle: { 
        flex: 1, 
        alignSelf: 'center', 
        padding: 12 
    },
    iconContainer: {
        width: itemWidth,
        backgroundColor: '#F9F9F9',
        borderRadius: itemWidth / 2,
        height: itemWidth,
        justifyContent: 'center',
        alignItems: 'center'
    },
    name: { 
        fontFamily: FONT_FAMILY.semibold, 
        fontSize: GD_FONT_SIZE.small, 
        textAlign: 'center', 
        marginTop: 5 
    },
    listTitle: {
        fontFamily: FONT_FAMILY.bold, 
        fontSize: GD_FONT_SIZE.medium, 
        marginTop: 5, 
        color:DefaultTheme.colors.secondary
    }
})
