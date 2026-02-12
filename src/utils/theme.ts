import { useMemo } from "react";
import { useColorScheme, Dimensions } from "react-native";
import i18next from './i18n';

const { height, width } = Dimensions.get('screen'); 
interface DefaultConfigProps {
  typography: {
    fontFamily: {
      light: Font.PlusJakartaSansLight,
      medium: Font.PlusJakartaSansMedium,
      regular: Font.PlusJakartaSansRegular,
      semiBold: Font.PlusJakartaSansSemiBold,
      italic: Font.PlusJakartaSansItalic,
      bold: Font.PlusJakartaSansBold,
      extraBold: Font.PlusJakartaSansExtraBold,
    },
    fontSize: {
      xxxLarge: {
        size: number;
        lineHeight: number;
      },
      xxLarge: {
        size: number;
        lineHeight: number;
      },
      xLarge: {
        size: number;
        lineHeight: number;
      },
      large: {
        size: number;
        lineHeight: number;
      },
      regular: {
        size: number;
        lineHeight: number;
      },
      small: {
        size: number;
        lineHeight: number;
      },
      xSmall: {
        size: number;
        lineHeight: number;
      },
      xxSmall: {
        size: number;
        lineHeight: number;
      },
    },
  }
}

export interface ThemeProps extends DefaultConfigProps {
  dark: boolean,
  colors: {
    primary: '#000000' | '#FFFFFF',
    secondary: '#808080' | '#B3B3B3',
    text: '#1C1C1C' | '#FFFFFF',
    secondaryText: '#808080' | '#B3B3B3',
    background: '#FFFFFF' | '#000000',
    overlay: '#212528' | '#F2F2F3',
    secondaryBackground: '#FFFFFF' | '#212528',
    lightPalette: string,
    darkPalette: string,
    vouchers: {
        sales: { statusBar: '#0E7942', background: '#229F5F' },
        purchase: { statusBar: '#ef6c00', background: '#FC8345' },
        creditNote: { statusBar: '#2e80d1', background: '#3497FD' },
        debitNote: { statusBar: '#ff5355', background: '#ff6961' },
        receipt: { statusBar: '#02836C', background: '#00B795' },
        payment: { statusBar: '#1A237E', background: '#084EAD' },
        pdfPreview: { statusBar: '#1A237E', background: '#084EAD' }
        stock: { statusBar: '#1A237E', background: '#084EAD' },
        group: { statusBar: '#1A237E', background: '#084EAD' },
        contra: { statusBar: '#8d7a9b', background: '#AC94BE' }
    }
    border: '#B3B3B3',
    shadow: '#4D4D4D',
    /**
     * Only to be used for elements which have fixed colours across themes
     * 
     * @returns Fixed Colors across themes.
     */
    solids: {                 // Only to be used for elements which have fixed colours across themes
      white: '#FFFFFF',
      black: '#000000',
      cyan: '#307368',
      red: {
        dark: '#FF0000',
        medium: '#FF000080'
        light: '#FFDFE0'
      },
      green: {
        light: '#C0EDD2',
        medium: '#E8F7E8',
        dark: '#25D366'
        darkest: '#008000'
      },
      blue: {
        light: '#C6DBF766',
        fbLight: '#B7CCF7',
        dark: '#5D9DF4',
        fbDark: '#4267B2',
        darkest: '#0000FF'
      },
      yellow: {
        light: '#F7E4C1',
        dark: '#E49D19'
      },
      grey: {
        lightest: '#F9F9F9',
        light: '#EDEDED',
        medium: '#CCCCCC33',
        dark: '#999999',
        darkest: '#666666',
      }
    }
  },

}

const lightPalette : ThemeProps['colors']['lightPalette'] = '#F2CA5533';

const darkPalette : ThemeProps['colors']['darkPalette'] = '#F2CA55';

const solids : ThemeProps['colors']['solids'] = {
  white: '#FFFFFF',
  black: '#000000',
  cyan: '#307368',
  red: {
    dark: '#FF0000',
    medium: '#FF000080',
    light: '#FFDFE0'
  },
  green: {
    light: '#C0EDD2',
    medium: '#E8F7E8',
    dark: '#25D366',
    darkest: '#008000'
  },
  blue: {
    light: '#C6DBF7',
    fbLight: '#B7CCF7',
    dark: '#5D9DF4',
    fbDark: '#4267B2',
    darkest: '#0000FF'
  },
  yellow: {
    light: '#F7E4C1',
    dark: '#E49D19'
  },
  grey: {
    lightest: '#F9F9F9',
    light: '#EDEDED',
    medium: '#CCCCCC33',
    dark: '#999999',
    darkest: '#666666',
  }
}

export enum Font {
  PlusJakartaSansLight = "PlusJakartaSans-Light",
  PlusJakartaSansMedium = "AvenirLTStd-Medium",
  PlusJakartaSansBold = 'AvenirLTStd-Black',
  PlusJakartaSansSemiBold = 'AvenirLTStd-Roman',
  PlusJakartaSansExtraBold = "AvenirLTStd-Heavy",
  PlusJakartaSansRegular = 'AvenirLTStd-Book',
  PlusJakartaSansItalic = "PlusJakartaSans-Italic",
}

