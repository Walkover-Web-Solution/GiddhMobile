import { CommonService } from "@/core/services/common/common.service";
import useCustomTheme, { ThemeProps } from "@/utils/theme";
import moment from "moment";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import getSymbolFromCurrency from 'currency-symbol-map';
import lodash from 'lodash.debounce';
import { formatAmount } from "@/utils/helper";
import { useSelector } from "react-redux";

const BankAccountList = () => {
    const {styles, theme} = useCustomTheme(makeStyles, 'Stock');
    const [date, setDate] = useState<{ startDate: string, endDate: string }>({ startDate: moment().subtract(30, 'd').format('DD-MM-YYYY'), endDate: moment().format('DD-MM-YYYY') });
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [bankAccounts, setBankAccounts] = useState<any[]>([]);
    const countryV2 = useSelector((state) => state?.commonReducer?.companyDetails?.countryV2);
    
    const fetchBankAccounts = async (page:number)=> {
        try {
            const response = await CommonService.fetchBankAccounts(date.startDate, date.endDate, page);
            if(response?.status == "success"){
                setBankAccounts(prevAccoutns => [...prevAccoutns, ...response?.body?.results]);
                if(page*50 < response?.body?.totalItems){
                    setHasMore(true);
                }else{
                    setHasMore(false);
                }
            }
        } catch (error) {
            console.log("Error while fetching bank accounts",error);
            
        }
    }

    useEffect(() => {
        setTimeout(()=>fetchBankAccounts(page),1500);
    }, []);

    const loadMoreBankAccounts = () => {
        if(hasMore){
            setPage(prevPage => prevPage + 1);
            fetchBankAccounts(page + 1);
        }
    }

    const lodashWait = lodash(() => {
        loadMoreBankAccounts();
    }, 300);

    const renderItem = ({item})=>{
        return (
            <View key={item?.uniqueName} style={styles.card}>
                <Text style={[styles.text,{color:'#1a237e'}]}>{item?.name}</Text>
                <Text style={styles.price}>{countryV2?.currency?.symbol ? countryV2?.currency?.symbol : ''} {formatAmount(item?.openingBalance?.amount)}{item?.openingBalance?.type?.charAt(0) == 'C' ? ' Cr.' : ' Dr.'} </Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Bank Accounts</Text>
            {bankAccounts.length > 0 ? <FlatList
                contentContainerStyle={styles.contentContainerStyle}
                data={bankAccounts}
                keyExtractor={(item, index) => index.toString()}
                onEndReachedThreshold={0.5}
                onEndReached={lodashWait}
                scrollEnabled={false}
                renderItem={renderItem}
            /> : <View style={{alignItems:'center',marginVertical:30}}><Text style={styles.text}>Yet to add Bank Details</Text></View>}
        </View>
    )
}

export default BankAccountList;

const makeStyles= (theme:ThemeProps) => StyleSheet.create({
    container: {
        flex:1,
        marginVertical:25,
        marginHorizontal:16
    },
    contentContainerStyle: {
        flexGrow: 1,
        paddingTop: 5,
        paddingBottom:'35%'
    },
    heading: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize.large.size,
        lineHeight: theme.typography.fontSize.large.lineHeight
    },
    text :{
        fontSize: theme.typography.fontSize.regular.size,
        lineHeight: theme.typography.fontSize.regular.lineHeight,
        color: theme.colors.solids.black,
        fontFamily:theme.typography.fontFamily.semiBold,
    },
    price :{
        fontSize: theme.typography.fontSize.regular.size,
        lineHeight: theme.typography.fontSize.regular.lineHeight,
        color: theme.colors.solids.black,
        fontFamily:theme.typography.fontFamily.semiBold,
    },
    card :{
        flexDirection:'row',
        alignItems:'baseline',
        justifyContent:'space-between',
        borderBottomWidth:0.2,
        borderColor:theme.colors.secondary,
        paddingTop:15,
        paddingBottom:3
    }
})