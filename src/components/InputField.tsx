import React, { memo, useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import { TextInput } from "react-native-paper";
import useCustomTheme, { getLineHeight, getLabelLineHeight, ThemeProps } from "../utils/theme";

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
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [hasValue, setHasValue] = useState<boolean>(false);
  const showLabelAbove = hasValue || isFocused;

  return (
    <View style={styles.wrapper}>
      {showLabelAbove && (
        <View style={styles.externalLabelContainer} pointerEvents="none">
          <Text style={styles.externalLabelText}>
            {lable}{isRequired && <Text style={{color: theme.colors.solids.red.dark }}>  *</Text>}
          </Text>
        </View>
      )}
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
        onFocus={() => {
          setIsFocused(true);
          if(onfocus) onfocus();
        }}
        onBlur={() => {
          setIsFocused(false);
          if(onblur) onblur();
        }}
        mode={'outlined'}
        editable={editable}
        // label={hasValue ? <Text style={styles.labelText}>{lable}{isRequired && <Text style={{color: theme.colors.solids.red.dark }}>  *</Text>}</Text> : undefined}
        placeholder={lable}
        placeholderTextColor={theme.colors.secondaryText}
        outlineStyle={styles.outlineStyle}
        activeOutlineColor={theme.colors.vouchers.stock.background}
        outlineColor={theme.colors.solids.grey.light}          
        style={[styles.input, containerStyle ? containerStyle : undefined]}
        contentStyle={[styles.inputTextStyle, {color: !editable ? theme.colors.secondaryText : theme.colors.text}]}
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
          setHasValue(text.length > 0);
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
  labelText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.regular.size,
    lineHeight: getLabelLineHeight(theme.typography.fontSize.regular),
    includeFontPadding: false,
  },
  input: {
    height: 50,
    backgroundColor: theme.colors.background,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.regular.size,
    lineHeight: getLineHeight(theme.typography.fontSize.regular),
  },
  inputContentStyle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.regular.size,
    lineHeight: getLineHeight(theme.typography.fontSize.regular),
    color: theme.colors.text,
    paddingVertical: 0,
  },
  outlineStyle: {
    borderWidth: 1.4
  },
  inputValidationError: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xSmall.size,
    lineHeight: getLineHeight(theme.typography.fontSize.xSmall),
    color: theme.colors.solids.red.dark,
    position: 'absolute',
    bottom: 8,
    left: 15
  },
  inputTextStyle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.regular.size,
    lineHeight: getLineHeight(theme.typography.fontSize.regular),
  }
});

/**
 * Customised Material Text Input field
 */
export default memo(InputField);