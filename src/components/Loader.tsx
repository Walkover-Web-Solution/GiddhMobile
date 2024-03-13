import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { Bars } from 'react-native-loader';
import colors from '@/utils/colors';

const Loader = ({ isLoading = false }) => {
    if (!isLoading) return null;
    return (
        <View style={styles.loaderContainer}>
            <Bars size={15} color={colors.PRIMARY_NORMAL} />
        </View>
    );
};

const NoActionLoader = ({ isLoading = false }) => {
    return (
        <Modal visible={isLoading} transparent statusBarTranslucent>
            <View style={styles.loaderContainer}>
                <Bars size={15} color={colors.PRIMARY_NORMAL} />
            </View>
        </Modal>
    );
};

export default Loader;
export { NoActionLoader };

const styles = StyleSheet.create({
    loaderContainer: { 
        right: 0, 
        left: 0, 
        top: 0, 
        bottom: 0, 
        position: 'absolute', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backfaceVisibility: 'hidden'
    }
});
