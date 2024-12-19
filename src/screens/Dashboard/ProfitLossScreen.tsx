import useCustomTheme, { ThemeProps } from "@/utils/theme";
import { useCallback, useRef, useState } from "react";
import { RefreshControl, SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import DateFilter from "./component/DateFilter";
import ChartComponent from "./ChartComponent";
import BankAccountList from "./BankAccountList";
import moment from "moment";

const ProfitLossScreen = () => {
    const {styles} = useCustomTheme(makeStyles, 'Stock');
    const [refreshing, setRefreshing] = useState(false);
    const [chartKey, setChartKey] = useState(0);
    const [bankAccountKey, setBankAccountKey] = useState(10);
    const [date, setDate] = useState<{ startDate: string, endDate: string }>({ startDate: moment().subtract(30, 'd').format('DD-MM-YYYY'), endDate: moment().format('DD-MM-YYYY') });
    const [dateMode, setDateMode] = useState('defaultDates');
    const [activeDateFilter, setActiveDateFilter] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const optionModalizeRef = useRef(null);
    const branchListModalRef = useRef(null);
    const [consolidatedBranch, setConsolidatedBranch] = useState(' ');
    const [selectedBranch, setSelectedBranch] = useState({});

    const onRefresh = useCallback(() => { 
        setRefreshing(true); 
        setChartKey(prevKey => prevKey + 1); 
        setBankAccountKey(prevKey => prevKey + 1); 
        setTimeout(() => { 
            setRefreshing(false); }
        , 2000); 
    }, []);

    const changeDate = (startDate: string, endDate: string) => {
      setDate({ startDate, endDate });
    }

    const _setActiveDateFilter = (activeDateFilter: string, dateMode: string) => {
      setActiveDateFilter(activeDateFilter);
      setDateMode(dateMode);
    };

    return (
        <SafeAreaView style={styles.container}>
          <DateFilter 
            startDate={date.startDate}
            endDate={date.endDate}
            dateMode={dateMode}
            activeDateFilter={activeDateFilter}
            disabled={isLoading}
            changeDate={changeDate}
            setActiveDateFilter={_setActiveDateFilter}
            optionModalRef={branchListModalRef}
            consolidatedBranch={consolidatedBranch}
            selectedBranch={selectedBranch}
          />
          <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={ <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> }
          >
            <View key={chartKey}>
              <ChartComponent
                date={date} 
                modalRef={branchListModalRef} 
                setConsolidatedBranch={setConsolidatedBranch}
                consolidatedBranch={consolidatedBranch}
                setSelectedBranch={setSelectedBranch}
                selectedBranch={selectedBranch}
              />
            </View>
            <View key={bankAccountKey}>
                <BankAccountList />
            </View>
          </ScrollView>
        </SafeAreaView>
    )
}

export default ProfitLossScreen;

const makeStyles = (theme:ThemeProps)=> StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:theme.colors.solids.white
    },
})