import i18next from 'i18next';
import {initReactI18next} from 'react-i18next';

import en from '@/locales/en.json';
import hi from '@/locales/hi.json';
import {FALL_BACK_LANGUAGE} from '@/utils/constants';

i18next.use(initReactI18next).init({
  resources: {
    en: {
      translation: en,
    },
    hi: {
      translation: hi,
    },
  },
  lng: FALL_BACK_LANGUAGE,
  fallbackLng: FALL_BACK_LANGUAGE,
  interpolation: {
    escapeValue: false,
  },
  keySeparator: '.',
});

export default i18next;
