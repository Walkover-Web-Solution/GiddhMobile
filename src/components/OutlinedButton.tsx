import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import Feather from 'react-native-vector-icons/Feather';
import useCustomTheme, { ThemeProps, getLineHeight, getLabelLineHeight } from '../utils/theme'
import { TextInput } from 'react-native-paper';

type ButtonProps = {
    lable: string,
    value: string,
    disabled?: boolean,
    isRequired?: boolean,
    onPress: () => void
    containerStyle?: any
    outlineStyle?: any
  }
const MatButton : React.FC<ButtonProps> = ({ lable, value, disabled,isRequired=false, containerStyle, outlineStyle, onPress }) => {
    const { theme, styles } = useCustomTheme(getButtonStyles);
    const hasValue = value && value.length > 0;
  
    return (
      <TouchableOpacity
        disabled={disabled}
        activeOpacity={0.7}
        onPress={onPress}
      >
        <View style={styles.wrapper}>
          {hasValue && (
            <View style={styles.externalLabelContainer} pointerEvents="none">
              <Text style={styles.externalLabelText}>
                {lable}{isRequired && <Text style={{color: theme.colors.solids.red.dark}}>  *</Text>}
              </Text>
            </View>
          )}
          <TextInput
            value={value?.length > 30 ? value.slice(0, 30) + '...' : value}
            theme={{
              // colors: {
              //   primary: theme.colors.primary,
              //   background: theme.colors.background,
              //   onSurface: theme.colors.background,
              //   text: theme.colors.text,
              //   placeholder: theme.colors.text
              // },
              // fonts: {
              //   regular: {
              //     fontFamily: theme.typography.fontFamily.regular,
                
              //   }
              // },
              roundness: 6
            }}
            hitSlop={{top:-20, bottom:-20}}
            editable={false}
            mode={'outlined'}
            selection={{ start: 0, end: 0 }}
            // label={!hasValue ? <Text style={styles.labelText}>{lable}{isRequired && <Text style={{color: theme.colors.solids.red.dark}}>*</Text>}</Text> : undefined}
            placeholder={!hasValue ? lable : undefined}
            outlineStyle={[styles.outlineStyle, outlineStyle ? outlineStyle : undefined]}
            activeOutlineColor={theme.colors.darkPalette}
            outlineColor={theme.colors.solids.grey.light}          
            style={[styles.input, containerStyle ? containerStyle : undefined]}
            contentStyle={styles.inputContentStyle}
            right={
              <TextInput.Icon
                style={{ paddingTop: 6 }}
                icon={() => <Feather name={'chevron-down'} size={18} color={theme.colors.secondary}/>}
                disabled={true}
              />
            }
          />
        </View>
      </TouchableOpacity>
    )
  }
  const getButtonStyles = (theme: ThemeProps) => StyleSheet.create({
    wrapper: {
      position: 'relative',
    },
    externalLabelContainer: {
      position: 'absolute',
      top: 0,
      left: 12,
      zIndex: 1,
      backgroundColor: theme.colors.background,
      paddingHorizontal: 4,
      paddingVertical: 0,
      height: 16,
      justifyContent: 'center',
    },
    externalLabelText: {
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: 12,
      lineHeight: 16,
      color: theme.colors.shadow,
      includeFontPadding: false,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 50,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.solids.grey.light,
      marginVertical: 8,
      paddingHorizontal: 15
    },
    lable: {
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.regular.size,
      lineHeight: getLineHeight(theme.typography.fontSize.regular),
      color: theme.colors.text,
    },
    input: {
      height: 50,
      marginVertical: 5,
      backgroundColor: theme.colors.background,
      fontSize: theme.typography.fontSize.regular.size,
      lineHeight: getLineHeight(theme.typography.fontSize.regular)
    },
    inputContentStyle: {
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.regular.size,
      lineHeight: getLineHeight(theme.typography.fontSize.regular),
      color: theme.colors.text,
      paddingVertical: 0,
    },
    outlineStyle: {
      // borderRadius: 8,
      // backgroundColor: theme.colors.background
    },
    labelText: {
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.regular.size,
      lineHeight: getLabelLineHeight(theme.typography.fontSize.regular),
      includeFontPadding: false,
    },
  });
export default MatButton