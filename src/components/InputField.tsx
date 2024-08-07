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
  onblur?: () => void,
  customErrorMessage?: string,
  validate?: (text: string) => boolean,
  onChangeText: (text: string) => void,
  onfocus?: () => void
}

const InputField : React.FC<InputProps> = ({ lable, placeholder, value, keyboardType,onblur, onfocus,isRequired=true, editable = true, validate, onChangeText,customErrorMessage }) => {
  const { theme, styles } = useCustomTheme(getInputStyles, 'Stock');
  const [errorMessage, setErrorMessage] = useState<string>('');

  return (
    <View>
      <TextInput
        value={value}
        // theme={{
        //   colors: {
        //     primary: theme.colors.primary,
        //     background: theme.colors.background,
        //     onSurface: theme.colors.background,
        //     text: theme.colors.text,
        //     placeholder: theme.colors.text
        //   },
        //   fonts: {
        //     regular: {
        //       fontFamily: theme.typography.fontFamily.regular,
        //     }
        //   }
        // }}
        onFocus={()=> onfocus ? onfocus() : {}}
        mode={'outlined'}
        editable={editable}
        label={<Text style={styles.labelText}>{lable}{isRequired && <Text style={{color: theme.colors.solids.red.dark }}>  *</Text>}</Text>}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.secondaryText}
        // outlineStyle={styles.outlineStyle}
        activeOutlineColor={theme.colors.vouchers.stock.background}
        outlineColor={theme.colors.solids.grey.light}          
        style={styles.input}
        onBlur={() => onblur ? onblur() : {}}
        // contentStyle={styles.inputContentStyle}
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
        <Text style={styles.inputValidationError}>
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
    lineHeight: theme.typography.fontSize.regular.lineHeight,
  },
  input: {
    height: 40,
    marginVertical: 5,
    backgroundColor: theme.colors.background,
    fontSize: theme.typography.fontSize.regular.size,
    lineHeight : theme.typography.fontSize.regular.lineHeight,
    fontFamily: theme.typography.fontFamily.regular,
  },
  inputContentStyle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.regular.size,
    lineHeight: theme.typography.fontSize.regular.lineHeight,
    color: theme.colors.text,
  },
  outlineStyle: {
    borderRadius: 8,
    backgroundColor: theme.colors.background
  },
  inputValidationError: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xSmall.size,
    lineHeight: theme.typography.fontSize.xSmall.lineHeight,
    color: theme.colors.solids.red.dark,
    position: 'absolute',
    bottom: 8,
    left: 15
  }
});

/**
 * Customised Material Text Input field
 */
export default memo(InputField);