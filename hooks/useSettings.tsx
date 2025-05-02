import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { setLoading, setSettings } from '@/lib/reducers/settingsReducer'
import { getMySettingsApi } from '@/requests'
import { useCallback, useEffect } from 'react'
import { useAuth } from '../components/providers/AuthProvider'

function useSettings() {
  // hooks
  const dispatch = useAppDispatch()
  const { user } = useAuth()

  // stores
  const { refreshPoint } = useAppSelector(state => state.load)
  const { settings, loading } = useAppSelector(state => state.settings)

  // get settings
  const getSettings = useCallback(async () => {
    if (!user) return

    // start loading
    dispatch(setLoading(true))

    try {
      // get settings
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
  }, [dispatch, getSettings, user, refreshPoint])

  return { refetch: getSettings, settings, loading }
}

export default useSettings