export const DefaultConfigs: DefaultConfigProps = {
  typography: {
    fontFamily: {
      light: Font.PlusJakartaSansLight,
      medium: Font.PlusJakartaSansMedium,
      regular: Font.PlusJakartaSansRegular,
      italic: Font.PlusJakartaSansItalic,
      semiBold: Font.PlusJakartaSansSemiBold,
      bold: Font.PlusJakartaSansBold,
      extraBold: Font.PlusJakartaSansExtraBold,
    },
    fontSize: {
      xxxLarge: {
        size: 26,
        lineHeight: 36
      },
      xxLarge: {
        size: 22,
        lineHeight: 30
      },
      xLarge: {
        size: 18,
        lineHeight: 26
      },
      large: {
        size: height > 1024 ? 20 : 16,
        lineHeight: height > 1024 ? 28 : 22
      },
      regular: {
        size: height > 1024 ? 18 : 14,
        lineHeight: height > 1024 ? 26 : 20
      },
      small: {
        size: height > 1024 ? 16 : 12,
        lineHeight: height > 1024 ? 18 : 16
      },
      xSmall: {
        size: height > 1024 ? 14 : 10,
        lineHeight: height > 1024 ? 16 : 14
      },
      xxSmall: {
        size: height > 1024 ? 12 : 8,
        lineHeight: height > 1024 ? 12 : 11
      },
      // xxxLarge: 26,        |
      // xxLarge: 22,         |
      // xLarge: 18,          |
      // large: 16,           |----> Mobile Font Sizes        
      // regular: 14,         |
      // small: 12,           |
      // xSmall: 10,          |
      // xxSmall: 8           |
    },
  },
};

const DarkTheme: ThemeProps = {
  ...DefaultConfigs,
  dark: true,
  colors: {
    primary: '#FFFFFF',
    secondary: '#B3B3B3',
    text: '#FFFFFF',
    secondaryText: '#B3B3B3',
    background: '#000000',
    secondaryBackground: '#212528',
    overlay: '#212528',
    border: '#B3B3B3',
    shadow: '#4D4D4D',
    lightPalette: lightPalette,
    darkPalette: darkPalette,
    vouchers: {
        sales: { statusBar: '#0E7942', background: '#229F5F' },
        purchase: { statusBar: '#ef6c00', background: '#FC8345' },
        creditNote: { statusBar: '#2e80d1', background: '#3497FD' },
        debitNote: { statusBar: '#ff5355', background: '#ff6961' },
        receipt: { statusBar: '#02836C', background: '#00B795' },
        payment: { statusBar: '#1A237E', background: '#084EAD' },
        pdfPreview: { statusBar: '#1A237E', background: '#084EAD' },
        stock: { statusBar: '#1A237E', background: '#084EAD' },
        group: { statusBar: '#1A237E', background: '#084EAD' },
        contra: { statusBar: '#8d7a9b', background: '#AC94BE' }
    },
    solids: solids                            // Only to be used for elements which have fixed colours across themes
     
  },
};

const LightTheme: ThemeProps = {
  ...DefaultConfigs,
  dark: false,
  colors: {
    primary: '#000000',
    secondary: '#808080',
    text: '#1C1C1C',
    secondaryText: '#808080',
    background: '#FFFFFF',
    secondaryBackground: '#FFFFFF',
    overlay: '#F2F2F3',
    border: '#B3B3B3',
    shadow: '#4D4D4D',
    lightPalette: lightPalette,
    darkPalette: darkPalette,
    vouchers: {
        sales: { statusBar: '#0E7942', background: '#229F5F' },
        purchase: { statusBar: '#ef6c00', background: '#FC8345' },
        creditNote: { statusBar: '#2e80d1', background: '#3497FD' },
        debitNote: { statusBar: '#ff5355', background: '#ff6961' },
        receipt: { statusBar: '#02836C', background: '#00B795' },
        payment: { statusBar: '#1A237E', background: '#084EAD' },
        pdfPreview: { statusBar: '#1A237E', background: '#084EAD' },
        stock: { statusBar: '#1A237E', background: '#084EAD' },
        group: { statusBar: '#1A237E', background: '#084EAD' },
        contra: { statusBar: '#8d7a9b', background: '#AC94BE' },
    },
    solids: solids                            // Only to be used for elements which have fixed colours across themes
  },
};

export const DefaultTheme = LightTheme;

/**
 * Languages that use Devanagari script (Hindi, Marathi, etc.) need more vertical space
 * These languages require a higher lineHeight multiplier (1.4x - 1.45x) compared to English (1.25x - 1.3x)
 * Headings (larger fonts >= 18px) get even more space to prevent text cutting
 */
