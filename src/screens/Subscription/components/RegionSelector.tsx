import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useRef } from 'react'
import useCustomTheme, { ThemeProps } from '@/utils/theme';
import BottomSheet from '@/components/BottomSheet';
import { Flag } from 'react-native-country-picker-modal'
import GlobeIcon from '@/assets/images/icons/globe.svg'
import Entypo from 'react-native-vector-icons/Entypo'

type Props = { 
    countries: Array<any>
    selectedCountry: any
    setSelectedCountry: (country: any) => void
}

const RegionSelector: React.FC<Props> = ({ countries, selectedCountry, setSelectedCountry }) => {
    const { styles, voucherBackground } = useCustomTheme(getStyles, 'Payment');
    const bottomSheetRef = useRef<any>(null);

    return (
        <>
            <TouchableOpacity
                hitSlop={{ top: 10, left: 10, right: 10, bottom: 10}}
                activeOpacity={0.7}
                style={styles.regionButton}
                onPress={() => bottomSheetRef?.current?.open()}
            >
                { selectedCountry?.alpha3CountryCode === 'GLB' 
                    ?   <View style={styles.globalIcon}><GlobeIcon height={28} width={28}/></View>
                    :   <Flag
                            countryCode={selectedCountry?.alpha2CountryCode}
                            flagSize={28}
                        />
                }
            </TouchableOpacity>
            <BottomSheet
                bottomSheetRef={bottomSheetRef}
                headerText='Region'
                headerTextColor={voucherBackground}
                flatListProps={{
                    data: countries,
                    renderItem: ({ item }) => {
                        const isSelected = item?.alpha3CountryCode === selectedCountry?.alpha3CountryCode;
                        return (
                            <TouchableOpacity
                                key={item?.alpha3CountryCode}
                                activeOpacity={0.7}
                                style={styles.button}
                                onPress={() => {
                                    bottomSheetRef?.current?.close();
                                    setSelectedCountry(item)
                                }}
                            >
                                <View style={styles.countryNameContainer}>
                                    { item.alpha3CountryCode === 'GLB' 
                                        ?   <View style={{paddingLeft: 6, paddingRight: 16}}><GlobeIcon/></View>
                                        :   <Flag
                                                countryCode={item.alpha2CountryCode}
                                                flagSize={14}
                                            />
                                    }
                                    <Text style={styles.regularText}>{item?.alpha3CountryCode} - {item?.countryName}</Text>
                                </View>
                                {isSelected && <Entypo name="check" size={17} color={voucherBackground} />}
                            </TouchableOpacity>
                        )
                    }
                }}
            />
        </>
    )
}

export default RegionSelector

const getStyles = (theme: ThemeProps) => StyleSheet.create({
    regularText: {
        fontFamily: theme.typography.fontFamily.semiBold,
        fontSize: theme.typography.fontSize.regular.size,
        color: theme.colors.text
    },
    regionButton: {
        marginRight: -16,        
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 14,
    },
    globalIcon: {
        paddingLeft: 6,
        paddingRight: 16 
    },
    countryNameContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    }
})