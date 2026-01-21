import { Keyboard, StyleSheet, Text, View } from 'react-native'
import React, { MutableRefObject } from 'react'
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';
import moment from 'moment';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import colors from '@/utils/colors';
import AntDesign from 'react-native-vector-icons/AntDesign';
import useCustomTheme, { ThemeProps } from '@/utils/theme';
import MatButton from '@/components/OutlinedButton';
import { useTranslation } from 'react-i18next';

type Props = {
    startDate: string
    endDate: string
    dateMode: string
    activeDateFilter: string
    disabled: boolean
    changeDate: (startDate: string, endDate: string) => void
    setActiveDateFilter: (activeDateFilter: string, dateMode: string) => void,
    optionModalRef: MutableRefObject<null>,
    consolidatedBranch: string,
    selectedBranch: any
}

const DateFilter: React.FC<Props> = ({ startDate, endDate, changeDate, dateMode, activeDateFilter, disabled, setActiveDateFilter, optionModalRef, consolidatedBranch, selectedBranch }) => {
    const navigation = useNavigation();
    const {styles, theme} = useCustomTheme(makeStyles, 'Stock');
    const { t } = useTranslation();
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


    const setBottomSheetVisible = (modalRef: React.Ref<BottomSheet>, visible: boolean) => {
        if (visible) {
          Keyboard.dismiss();
          modalRef?.current?.open();
        } else {
          modalRef?.current?.close();
        }
    };

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
            {consolidatedBranch?.length == 1 && (
                <View style={styles.matBtn}>
                <MatButton
                    lable={t('balanceSheet.selectBranch')}
                    value={selectedBranch ? selectedBranch?.alias : ''}
                    onPress={() => {
                    setBottomSheetVisible(optionModalRef, true);
                    }}
                />
                </View>
            )}
        </View>
    )
}

export default DateFilter;

const makeStyles = (theme:ThemeProps) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: theme.colors.solids.white
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
    },
    heading: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize.large.size,
        lineHeight: theme.typography.fontSize.large.lineHeight
    },
    matBtn:{
        width: '40%',  
        marginTop: -7
    }
})