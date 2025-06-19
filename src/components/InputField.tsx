import React, { memo, useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import { TextInput } from "react-native-paper";
import useCustomTheme, { ThemeProps } from "../utils/theme";

type InputProps = {
  lable: string,
  placeholder: string,
  value: string,
  isRequired?: boolean,
  keyboardType?: 'numeric', 
  editable?: boolean,
  containerStyle?: any,
  errorStyle?: any,
  onblur?: () => void,
  customErrorMessage?: string,
  validate?: (text: string) => boolean,
  onChangeText: (text: string) => void,
  onfocus?: () => void
  leftIcon?: React.ReactNode
}

const InputField : React.FC<InputProps> = ({ 
  lable,
  placeholder,
  value,keyboardType,
  onblur,
  onfocus,
  isRequired=true,
  editable = true,
  validate,
  onChangeText,
  customErrorMessage,
  containerStyle,
  errorStyle,
  leftIcon
}) => {
  const { theme, styles } = useCustomTheme(getInputStyles, 'Stock');
  const [errorMessage, setErrorMessage] = useState<string>('');

  return (
    <View>
      <TextInput
        value={value}
        left={leftIcon 
          ? <TextInput.Icon
              icon={() => leftIcon}
              onPress={()=> {}}
            />
          : undefined
        }
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
        onFocus={()=> onfocus ? onfocus() : {}}
        mode={'outlined'}
        editable={editable}
        label={<Text style={styles.labelText}>{lable}{isRequired && <Text style={{color: theme.colors.solids.red.dark }}>  *</Text>}</Text>}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.secondaryText}
        outlineStyle={styles.outlineStyle}
        activeOutlineColor={theme.colors.vouchers.stock.background}
        outlineColor={theme.colors.solids.grey.light}          
        style={[styles.input, containerStyle ? containerStyle : undefined]}
        contentStyle={[styles.inputTextStyle, {color: !editable ? theme.colors.secondaryText : theme.colors.text}]}
        onBlur={() => onblur ? onblur() : {}}
        keyboardType={keyboardType}
        onChangeText={(text) => {
          if(typeof validate === "function"){
            if(!validate(text)){
              if(customErrorMessage != ''){
                setErrorMessage(customErrorMessage + '');
              }else{
                setErrorMessage('Enter Valid ' + lable);
              }
            } else{
              setErrorMessage('');
            }
          }
          onChangeText(text);
        }}
      />
      { errorMessage.length > 0 && 
        <Text style={[styles.inputValidationError, errorStyle ? errorStyle : undefined]}>
          {errorMessage}
        </Text>
      }
    </View>
  )
}

const getInputStyles = (theme: ThemeProps) => StyleSheet.create({
  labelText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.regular.size,
  },
  input: {
    height: 40,
    backgroundColor: theme.colors.background,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.regular.size,
    lineHeight : theme.typography.fontSize.regular.lineHeight,
  },
  inputContentStyle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.regular.size,
    lineHeight: theme.typography.fontSize.regular.lineHeight,
    color: theme.colors.text,
  },
  outlineStyle: {
    borderWidth: 1.4
  },
  inputValidationError: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xSmall.size,
    lineHeight: theme.typography.fontSize.xSmall.lineHeight,
    color: theme.colors.solids.red.dark,
    position: 'absolute',
    bottom: 8,
    left: 15
  },
  inputTextStyle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.regular.size
  }
});

/**
 * Customised Material Text Input field
 */
export default memo(InputField);