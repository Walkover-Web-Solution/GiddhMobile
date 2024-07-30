import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';
import moment from 'moment';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Entypo from 'react-native-vector-icons/Entypo'
import colors from '@/utils/colors';

type Props = {
    startDate: string
    endDate: string
    dateMode: string
    activeDateFilter: string
    disabled: boolean
    changeDate: (startDate: string, endDate: string) => void
    setActiveDateFilter: (activeDateFilter: string, dateMode: string) => void
}

const DateFilter: React.FC<Props> = ({ startDate, endDate, changeDate, dateMode, activeDateFilter, disabled, setActiveDateFilter }) => {
    const navigation = useNavigation();

    const dateShift = (shiftTo: 'right' | 'left') => {
        let shiftedStartDate: string = startDate;
        let shiftedEndDate: string = endDate;

        if (dateMode == 'default' && shiftTo === 'left') {

            shiftedStartDate = moment(startDate, 'DD-MM-YYYY').subtract(1, 'month').startOf('month').format('DD-MM-YYYY')
            shiftedEndDate = moment(endDate, 'DD-MM-YYYY').subtract(1, 'month').endOf('month').format('DD-MM-YYYY')

        } else if (dateMode == 'default' && shiftTo === 'right') {

            shiftedStartDate = moment(startDate, 'DD-MM-YYYY').add(1, 'month').startOf('month').format('DD-MM-YYYY')
            shiftedEndDate = moment(endDate, 'DD-MM-YYYY').add(1, 'month').endOf('month').format('DD-MM-YYYY')

        } else if (dateMode == 'defaultDates' && shiftTo === 'left') {

            shiftedStartDate = moment(startDate, 'DD-MM-YYYY').subtract(30, 'days').format('DD-MM-YYYY')
            shiftedEndDate = moment(endDate, 'DD-MM-YYYY').subtract(30, 'days').format('DD-MM-YYYY')

        } else if (dateMode == 'defaultDates' && shiftTo == 'right') {

            shiftedStartDate = moment(startDate, 'DD-MM-YYYY').add(30, 'days').format('DD-MM-YYYY')
            shiftedEndDate = moment(endDate, 'DD-MM-YYYY').add(30, 'days').format('DD-MM-YYYY')

        } else if (dateMode == 'TQ' && shiftTo === 'left') {

            shiftedStartDate = moment(startDate, 'DD-MM-YYYY').subtract(1, 'quarter').startOf('quarter').format('DD-MM-YYYY')
            shiftedEndDate = moment(endDate, 'DD-MM-YYYY').subtract(1, 'quarter').endOf('quarter').format('DD-MM-YYYY')

        } else if (dateMode == 'TQ' && shiftTo === 'right') {

            shiftedStartDate = moment(startDate, 'DD-MM-YYYY').add(1, 'quarter').startOf('quarter').format('DD-MM-YYYY')
            shiftedEndDate = moment(endDate, 'DD-MM-YYYY').add(1, 'quarter').endOf('quarter').format('DD-MM-YYYY')

        } else if (dateMode == 'custom' && shiftTo === 'left') {

            shiftedStartDate = moment(startDate, 'DD-MM-YYYY').subtract(moment(endDate, 'DD-MM-YYYY').diff(moment(startDate, 'DD-MM-YYYY'), 'days'), 'days',).format('DD-MM-YYYY')
            shiftedEndDate = moment(endDate, 'DD-MM-YYYY').subtract(moment(endDate, 'DD-MM-YYYY').diff(moment(startDate, 'DD-MM-YYYY'), 'days'), 'days',).format('DD-MM-YYYY')

        } else if (dateMode == 'custom' && shiftTo === 'right') {

            shiftedStartDate = moment(startDate, 'DD-MM-YYYY').add(moment(endDate, 'DD-MM-YYYY').diff(moment(startDate, 'DD-MM-YYYY'), 'days'), 'days',).format('DD-MM-YYYY')
            shiftedEndDate = moment(endDate, 'DD-MM-YYYY').add(moment(endDate, 'DD-MM-YYYY').diff(moment(startDate, 'DD-MM-YYYY'), 'days'), 'days',).format('DD-MM-YYYY')

        }

        changeDate(shiftedStartDate, shiftedEndDate);
        setActiveDateFilter('', dateMode);
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity
                activeOpacity={0.7}
                disabled={disabled}
                style={styles.dateContainer}
                onPress={() =>
                    navigation.navigate('AppDatePicker', {
                        selectDate: changeDate,
                        startDate: startDate,
                        endDate: endDate,
                        activeDateFilter: activeDateFilter,
                        setActiveDateFilter: setActiveDateFilter,
                    })
                }>
                <MaterialCommunityIcons name="calendar-month" size={22} color={'#808080'} />
                <Text style={{ fontFamily: 'AvenirLTStd-Book', marginLeft: 5 }}>
                    {moment(startDate, 'DD-MM-YYYY').format('DD MMM YY') +
                        ' - ' +
                        moment(endDate, 'DD-MM-YYYY').format('DD MMM YY')}
                </Text>
            </TouchableOpacity>
            <View style={styles.dateShiftButtonWrapper}>
                <TouchableOpacity
                    activeOpacity={0.7}
                    disabled={disabled}
                    style={styles.dateShiftButton}
                    onPress={() => dateShift('left')}
                >
                    <Entypo name="chevron-left" size={22} color={'#808080'} />
                </TouchableOpacity>
                <TouchableOpacity
                    activeOpacity={0.7}
                    disabled={disabled}
                    style={styles.dateShiftButton}
                    onPress={() => dateShift('right')}
                >
                    <Entypo name="chevron-right" size={22} color={'#808080'} />
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default DateFilter;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: colors.BACKGROUND
    },
    dateContainer: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        justifyContent: 'center',
        borderColor: '#D9D9D9',
        alignItems: 'center',
        flexDirection: 'row',
    },
    dateShiftButtonWrapper: { 
        flexDirection: 'row', 
        width: '20%', 
        justifyContent: 'space-between', 
        marginRight: -8 
    },
    dateShiftButton: {
        padding: 5
    }
})