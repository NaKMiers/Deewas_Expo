import { defaultLanguage, languages } from '@/constants/settings'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Localization from 'expo-localization'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

function useLanguage() {
  // hooks
  const { i18n } = useTranslation()
  const locale = i18n.language
  const deviceLocale = Localization.getLocales()[0]?.languageCode || 'en'

  // states
  const [language, setLanguage] = useState<any>(defaultLanguage)

  // load language
  const loadLanguage = useCallback(async () => {
    try {
      // initially set language
      const languageRaw = await AsyncStorage.getItem('language')
      if (languageRaw) {
        const language = JSON.parse(languageRaw)
        i18n.changeLanguage(language.value)
        setLanguage(language)
      } else {
        const language = languages.find(l => l.value === locale) || defaultLanguage
        await AsyncStorage.setItem('language', JSON.stringify(language))
      }
    } catch (err: any) {
      console.log(err)
    }
  }, [i18n, locale])

  // initial load language
  useEffect(() => {
    loadLanguage()
  }, [loadLanguage])

  // change language
  const changeLanguage = useCallback(async (nextLocale: string) => {
    const language = languages.find(l => l.value === nextLocale) || defaultLanguage
    if (language) {
      i18n.changeLanguage(language.value)
      await AsyncStorage.setItem('language', JSON.stringify(language))
    }
  }, [])

  // reset to device language
  const resetDeviceLanguage = useCallback(async () => {
    changeLanguage(deviceLocale)
  }, [deviceLocale, i18n])

  return { locale, deviceLocale, language, changeLanguage, resetDeviceLanguage }
}

export default useLanguage