const DEVANAGARI_LANGUAGES = ['hi', 'mr']; // Hindi, Marathi

/**
 * Gets the appropriate lineHeight for the current language.
 * Devanagari scripts (Hindi, Marathi) need more vertical space, so we use a higher multiplier.
 * 
 * @param fontSizeConfig - The fontSize config object with size and lineHeight
 * @param language - Optional language code (defaults to current i18n language)
 * @returns Adjusted lineHeight value
 * 
 * @example
 * const { theme } = useCustomTheme();
 * const lineHeight = getLineHeight(theme.typography.fontSize.regular);
 */
export const getLineHeight = (
  fontSizeConfig: { size: number; lineHeight: number },
  language?: string
): number => {
  const currentLanguage = language || i18next.language || 'en';
  const isDevanagari = DEVANAGARI_LANGUAGES.indexOf(currentLanguage) !== -1;
  
  // For Devanagari scripts, use a minimum multiplier of 1.35x
  // For other languages, use the configured lineHeight or minimum 1.2x
  const fontSize = fontSizeConfig.size;
  const configuredLineHeight = fontSizeConfig.lineHeight;
  
  if (isDevanagari) {
    // Use the higher of: configured lineHeight or 1.4x font size (increased from 1.35x)
    // For larger fonts (headings), use even more space (1.45x for sizes >= 18)
    const multiplier = fontSize >= 18 ? 1.45 : 1.4;
    return Math.max(configuredLineHeight, Math.ceil(fontSize * multiplier));
  }
  
  // For non-Devanagari languages, use configured lineHeight or minimum 1.25x (increased from 1.2x)
  // For larger fonts (headings), use 1.3x for sizes >= 18
  const multiplier = fontSize >= 18 ? 1.3 : 1.25;
  return Math.max(configuredLineHeight, Math.ceil(fontSize * multiplier));
};

/**
 * Gets the appropriate lineHeight specifically for labels (input field labels).
 * Labels need more vertical space than regular text, especially for Devanagari scripts.
 * 
 * @param fontSizeConfig - The fontSize config object with size and lineHeight
 * @param language - Optional language code (defaults to current i18n language)
 * @returns Adjusted lineHeight value optimized for labels
 * 
 * @example
 * const { theme } = useCustomTheme();
 * const labelLineHeight = getLabelLineHeight(theme.typography.fontSize.regular);
 */
export const getLabelLineHeight = (
  fontSizeConfig: { size: number; lineHeight: number },
  language?: string
): number => {
  const currentLanguage = language || i18next.language || 'en';
  const isDevanagari = DEVANAGARI_LANGUAGES.indexOf(currentLanguage) !== -1;
  
  const fontSize = fontSizeConfig.size;
  const baseLineHeight = getLineHeight(fontSizeConfig, language);
  
  if (isDevanagari) {
    // For Devanagari labels, use at least 2.0x font size (much more than regular text)
    // This ensures labels have enough space for Devanagari characters with matras/diacritics
    return Math.max(baseLineHeight + 8, Math.ceil(fontSize * 2.0));
  }
  
  // For other languages, use at least 1.6x font size for labels
  return Math.max(baseLineHeight + 6, Math.ceil(fontSize * 1.6));
};

const VOUCHERS = {
    'Sales': 'sales',
    'Purchase': 'purchase',
    'Credit Note': 'creditNote',
    'Debit Note': 'debitNote',
    'Receipt': 'receipt',
    'Payment': 'payment',
    'PdfPreview': 'pdfPreview',
    'Stock':'stock',
    'Group':'group',
    'Contra': 'contra'
}

/**
 * Hook to access theme object and styles prop according to device theme.
 *
 * @returns theme object and styles object (if a function with return type Stylesheet is passed).
 */
const useCustomTheme = <T extends {}>(
  getStyles?: (theme: ThemeProps) => T,
  voucherName?: keyof typeof VOUCHERS
)  => {
  const colorScheme = useColorScheme();

  // console.log(voucherName, '=========')

  const theme = LightTheme;

  // return theme;
  let styles: T;
  if (typeof getStyles === "function") {
    styles = useMemo(() => getStyles(theme), [colorScheme]);
    return { 
        theme, 
        styles,
        statusBar: !!voucherName ? theme.colors?.vouchers[VOUCHERS[voucherName]]?.statusBar : undefined,
        voucherBackground: !!voucherName ? theme.colors?.vouchers[VOUCHERS[voucherName]]?.background : undefined
    } as { theme: ThemeProps; styles: T, statusBar: string, voucherBackground: string };
  }
  return { 
    theme, 
    styles, 
    statusBar: !!voucherName ? theme.colors?.vouchers[VOUCHERS[voucherName]]?.statusBar : undefined,
    voucherBackground: !!voucherName ? theme.colors?.vouchers[VOUCHERS[voucherName]]?.background : undefined
  } as { theme: ThemeProps; styles: T, statusBar: string, voucherBackground: string };
}

export default useCustomTheme;
