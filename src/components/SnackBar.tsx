import { Text, View, TouchableOpacity, StyleSheet, Dimensions, Platform, DeviceEventEmitter, EmitterSubscription } from 'react-native'
import React, { useEffect, useState } from 'react'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, withSequence } from 'react-native-reanimated';
import useCustomTheme, { ThemeProps } from '@/utils/theme';

const { height, width } = Dimensions.get('screen')
interface Props {
    eventType: string, 
    backgroundColor: string,
    borderLeftColor: string
}
const SnackBar : React.FC<Props> = ({ eventType, backgroundColor, borderLeftColor }) => {
    const { theme, styles } = useCustomTheme(getStyles);
    const [toastMessage, setToastMessage] = useState<{ message: string, action?: string, open?: () => void } | null>(null);
    const Ydistance = Platform.OS == 'ios' ? height * 0.15 : height * 0.12;
    const translateY = useSharedValue(0);

    useEffect(() => {
        const listeners = setListeners.bind(this)();
        return () => {
            listeners.map(listener => {
                listener.remove();
            });
        }
    }, []);
    const setListeners = () => {
        const listenersArray : Array<EmitterSubscription> = [];

        listenersArray.push(
            DeviceEventEmitter.addListener(eventType, (data) => {
                setToastMessage(data);
                translateY.value = withSequence(
                    withTiming(Ydistance, { duration: 0 }),
                    withTiming(Ydistance, { duration: data?.action ? 10000 : 3000 }),
                    withTiming(0, { duration: 500 })
                )
            }),
        );
        return listenersArray;
    };

    const animatedStyles = useAnimatedStyle(() => {
        return {
            transform: [{
                translateY: withSpring(translateY.value, {
                    damping: 15,
                }),
            }],
        };
    });

    if (toastMessage) {
        return (
            <Animated.View style={[styles.baseView, animatedStyles]}>
                <View style={[styles.overlay, {backgroundColor, borderLeftColor}]}>
                    <Text style={styles.toastText} >{toastMessage?.message}</Text>
                    <View style={styles.row}>
                        { !!toastMessage?.action &&
                            <TouchableOpacity
                                hitSlop={{ top: 10, bottom: 10, right: 20, left: 20 }}
                                style={styles.closeButton} 
                                onPress={() => {
                                    toastMessage?.open?.();
                                    setToastMessage(null);
                                }}
                            >
                                <Text style={styles.actionText}>{toastMessage?.action}</Text>
                            </TouchableOpacity>
                        }       
                        <TouchableOpacity
                            hitSlop={{ top: 10, bottom: 10, right: 20, left: 20 }}
                            style={styles.closeButton} 
                            onPress={() => setToastMessage(null)}
                        >
                            <MaterialCommunityIcons name="close-circle-outline" size={25} color={theme.colors.solids.grey.light} />
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>
        )
    } else {
        return null;
    }
}
const getStyles = (theme: ThemeProps) => StyleSheet.create({
    baseView: {
        position: 'absolute',
        zIndex: 1,
        top: -(height * 0.1),
        alignSelf: "center",
        backgroundColor: theme.colors.solids.white,
        borderRadius: 8,
    },
    overlay: {
        // paddingVertical: 14,
        paddingHorizontal: 10,
        alignItems: 'center',
        minHeight: 50,
        width: width * 0.95,
        justifyContent: 'space-between',
        flexDirection: 'row',
        borderRadius: 8,
    },
    toastText: {
        fontFamily: theme.typography.fontFamily.semiBold,
        fontSize: theme.typography.fontSize.large.size,
        color: theme.colors.solids.white,
        lineHeight: theme.typography.fontSize.regular.lineHeight,
    },
    actionText: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize.large.size,
        color: theme.colors.solids.white,
        lineHeight: theme.typography.fontSize.regular.lineHeight,
    },
    closeButton: {
        alignItems: 'center',
        paddingLeft: 10
    },
    row: { 
        flexDirection: 'row', 
        alignItems: 'center' 
    }
})

export default SnackBar