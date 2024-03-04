import React from 'react'
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Icon from '@/core/components/custom-icon/custom-icon'
import Entypo from 'react-native-vector-icons/Entypo'
import { useNavigation } from '@react-navigation/native'
import { FONT_FAMILY } from '@/utils/constants'

type HeaderWithoutChildren = {
    header: string
    subHeader?: string
    backgroundColor: string
    isBackButtonVisible?: boolean
    headerRightContent?: React.JSX.Element
    children?: never
} 

type HeaderWithChildren =  {
    header?: never
    subHeader?: never
    backgroundColor: string
    isBackButtonVisible?: never
    headerRightContent?: never
    children: React.ReactNode
}

type Props = HeaderWithoutChildren | HeaderWithChildren
    
const Header : React.FC<Props> = ({ header, subHeader, backgroundColor = '#FFFFFF', isBackButtonVisible = false, headerRightContent, children }) => {
    const navigation = useNavigation();

    return (
        <View style={[styles.mainContainer, { backgroundColor }]}>
            {   children ??
                <>
                    <View>
                        <View style={styles.screenNameContainer}>
                            {isBackButtonVisible &&
                                <TouchableOpacity
                                    hitSlop={{ right: 20, left: 20, top: 10, bottom: 10 }}
                                    style={styles.backButton}
                                    onPress={() => navigation.goBack()}
                                >
                                    <Icon name={'Backward-arrow'} color="#fff" size={18} />
                                </TouchableOpacity>
                            }
                            <Text
                                numberOfLines={2}
                                style={styles.text}
                            >
                                {header}
                            </Text>
                        </View>
                        { !!subHeader &&
                            <Text
                                numberOfLines={1}
                                style={styles.smallText}
                            >
                                {subHeader}
                            </Text>
                        }
                    </View>

                    { !isBackButtonVisible &&
                        <View style={styles.rightContainer}>
                            {  headerRightContent && headerRightContent }
                            <TouchableOpacity
                                style={styles.rightButton}
                                onPress={async () => {
                                    navigation.navigate('Settings')
                                }}
                            >
                                <Entypo name="dots-three-vertical" size={20} color={'#FFFFFF'} />
                            </TouchableOpacity>
                        </View>
                    }
                </>
            }

        </View>
    )
}

const styles = StyleSheet.create({
    mainContainer: {
        height: Dimensions.get('window').height * 0.08,
        backgroundColor: '#5773FF',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        justifyContent: "space-between"
    },
    screenNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        paddingRight: 10
    },
    text: {
        fontFamily: FONT_FAMILY.bold,
        fontSize: 16,
        color: '#FFFFFF'
    },
    smallText: {
        fontFamily: FONT_FAMILY.semibold,
        fontSize: 14,
        color: '#FFFFFF'
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: -16
    },
    rightButton: {
        padding: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center'
    }
})

export default Header