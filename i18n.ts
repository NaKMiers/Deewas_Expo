import * as Localization from 'expo-localization'
import i18next from 'i18next'
import 'intl'
import { initReactI18next } from 'react-i18next'

// load messages from JSON files
import ar from '@/messages/ar.json'
import bn from '@/messages/bn.json'
import de from '@/messages/de.json'
import en from '@/messages/en.json'
import es from '@/messages/es.json'
import fr from '@/messages/fr.json'
import gu from '@/messages/gu.json'
import hi from '@/messages/hi.json'
import id from '@/messages/id.json'
import it from '@/messages/it.json'
import ja from '@/messages/ja.json'
import kn from '@/messages/kn.json'
import ko from '@/messages/ko.json'
import ml from '@/messages/ml.json'
import ms from '@/messages/ms.json'
import pt from '@/messages/pt.json'
import ru from '@/messages/ru.json'
import ta from '@/messages/ta.json'
import te from '@/messages/te.json'
import th from '@/messages/th.json'
import tr from '@/messages/tr.json'
import ur from '@/messages/ur.json'
import vi from '@/messages/vi.json'
import zh from '@/messages/zh.json'

const resources = {
  en: { translation: en },
  vi: { translation: vi },
  fr: { translation: fr },
  es: { translation: es },
  zh: { translation: zh },
  de: { translation: de },
  ja: { translation: ja },
  ar: { translation: ar },
  hi: { translation: hi },
  bn: { translation: bn },
  pt: { translation: pt },
  ru: { translation: ru },
  ur: { translation: ur },
  id: { translation: id },
  ms: { translation: ms },
  te: { translation: te },
  ta: { translation: ta },
  ko: { translation: ko },
  it: { translation: it },
  th: { translation: th },
  gu: { translation: gu },
  kn: { translation: kn },
  ml: { translation: ml },
  tr: { translation: tr },
  nl: { nlanslation: tr },
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
