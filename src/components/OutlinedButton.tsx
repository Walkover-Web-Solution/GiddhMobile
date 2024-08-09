import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import Feather from 'react-native-vector-icons/Feather';
import useCustomTheme, { ThemeProps } from '../utils/theme'
import { TextInput } from 'react-native-paper';

type ButtonProps = {
    lable: string,
    value: string,
    disabled?: boolean,
    isRequired?: boolean,
    onPress: () => void
  }
const MatButton : React.FC<ButtonProps> = ({ lable, value, disabled,isRequired=false, onPress }) => {
    const { theme, styles } = useCustomTheme(getButtonStyles);
  
    return (
      <TouchableOpacity
        disabled={disabled}
        activeOpacity={0.7}
        onPress={onPress}
      >
        <TextInput
          value={value?.length > 30 ? value.slice(0, 30) + '...' : value}
        //   theme={{
        //     colors: {
        //       primary: theme.colors.primary,
        //       background: theme.colors.background,
        //       onSurface: theme.colors.background,
        //       text: theme.colors.text,
        //       placeholder: theme.colors.text
        //     },
        //     fonts: {
        //       regular: {
        //         fontFamily: theme.typography.fontFamily.regular,
                
        //       }
        //     }
        //   }}
          
          editable={false}
          mode={'outlined'}
          selection={{ start: 0, end: 0 }}
          label={<Text style={styles.labelText}>{lable}{isRequired && <Text style={{color: theme.colors.solids.red.dark}}>*</Text>}</Text>}
        //   outlineStyle={styles.outlineStyle}
          activeOutlineColor={theme.colors.darkPalette}
          outlineColor={theme.colors.solids.grey.light}          
          style={styles.input}
          contentStyle={styles.inputContentStyle}
          right={
            <TextInput.Icon
              icon={() => <Feather name={'chevron-down'} size={18} color={theme.colors.primary}/>}
              disabled={true}
            />
          }
        />
      </TouchableOpacity>
    )
  }
  const getButtonStyles = (theme: ThemeProps) => StyleSheet.create({
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
      lineHeight: theme.typography.fontSize.regular.lineHeight,
      color: theme.colors.text,
    },
    input: {
      height: 40,
      marginVertical: 5,
      backgroundColor: theme.colors.background,
      fontSize: theme.typography.fontSize.regular.size,
      lineHeight : theme.typography.fontSize.regular.lineHeight
    },
    inputContentStyle: {
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.regular.size,
      lineHeight: theme.typography.fontSize.regular.lineHeight,
      color: theme.colors.primary
    },
    outlineStyle: {
      borderRadius: 8,
      backgroundColor: theme.colors.background
    },
    labelText: {
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.regular.size,
      lineHeight: theme.typography.fontSize.regular.lineHeight,
    },
  });
export default MatButton