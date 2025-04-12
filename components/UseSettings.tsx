import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { setLoading, setSettings } from '@/lib/reducers/settingsReducer'
import { getMySettingsApi } from '@/requests'
import { useCallback, useEffect } from 'react'
import { useAuth } from './providers/AuthProvider'

function UseSettings() {
  // hooks
  const dispatch = useAppDispatch()
  const { user } = useAuth()

  // stores
  const { refreshPoint } = useAppSelector(state => state.load)

  // get settings
  const getSettings = useCallback(async () => {
    if (!user) return

    // start loading
    dispatch(setLoading(true))

    try {
      const { settings } = await getMySettingsApi()
      dispatch(setSettings(settings))
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
