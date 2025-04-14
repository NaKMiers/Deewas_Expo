import * as Localization from 'expo-localization'
import i18next from 'i18next'
import 'intl'
import { initReactI18next } from 'react-i18next'

// load messages from JSON files
import enMessages from '@/messages/en.json'
import viMessages from '@/messages/vi.json'

const resources = {
  en: { translation: enMessages },
  vi: { translation: viMessages },
}

const deviceLocales = Localization.getLocales()
const preferredLanguage = deviceLocales[0]?.languageCode || 'en'

i18next.use(initReactI18next).init({
  resources,
  lng: preferredLanguage,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: 'v4',
})

export default i18next
