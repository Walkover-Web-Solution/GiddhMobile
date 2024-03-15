import { StyleSheet, SafeAreaView } from 'react-native'
import React from 'react'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

type Props = {
    children: React.ReactNode
}

const ScrollContainer: React.FC<Props> = ({ children }) => {
    return (
        <KeyboardAwareScrollView style={styles.container}>
            {children}
        </KeyboardAwareScrollView>
    )
}

const Container: React.FC<Props> = ({ children }) => {
    return (
        <SafeAreaView style={styles.container}>
            {children}
        </SafeAreaView>
    )
}

export { Container, ScrollContainer };

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF'
    }
})