'use client'

import { useAppDispatch } from '@/hooks/reduxHook'
import { setLoading, setSettings } from '@/lib/reducers/settingsReducer'
import { getMySettingsApi } from '@/requests'
import { useEffect } from 'react'
import { useAuth } from './providers/AuthProvider'

function UseSettings() {
  // hooks
  const dispatch = useAppDispatch()
  const { user } = useAuth()

  // get settings
  useEffect(() => {
    async function getSettings() {
      if (!user) return

      // start loading
      dispatch(setLoading(true))

      try {
        const { settings } = await getMySettingsApi()
        dispatch(setSettings(settings))

        // const { rates } = await getExchangeRatesApi()
        // dispatch(setExchangeRates(rates))
      } catch (err: any) {
        console.log(err)
      } finally {
        // stop loading
        dispatch(setLoading(false))
      }
    }

    getSettings()
  }, [dispatch, user])

  return null
}

export default UseSettings
