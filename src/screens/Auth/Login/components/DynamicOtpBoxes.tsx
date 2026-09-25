import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import colors from '@/utils/colors';
import { FONT_FAMILY } from '@/utils/constants';

export type OtpBoxLength = 4 | 6 | 8;

type DynamicOtpBoxesProps = {
  length: number;
  value: string;
  onChange: (code: string) => void;
  autoFocus?: boolean;
};

const normalizeOtpLength = (length?: number): OtpBoxLength => {
  if (length === 4 || length === 6 || length === 8) {
    return length;
  }
  return 8;
};

const getBoxMetrics = (otpLength: OtpBoxLength, containerWidth: number) => {
  let gap = otpLength >= 8 ? 5 : otpLength === 6 ? 10 : 12;
  const usable = Math.max(containerWidth - 2, 0);
  let size = Math.floor((usable - gap * (otpLength - 1)) / otpLength);

  if (size < 30 && otpLength >= 8) {
    gap = 4;
    size = Math.floor((usable - gap * (otpLength - 1)) / otpLength);
  }
  if (size < 28 && otpLength >= 8) {
    gap = 3;
    size = Math.floor((usable - gap * (otpLength - 1)) / otpLength);
  }

  size = Math.max(22, Math.min(otpLength >= 8 ? 40 : 50, size));

  const maxFit = Math.floor((usable - gap * (otpLength - 1)) / otpLength);
  if (maxFit > 0) {
    size = Math.min(size, maxFit);
  }

  return {
    size,
    gap,
    borderRadius: size >= 36 ? 14 : size >= 30 ? 12 : 10,
    fontSize: size >= 42 ? 20 : size >= 34 ? 17 : size >= 28 ? 15 : 13
  };
};

const DynamicOtpBoxes: React.FC<DynamicOtpBoxesProps> = ({
  length: lengthProp,
  value,
  onChange,
  autoFocus = true
}) => {
  const length = normalizeOtpLength(lengthProp);
  const hiddenInputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [caretVisible, setCaretVisible] = useState(true);
  const [rowWidth, setRowWidth] = useState(0);
  const caretOpacity = useRef(new Animated.Value(1)).current;

  const digits = useMemo(() => {
    const arr = value.replace(/\D/g, '').slice(0, length).split('');
    while (arr.length < length) {
      arr.push('');
    }
    return arr;
  }, [value, length]);

  const metrics = useMemo(() => {
    const screenWidth = Dimensions.get('window').width;
    const estimated =
      rowWidth > 0 ? rowWidth : Math.min(screenWidth - 48, 400) - 48;
    return getBoxMetrics(length, estimated);
  }, [length, rowWidth]);

  const activeIndex = Math.min(value.replace(/\D/g, '').length, length - 1);

  useEffect(() => {
    if (!autoFocus) {
      return;
    }
    const timer = setTimeout(() => {
      hiddenInputRef.current?.focus();
    }, 320);
    return () => clearTimeout(timer);
  }, [autoFocus, length]);

  useEffect(() => {
    if (!isFocused) {
      caretOpacity.setValue(0);
      return;
    }
    caretOpacity.setValue(1);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(caretOpacity, {
          toValue: 0,
          duration: 480,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(caretOpacity, {
          toValue: 1,
          duration: 480,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isFocused, caretOpacity, activeIndex]);

  useEffect(() => {
    setCaretVisible(true);
  }, [value]);

  const handleChange = (text: string) => {
    onChange(text.replace(/\D/g, '').slice(0, length));
  };

  const focusOtpInput = () => {
    const input = hiddenInputRef.current;
    if (!input) {
      return;
    }
    input.blur();
    const reopen = () => input.focus();
    if (Platform.OS === 'android') {
      setTimeout(reopen, 40);
      return;
    }
    requestAnimationFrame(reopen);
  };

  return (
    <Pressable
      onPress={focusOtpInput}
      style={styles.otpRow}
      onLayout={(e) => {
        const w = Math.floor(e.nativeEvent.layout.width);
        if (w > 0 && w !== rowWidth) {
          setRowWidth(w);
        }
      }}
    >
      {digits.map((digit, index) => {
        const isActive = isFocused && index === activeIndex;
        const isFilled = digit.length > 0;
        const isLast = index === length - 1;
        const showCaret = isActive && !isFilled && caretVisible;
        return (
          <View
            key={`otp-${length}-${index}`}
            pointerEvents="none"
            style={[
              styles.otpBox,
              {
                width: metrics.size,
                height: metrics.size,
                borderRadius: metrics.borderRadius,
                marginRight: isLast ? 0 : metrics.gap
              },
              isFilled && styles.otpBoxFilled,
              isActive && styles.otpBoxFocused
            ]}
          >
            {digit ? (
              <Text
                style={[
                  styles.otpDigit,
                  {
                    fontSize: metrics.fontSize,
                    lineHeight: metrics.fontSize + 4
                  }
                ]}
              >
                {digit}
              </Text>
            ) : showCaret ? (
              <Animated.View
                style={[styles.otpCaret, { opacity: caretOpacity }]}
              />
            ) : null}
          </View>
        );
      })}

      <TextInput
        ref={hiddenInputRef}
        value={value.replace(/\D/g, '').slice(0, length)}
        onChangeText={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
        caretHidden
        maxLength={length}
        showSoftInputOnFocus
        style={styles.otpHiddenInput}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
    width: '100%',
    marginTop: 4,
    marginBottom: 2,
    paddingVertical: 4,
    position: 'relative',
    overflow: 'visible'
  },
  otpHiddenInput: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.02,
    color: 'transparent',
    backgroundColor: 'transparent'
  },
  otpBox: {
    borderWidth: 1.5,
    borderColor: '#E3E8F2',
    backgroundColor: '#F7F9FC',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    zIndex: 1
  },
  otpBoxFilled: {
    borderColor: '#C9D8F8',
    backgroundColor: colors.WHITE
  },
  otpBoxFocused: {
    borderColor: colors.PRIMARY_BASIC,
    borderWidth: 2,
    backgroundColor: '#F3F7FF'
  },
  otpDigit: {
    fontFamily: FONT_FAMILY.bold,
    color: colors.TEXT_HEADING,
    textAlign: 'center',
    padding: 0,
    letterSpacing: 0.3,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : null)
  },
  otpCaret: {
    width: 2,
    height: 22,
    borderRadius: 1,
    backgroundColor: colors.PRIMARY_BASIC
  }
});

export default DynamicOtpBoxes;
