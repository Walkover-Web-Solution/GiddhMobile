import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import useCustomTheme, { ThemeProps } from '@/utils/theme'

const DateChipSeparator : React.FC<{ date: string | null, showDivider: boolean}> = ({ date, showDivider }) => {
    const { styles } = useCustomTheme(getStyles);

    return date 
        ? 
            <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.date}>
                    {date}
                </Text>
                <View style={styles.dividerLine} />
            </View>
        :   showDivider && <View style={styles?.divider} />
}

export default DateChipSeparator

const getStyles = (theme: ThemeProps) => StyleSheet.create({
    dividerContainer: { 
        flexDirection: "row", 
        alignItems: "center" 
    },
    dividerLine: { 
        borderBottomWidth: 1, 
        borderBottomColor: theme.colors.solids.grey.light, 
        width: "32.5%" 
    },
    date: {
        fontFamily: theme.typography.fontFamily.regular, 
        textAlign: "center", 
        borderRadius: 15, 
        borderWidth: 1, 
        paddingHorizontal: 5, 
        paddingBottom: 2, 
        paddingTop: 5, 
        borderColor: theme.colors.solids.grey.light, 
        width: "35%" 
    },
    divider: {
        borderTopWidth: 1,
        borderTopColor: theme.colors.solids.grey.light,
    }
})