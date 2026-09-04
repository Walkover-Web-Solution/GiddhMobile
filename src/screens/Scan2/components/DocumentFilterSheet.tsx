import React, {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Dimensions,
  Keyboard,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FONT_FAMILY, GD_FONT_SIZE } from '@/utils/constants';
import useCustomTheme, { ThemeProps, getLineHeight } from '@/utils/theme';
import { translateConvertedStatus, translateFileStatus } from '../scan2Status.utils';

export type DocumentFilterPayload = {
  status: string | null;
  convertedStatus: string | null;
  fileName: string | null;
  uploadedBy: string | null;
};

export type DocumentFilterSheetRef = {
  open: () => void;
  close: () => void;
};

type Props = {
  filters: DocumentFilterPayload;
  onChange: (next: DocumentFilterPayload) => void;
  onApply: () => void;
  onClear: () => void;
  statusOptions: string[];
};

const SHEET_HEIGHT = Math.round(Dimensions.get('window').height * 0.7);
const OPEN_DURATION = 280;
const CLOSE_DURATION = 220;

const DocumentFilterSheet = forwardRef<DocumentFilterSheetRef, Props>(
  ({ filters, onChange, onApply, onClear, statusOptions }, ref) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { styles } = useCustomTheme(getStyles);
    const [visible, setVisible] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const scrollRef = useRef<ScrollView>(null);
    const fieldOffsetsRef = useRef<Record<string, number>>({});
    const isClosingRef = useRef(false);

    const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
    const dragY = useRef(new Animated.Value(0)).current;
    const backdropOpacity = useRef(new Animated.Value(0)).current;

    const sheetTranslateY = Animated.add(translateY, dragY);

    const runOpenAnimation = () => {
      translateY.setValue(SHEET_HEIGHT);
      dragY.setValue(0);
      backdropOpacity.setValue(0);

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: OPEN_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: OPEN_DURATION,
          useNativeDriver: true,
        }),
      ]).start();
    };

    const runCloseAnimation = (onComplete?: () => void) => {
      if (isClosingRef.current) {
        return;
      }
      isClosingRef.current = true;
      Keyboard.dismiss();

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SHEET_HEIGHT,
          duration: CLOSE_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: CLOSE_DURATION,
          useNativeDriver: true,
        }),
      ]).start(() => {
        dragY.setValue(0);
        isClosingRef.current = false;
        setVisible(false);
        onComplete?.();
      });
    };

    const closeSheet = () => {
      if (!visible) {
        return;
      }
      runCloseAnimation();
    };

    const openSheet = () => {
      Keyboard.dismiss();
      setVisible(true);
    };

    useImperativeHandle(ref, () => ({
      open: openSheet,
      close: closeSheet,
    }));

    useEffect(() => {
      if (visible) {
        runOpenAnimation();
      }
    }, [visible]);

    useEffect(() => {
      const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
      const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

      const showSub = Keyboard.addListener(showEvent, (event) => {
        setKeyboardHeight(event.endCoordinates.height);
      });
      const hideSub = Keyboard.addListener(hideEvent, () => {
        setKeyboardHeight(0);
      });

      return () => {
        showSub.remove();
        hideSub.remove();
      };
    }, []);

    const panResponder = useRef(
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          gesture.dy > 6 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onPanResponderMove: (_, gesture) => {
          if (gesture.dy > 0) {
            dragY.setValue(gesture.dy);
          }
        },
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dy > 80 || gesture.vy > 0.75) {
            runCloseAnimation();
            return;
          }
          Animated.spring(dragY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 0,
          }).start();
        },
        onPanResponderTerminate: () => {
          Animated.spring(dragY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 0,
          }).start();
        },
      })
    ).current;

    const toggleSelection = (key: 'status' | 'convertedStatus', value: string) => {
      const currentValue = filters[key];
      onChange({
        ...filters,
        [key]: currentValue === value ? null : value,
      });
    };

    const scrollToField = (fieldKey: string) => {
      const y = fieldOffsetsRef.current[fieldKey];
      if (y == null) {
        return;
      }
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ y: Math.max(y - 12, 0), animated: true });
      });
    };

    const registerFieldOffset = (fieldKey: string, y: number) => {
      fieldOffsetsRef.current[fieldKey] = y;
    };

    if (!visible) {
      return null;
    }

    return (
      <Modal
        visible={visible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={closeSheet}
      >
        <View style={styles.overlay}>
          <Animated.View
            style={[styles.backdrop, { opacity: backdropOpacity }]}
          >
            <Pressable style={StyleSheet.absoluteFill} onPress={closeSheet} />
          </Animated.View>

          <Animated.View
            style={[
              styles.sheet,
              {
                height: SHEET_HEIGHT,
                paddingBottom: insets.bottom,
                transform: [{ translateY: sheetTranslateY }],
              },
            ]}
          >
            <View style={styles.dragArea} {...panResponder.panHandlers}>
              <View style={styles.handle} />
              <Text style={styles.headerText}>{t('scan2.filterTitle')}</Text>
              <View style={styles.divider} />
            </View>

            <ScrollView
              ref={scrollRef}
              style={styles.scroll}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[
                styles.scrollContent,
                { paddingBottom: keyboardHeight > 0 ? keyboardHeight + 16 : 24 },
              ]}
            >
              <View onLayout={(e) => registerFieldOffset('fileName', e.nativeEvent.layout.y)}>
                <Text style={styles.label}>{t('scan2.fileName')}</Text>
                <TextInput
                  value={filters.fileName ?? ''}
                  onChangeText={(text) => onChange({ ...filters, fileName: text })}
                  placeholder={t('scan2.fileNamePlaceholder')}
                  placeholderTextColor="#A3A3A3"
                  style={styles.input}
                  onFocus={() => scrollToField('fileName')}
                />
              </View>

              <View onLayout={(e) => registerFieldOffset('uploadedBy', e.nativeEvent.layout.y)}>
                <Text style={styles.label}>{t('scan2.uploadedBy')}</Text>
                <TextInput
                  value={filters.uploadedBy ?? ''}
                  onChangeText={(text) => onChange({ ...filters, uploadedBy: text })}
                  placeholder={t('scan2.uploadedByPlaceholder')}
                  placeholderTextColor="#A3A3A3"
                  style={styles.input}
                  onFocus={() => scrollToField('uploadedBy')}
                />
              </View>

              <Text style={styles.label}>{t('scan2.statusLabel')}</Text>
              <View style={styles.optionWrap}>
                {statusOptions.map((option) => {
                  const selected = filters.status === option;
                  return (
                    <TouchableOpacity
                      key={`status-${option}`}
                      activeOpacity={0.8}
                      style={[styles.optionChip, selected && styles.optionChipSelected]}
                      onPress={() => toggleSelection('status', option)}
                    >
                      <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                        {translateFileStatus(t, option)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.label}>{t('scan2.convertedStatusLabel')}</Text>
              <View style={styles.optionWrap}>
                {statusOptions.map((option) => {
                  const selected = filters.convertedStatus === option;
                  return (
                    <TouchableOpacity
                      key={`converted-${option}`}
                      activeOpacity={0.8}
                      style={[styles.optionChip, selected && styles.optionChipSelected]}
                      onPress={() => toggleSelection('convertedStatus', option)}
                    >
                      <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                        {translateConvertedStatus(t, option)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity activeOpacity={0.8} style={styles.clearButton} onPress={onClear}>
                  <Text style={styles.clearButtonText}>{t('scan2.clearFilters')}</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.8} style={styles.applyButton} onPress={onApply}>
                  <Text style={styles.applyButtonText}>{t('scan2.applyFilters')}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    );
  }
);

DocumentFilterSheet.displayName = 'DocumentFilterSheet';

export default memo(DocumentFilterSheet);

const getStyles = (theme: ThemeProps) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
    },
    sheet: {
      backgroundColor: theme.colors.solids.white,
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
      overflow: 'hidden',
    },
    dragArea: {
      paddingBottom: 4,
    },
    handle: {
      alignSelf: 'center',
      marginTop: 10,
      width: 45,
      height: 5,
      borderRadius: 5,
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    headerText: {
      fontFamily: FONT_FAMILY.bold,
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 10,
      fontSize: GD_FONT_SIZE.large,
      lineHeight: getLineHeight(theme.typography.fontSize.large),
      color: '#265BB5',
    },
    divider: {
      borderTopWidth: 1,
      borderTopColor: '#D9D9D9',
      marginHorizontal: 10,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingTop: 18,
    },
    label: {
      marginBottom: 8,
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.regular.size,
      color: theme.colors.text,
    },
    input: {
      height: 44,
      borderWidth: 1,
      borderColor: '#D9D9D9',
      borderRadius: 8,
      paddingHorizontal: 12,
      marginBottom: 14,
      color: theme.colors.text,
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.regular.size,
      backgroundColor: theme.colors.solids.white,
    },
    optionWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 14,
    },
    optionChip: {
      borderWidth: 1,
      borderColor: '#D9D9D9',
      borderRadius: 16,
      paddingHorizontal: 10,
      paddingVertical: 6,
      marginRight: 8,
      marginBottom: 8,
      backgroundColor: theme.colors.solids.white,
    },
    optionChipSelected: {
      borderColor: '#265BB5',
      backgroundColor: '#EAF1FF',
    },
    optionText: {
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.small.size,
      color: theme.colors.text,
    },
    optionTextSelected: {
      color: '#265BB5',
      fontFamily: theme.typography.fontFamily.semiBold,
    },
    actionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 10,
      marginTop: 8,
    },
    clearButton: {
      flex: 1,
      height: 42,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#D9D9D9',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.solids.white,
    },
    clearButtonText: {
      color: '#4B5563',
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.regular.size,
    },
    applyButton: {
      flex: 1,
      height: 42,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#265BB5',
    },
    applyButtonText: {
      color: theme.colors.solids.white,
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.regular.size,
    },
  });
