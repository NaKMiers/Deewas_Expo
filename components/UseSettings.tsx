import { defaultLanguage, languages } from '@/constants/settings'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { setLoading, setSettings } from '@/lib/reducers/settingsReducer'
import { getMySettingsApi } from '@/requests'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from './providers/AuthProvider'

function UseSettings() {
  // hooks
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const { t: translate, i18n } = useTranslation()
  const locale = i18n.language

  // stores
  const { refreshPoint } = useAppSelector(state => state.load)

  // get settings
  const getSettings = useCallback(async () => {
    if (!user) return

    // start loading
    dispatch(setLoading(true))

    try {
      // get settings
      const { settings } = await getMySettingsApi()
      dispatch(setSettings(settings))

      // initially set language
      const languageRaw = await AsyncStorage.getItem('language')
      if (languageRaw) {
        const language = JSON.parse(languageRaw)
        i18n.changeLanguage(language.value)
      } else {
        const language = languages.find(l => l.value === locale) || defaultLanguage
        await AsyncStorage.setItem('language', JSON.stringify(language))
      }
    } catch (err: any) {
      console.log(err)
    } finally {
      // stop loading
      dispatch(setLoading(false))
    }
  }, [dispatch, user])

  // initial get settings
  useEffect(() => {
    getSettings()
  }, [dispatch, user, refreshPoint])

  return null
}

export default UseSettings
