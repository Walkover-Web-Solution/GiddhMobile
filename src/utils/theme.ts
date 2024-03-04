import { useMemo } from "react";
import { useColorScheme, Dimensions } from "react-native";

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
        size: 26,
        lineHeight: 24 | 28
      },
      xxLarge: {
        size: 22,
        lineHeight: 24 | 28
      },
      xLarge: {
        size: 18,
        lineHeight: 26
      },
      large: {
        size: 20 | 16,
        lineHeight: 22 | 18
      },
      regular: {
        size: 18 | 14,
        lineHeight: 26 | 16
      },
      small: {
        size: 16 | 12,
        lineHeight: 18 | 16
      },
      xSmall: {
        size: 14 | 10,
        lineHeight: 16 | 12
      },
      xxSmall: {
        size: 12 | 8,
        lineHeight: 12 | 10
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
        payment: { statusBar: '#1A237E', background: '#084EAD' }
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
  PlusJakartaSansMedium = "PlusJakartaSans-Medium",
  PlusJakartaSansBold = 'AvenirLTStd-Black',
  PlusJakartaSansSemiBold = 'AvenirLTStd-Roman',
  PlusJakartaSansExtraBold = "PlusJakartaSans-ExtraBold",
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
        lineHeight: 28
      },
      xxLarge: {
        size: 22,
        lineHeight: 24
      },
      xLarge: {
        size: 18,
        lineHeight: 26
      },
      large: {
        size: height > 1024 ? 20 : 16,
        lineHeight: height > 1024 ? 22 : 18
      },
      regular: {
        size: height > 1024 ? 18 : 14,
        lineHeight: height > 1024 ? 26 : 16
      },
      small: {
        size: height > 1024 ? 16 : 12,
        lineHeight: height > 1024 ? 18 : 16
      },
      xSmall: {
        size: height > 1024 ? 14 : 10,
        lineHeight: height > 1024 ? 16 : 12
      },
      xxSmall: {
        size: height > 1024 ? 12 : 8,
        lineHeight: height > 1024 ? 12 : 10
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
        payment: { statusBar: '#1A237E', background: '#084EAD' }
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
        payment: { statusBar: '#1A237E', background: '#084EAD' }
    },
    solids: solids                            // Only to be used for elements which have fixed colours across themes
  },
};

export const DefaultTheme = LightTheme;

const VOUCHERS = {
    'Sales': 'sales',
    'Purchase': 'purchase',
    'Credit Note': 'creditNote',
    'Debit Note': 'debitNote',
    'Receipt': 'receipt',
    'Payment': 'payment'
}

/**
 * Hook to access theme object and styles prop according to device theme.
 *
 * @returns theme object and styles object (if a function with return type Stylesheet is passed).
 */
const useCustomTheme = <T extends {}>(
  getStyles?: (theme: ThemeProps) => T,
  voucherName?: keyof ThemeProps['colors']['vouchers']
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
