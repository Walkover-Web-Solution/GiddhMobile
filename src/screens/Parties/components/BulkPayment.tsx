import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import {
    View,
    TouchableOpacity,
    Dimensions,
    FlatList,
    Text,
    StatusBar,
    Alert,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import Icon from '@/core/components/custom-icon/custom-icon';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Dropdown from 'react-native-modal-dropdown';
import { GdSVGIcons } from '@/utils/icons-pack';
import { GD_ICON_SIZE } from '@/utils/constants';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Entypo from 'react-native-vector-icons/Entypo';
import colors, { baseColor } from '@/utils/colors';
import { TextInput } from 'react-native-gesture-handler';
import getSymbolFromCurrency from 'currency-symbol-map';
import { strict } from 'yargs';

class BulkPayment extends React.Component {
    constructor(props: Props) {
        super(props)
    }

    storeAmountAndReviewText = () => {
        let selectedItemTextinputAndReview: any = {}
        this.props.route.params.selectedItem.forEach((item) => {
            selectedItemTextinputAndReview[item.uniqueName] = {
                totalAmount: '',
                totalAmountPlaceHolder: '',
                remark: '',
                remarkPlaceHolder: ''
            }
        });
        return selectedItemTextinputAndReview
    }

    state = {
        payorDropDown: Dropdown,
        selectedItem: [...this.props.route.params.selectedItem],
        isPayorDD: false,
        selectedPayor: null,
        activeCompany: this.props.route.params.activeCompany,
        selectedItemTextinputAndReview: this.storeAmountAndReviewText()
    }

    componentDidMount() {
    }

    FocusAwareStatusBar = (isFocused: any) => {
        return isFocused ? <StatusBar backgroundColor="#520EAD" barStyle="light-content" /> : null;
    };

    currencyFormat(amount: number, currencyType: string | undefined) {
        switch (currencyType) {
            case 'IND_COMMA_SEPARATED':
                // eslint-disable-next-line no-lone-blocks
                {
                    if (amount.toString().length > 4) {
                        return amount
                            .toFixed(1)
                            .toString()
                            .replace(/\B(?=(\d{2})+(?!\d))/g, ',');
                    } else if (amount.toString().length === 3) {
                        return amount.toFixed(1).toString();
                    } else if (amount.toString().length === 4) {
                        return amount
                            .toFixed(1)
                            .toString()
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                    }
                }
                break;
            case 'INT_SPACE_SEPARATED': {
                return amount
                    .toFixed(1)
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
            }
            case 'INT_APOSTROPHE_SEPARATED': {
                return amount
                    .toFixed(1)
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, "'");
            }
            default: {
                return amount
                    .toFixed(1)
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            }
        }
    }

    removeItem = async (item: any) => {
        let selectedItem = [...this.state.selectedItem]
        for (let i = 0; i < selectedItem.length; i++) {
            if (selectedItem[i].uniqueName == item.uniqueName) {
                await selectedItem.splice(i, 1)
                await this.setState({ selectedItem })
                break
            }
        }
        let selectedItemTextinputAndReview = { ...this.state.selectedItemTextinputAndReview }
        await delete selectedItemTextinputAndReview[item.uniqueName]
        await this.setState({ selectedItemTextinputAndReview })
    }

    submit = () => {
        if (this.state.selectedPayor == null) {
            Alert.alert("Missing Fields", "Enter all the mandatory fields",
                [{ text: "OK", onPress: () => { console.log("Alert cancelled") } }])
            return
        }
        let totalAmountAndReviews = { ...this.state.selectedItemTextinputAndReview }
        for (var key in totalAmountAndReviews) {
            let amount = totalAmountAndReviews[key].totalAmount.replace(/₹/g, '')
            let review = totalAmountAndReviews[key].remark
            if (amount == '' || review == '') {
                Alert.alert("Missing Fields", "Enter all the mandatory fields",
                    [{ text: "OK", onPress: () => { console.log("Alert cancelled") } }])
                return
            }
        }
        this.props.navigation.navigate('BulkPaymentOTP', {
            selectedItems: this.state.selectedItem,
            totalAmountAndReviews: this.state.selectedItemTextinputAndReview,
            getback: this.props.route.params.getback
        })

    }

    renderItem = (item: any) => {
        return (
            <View style={{ marginHorizontal: 20, marginVertical: 5 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontSize: 15, }}>{item.name}</Text>
                    <View style={{ flexDirection: "row" }}>
                        <Text style={{ fontSize: 15, fontWeight: "bold" }}>
                            {item.country.code === 'IN' ? (getSymbolFromCurrency("INR") +
                                this.currencyFormat(item.closingBalance.amount, this.state.activeCompany?.balanceDisplayFormat)) :
                                (getSymbolFromCurrency(item.country.code) +
                                    this.currencyFormat(item.closingBalance.amount, this.state.activeCompany?.balanceDisplayFormat))}
                        </Text>
                        <View style={{ width: 2 }} />
                        {item.openingBalance.type == 'CREDIT' && (
                            <GdSVGIcons.outgoing style={{
                                height: GD_ICON_SIZE.input_icon,
                                width: GD_ICON_SIZE.input_icon,
                                alignSelf: 'flex-start',
                                marginTop: 5
                            }} width={10} height={10} />
                        )}
                        {item.openingBalance.type == 'DEBIT' && (
                            <GdSVGIcons.incoming style={{
                                height: GD_ICON_SIZE.input_icon,
                                width: GD_ICON_SIZE.input_icon,
                                alignSelf: 'flex-start',
                                marginTop: 7
                            }} width={10} height={10} />
                        )}
                    </View>
                </View>
                <View style={{ flexDirection: "row" }}>
                    <View style={{ backgroundColor: '#864DD3', width: 25, height: 25, borderRadius: 15, alignItems: "center", justifyContent: "center", marginTop: 10 }}>
                        <FontAwesome name={'dollar'} color="white" size={18} />
                    </View>
                    <TextInput
                        onBlur={() => {
                            if (this.state.selectedItemTextinputAndReview[item.uniqueName].totalAmount == '') {
                                let selectedItemTextinputAndReview = { ...this.state.selectedItemTextinputAndReview }
                                let deatils = selectedItemTextinputAndReview[item.uniqueName]
                                deatils.totalAmountPlaceHolder = ''
                                this.setState({ selectedItemTextinputAndReview: selectedItemTextinputAndReview })
                            }
                        }}
                        keyboardType="number-pad"
                        onFocus={() => {
                            let selectedItemTextinputAndReview = { ...this.state.selectedItemTextinputAndReview }
                            let deatils = selectedItemTextinputAndReview[item.uniqueName]
                            deatils.totalAmountPlaceHolder = 'a'
                            this.setState({ selectedItemTextinputAndReview: selectedItemTextinputAndReview })
                        }}
                        onChangeText={(text) => {
                            console.log(text)
                            let selectedItemTextinputAndReview = { ...this.state.selectedItemTextinputAndReview }
                            let deatils = selectedItemTextinputAndReview[item.uniqueName]
                            deatils.totalAmount = text
                            this.setState({ selectedItemTextinputAndReview: selectedItemTextinputAndReview })
                        }
                        }
                        style={{ fontSize: 15, textAlignVertical: "center", marginHorizontal: 10, width: "90%" }}>
                        <Text style={{ color: this.state.selectedItemTextinputAndReview[item.uniqueName].totalAmountPlaceHolder == '' ? 'rgba(80,80,80,0.5)' : '#1c1c1c' }}>{this.state.selectedItemTextinputAndReview[item.uniqueName].totalAmountPlaceHolder == '' ? 'Total Amount' : (item.country.code === 'IN' ? getSymbolFromCurrency("INR") : getSymbolFromCurrency(item.country.code) + this.state.selectedItemTextinputAndReview[item.uniqueName].totalAmount)}</Text>
                        <Text style={{ color: '#E04646' }}>{this.state.selectedItemTextinputAndReview[item.uniqueName].totalAmountPlaceHolder == '' ? '*' : ''}</Text>
                    </TextInput>
                </View>
                <View style={{ alignItems: "flex-end", justifyContent: "flex-end" }}>
                    <TouchableOpacity onPress={() => { this.removeItem(item) }} style={{ width: 30, height: 17, alignItems: "center", justifyContent: "center" }}>
                        <Entypo name={'cross'} color={colors.LABEL_COLOR} size={25} style={{ alignSelf: "center" }} />
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: "row", marginLeft: 0 }}>
                    <Ionicons name={'md-document-text'} color='#864DD3' size={27} />
                    <TextInput
                        onBlur={() => {
                            if (this.state.selectedItemTextinputAndReview[item.uniqueName].remark == '') {
                                let selectedItemTextinputAndReview = { ...this.state.selectedItemTextinputAndReview }
                                let deatils = selectedItemTextinputAndReview[item.uniqueName]
                                deatils.remarkPlaceHolder = ''
                                this.setState({ selectedItemTextinputAndReview: selectedItemTextinputAndReview })
                            }
                        }}
                        onFocus={() => {
                            let selectedItemTextinputAndReview = { ...this.state.selectedItemTextinputAndReview }
                            let deatils = selectedItemTextinputAndReview[item.uniqueName]
                            deatils.remarkPlaceHolder = 'a'
                            this.setState({ selectedItemTextinputAndReview: selectedItemTextinputAndReview })
                        }
                        }
                        onChangeText={(text) => {
                            console.log(text)
                            let selectedItemTextinputAndReview = { ...this.state.selectedItemTextinputAndReview }
                            let deatils = selectedItemTextinputAndReview[item.uniqueName]
                            deatils.remark = text
                            this.setState({ selectedItemTextinputAndReview: selectedItemTextinputAndReview })
                        }
                        }
                        style={{ fontSize: 15, marginHorizontal: 12, textAlignVertical: "center", padding: 0, width: "90%" }}>
                        <Text style={{ color: this.state.selectedItemTextinputAndReview[item.uniqueName].remarkPlaceHolder == '' ? 'rgba(80,80,80,0.5)' : '#1c1c1c' }}>{this.state.selectedItemTextinputAndReview[item.uniqueName].remarkPlaceHolder == '' ? 'Remark' : this.state.selectedItemTextinputAndReview[item.uniqueName].remark}</Text>
                        <Text style={{ color: '#E04646' }}>{this.state.selectedItemTextinputAndReview[item.uniqueName].remarkPlaceHolder == '' ? '*' : ''}</Text>
                    </TextInput>
                </View>
                <View style={{ marginVertical: 5, width: "100%", height: 1, backgroundColor: colors.LABEL_COLOR, opacity: 0.4 }} />
            </View>
        )
    }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: 'white' }}>
                {this.FocusAwareStatusBar(this.props.isFocused)}
                <View
                    style={{
                        height: Dimensions.get('window').height * 0.08,
                        backgroundColor: '#864DD3',
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 20,
                    }}>
                    <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                        <Icon name={'Backward-arrow'} color="#fff" size={18} />
                    </TouchableOpacity>

                    <Text style={{ fontFamily: 'OpenSans-Bold', fontSize: 16, marginLeft: 20, color: '#FFFFFF' }}>
                        Bulk Payment
                    </Text>
                </View>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    //padding: 15,
                    paddingHorizontal: 20, marginTop: 10
                }}>
                    <Ionicons name="person" size={25} color="#864DD3" style={{ marginTop: 7 }} />
                    <Dropdown
                        ref={(ref) => this.state.payorDropDown = ref}
                        style={{ flex: 1, paddingLeft: 10 }}
                        textStyle={{ color: 'black', fontSize: 15 }}
                        defaultValue={"Select Payor*"}
                        defaultTextStyle={{ color: '#808080', }}
                        options={["Sulbha", "Sulbha", "Sulbha", "Mishra"]}
                        renderSeparator={() => {
                            return (<View></View>);
                        }}
                        onDropdownWillShow={() => this.setState({ isPayorDD: true })}
                        onDropdownWillHide={() => this.setState({ isPayorDD: false })}
                        dropdownStyle={{ width: '80%', height: 150, marginTop: 5, borderRadius: 10 }}
                        dropdownTextStyle={{ color: '#1C1C1C' }}
                        renderRow={(options) => {
                            return (<Text style={{ padding: 10, color: '#1C1C1C' }}>{options}</Text>);
                        }}
                        onSelect={(index, value) => { this.setState({ selectedPayor: value }) }} />
                    <Icon
                        style={{ transform: [{ rotate: this.state.isPayorDD ? '180deg' : '0deg' }], padding: 5, marginLeft: 20 }}
                        name={'9'}
                        size={12}
                        color="#808080"
                        onPress={() => {
                            this.setState({ isPayorDD: true });
                            this.state.payorDropDown.show();
                        }}
                    />
                </View>
                {this.state.selectedPayor ? <Text style={{ paddingHorizontal: 20, marginLeft: 35, color: '#808080', fontSize: 12, marginBottom: 10 }}>
                    {`Bank Bal 102233434.0 dr`}</Text> : <View style={{ marginBottom: 10 }}></View>}
                <FlatList
                    data={this.state.selectedItem}
                    renderItem={({ item }) => this.renderItem(item)}
                    keyExtractor={(item, index) => index.toString()}
                />
                <View style={{ justifyContent: "flex-end", alignItems: "center", position: "absolute", width: 100 + "%", height: 98 + "%" }}>
                    <TouchableOpacity onPress={() => { this.submit() }} style={{ justifyContent: "center", alignItems: "center", backgroundColor: '#5773FF', height: 50, borderRadius: 25, marginBottom: 10, width: "90%", }}>
                        <Text style={{ fontSize: 20, color: "white" }}>Pay</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}

const mapStateToProps = (state: any) => {
    return {
        isLoginInProcess: state.LoginReducer.isAuthenticatingUser,
    };
};

const mapDispatchToProps = () => {
    return {
    };
};

function Screen(props: any) {
    const isFocused = useIsFocused();

    return <BulkPayment {...props} isFocused={isFocused} />;
}
export default connect(mapStateToProps, mapDispatchToProps)(Screen);
