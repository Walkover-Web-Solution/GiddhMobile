import React from 'react';
import { StyleSheet, View, Text, Dimensions, Image } from 'react-native';
import useCustomTheme, { ThemeProps } from '@/utils/theme';

const SIZE = Dimensions.get('window').width * 0.7;

type Props = {
    primaryMessage: string
    secondaryMessage?: string
}

const NoData: React.FC<Props> = ({ primaryMessage, secondaryMessage = '' }) => {
    const { styles } = useCustomTheme(getStyles);

    return (
        <View style={styles.container}>
            <Image
                source={require('@/assets/images/noTransactions.png')}
                style={{ resizeMode: 'contain', height: 300, width: 300 }}
            />
            <Text style={styles.primaryMessageTextStyle}>{primaryMessage}</Text>
            <Text style={styles.secondaryMessageTextStyle}>{secondaryMessage}</Text>
        </View>
    )
}

const getStyles = (theme: ThemeProps) => StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    primaryMessageTextStyle: {
        fontFamily: theme.typography.fontFamily.extraBold,
        fontSize: theme.typography.fontSize.xxLarge.size,
        marginVertical: 10,
    },
    secondaryMessageTextStyle: {
        color: theme.colors.secondaryText,
        fontFamily: theme.typography.fontFamily.semiBold,
        fontSize: theme.typography.fontSize.large.size,
        textAlign: 'center',
    }
});

export default NoData;