import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { clearUser, setLoading, setOnboarding, setUser } from '@/lib/reducers/userReducer'
import { refreshTokenApi } from '@/requests'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as LocalAuthentication from 'expo-local-authentication'
import { jwtDecode } from 'jwt-decode'
import moment from 'moment'
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'

interface AuthContextValue {
  user: IFullUser | null
  isPremium: boolean
  loading: boolean
  refreshToken: () => Promise<void>
  logout: () => Promise<void>
  onboarding: any
  switchBiometric: (value?: -1 | 0 | 1) => Promise<void>
  biometric: { open: boolean; isSupported: boolean }
  loggingOut: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function AuthProvider({ children }: { children: ReactNode }) {
  // hooks
  const dispatch = useAppDispatch()
  const { user, loading, onboarding } = useAppSelector(state => state.user)
  const { t: translate } = useTranslation()
  const t = useCallback((key: string) => translate('authProvider.' + key), [translate])
  const tError = useCallback((key: string) => translate('error.' + key), [translate])

  // states
  const [isPremium, setIsPremium] = useState<boolean>(false)
  const [biometric, setBiometric] = useState<any>({
    open: false,
    isSupported: false,
  })
  const [loggingOut, setLoggingOut] = useState<boolean>(false)

  // check if user is premium
  useEffect(() => {
    if (!user || !user.plan) return

    switch (user.plan) {
      case 'premium-lifetime':
        setIsPremium(true)
        break
      case 'premium-monthly':
      case 'premium-yearly':
        setIsPremium(moment(user.planExpiredAt).isAfter(moment()))
        break
      default:
        setIsPremium(false)
    }
  }, [user])

  // load biometric values
  useEffect(() => {
    const loadBiometric = async () => {
      const biometricRaw = await AsyncStorage.getItem('biometric')
      let dfBio = { open: false, isSupported: false }
      if (biometricRaw) {
        dfBio = JSON.parse(biometricRaw)
      } else {
        await AsyncStorage.setItem('biometric', JSON.stringify(dfBio))
      }

      const supported = await LocalAuthentication.hasHardwareAsync()
      setBiometric({ ...dfBio, isSupported: supported })
    }

    loadBiometric()
  }, [])

  // turn on/off biometric authentication
  const switchBiometric = useCallback(
    async (value?: -1 | 0 | 1) => {
      if (!biometric.isSupported) {
        Alert.alert(tError('Biometric authentication is not supported on this device'))
        return
      }

      const val = value === 1 ? true : value === 0 || value === -1 ? false : !biometric.open

      try {
        let isSuccess = false

        if (value !== -1) {
          // require biometric authentication
          const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Unlock your wallet',
            fallbackLabel: 'Use PIN',
          })

          isSuccess = !!result.success
        }

        if (isSuccess || value === -1) {
          const newBiometric = { ...biometric, open: val }
          await AsyncStorage.setItem('biometric', JSON.stringify(newBiometric))
          setBiometric(newBiometric)
        } else {
          Alert.alert(tError('Authentication failed'), tError('Biometric authentication failed'))
        }
      } catch (err: any) {
        Alert.alert(tError('Authentication error'), err.message)
      }
    },
    [tError, biometric]
  )

  // handle logout
  const logout = useCallback(async () => {
    setLoggingOut(true)

    await switchBiometric(-1)
    await AsyncStorage.removeItem('token')
    await AsyncStorage.removeItem('messages')
    dispatch(clearUser())

    setLoggingOut(false)
  }, [dispatch, switchBiometric])

  // auto logout when user is deleted
  useEffect(() => {
    if (!user) return
    if (user.isDeleted) {
      Alert.alert(
        t('Account Deleted'),
        `${t('Your account has been deleted')}. ${t('Please create a new account to continue using the app')}.`,
        [
          {
            text: t('Sign Out'),
            onPress: logout,
          },
        ]
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, user])

  // refresh token
  const refreshToken = useCallback(async () => {
    if (!user?._id) return

    try {
      const { token } = await refreshTokenApi()

      // save token and user
      await AsyncStorage.setItem('token', token)
      const decodedUser: IFullUser = jwtDecode(token)
      dispatch(setUser(decodedUser))
    } catch (err: any) {
      console.log(err)
    }
  }, [dispatch, user?._id])

  // auto refresh token every time open the app
  useEffect(() => {
    refreshToken()
  }, [refreshToken])

  // load user data from AsyncStorage
  useEffect(() => {
    const loadUserData = async () => {
      // loading
      dispatch(setLoading(true))

      try {
        const storedToken = await AsyncStorage.getItem('token')
        const onboarding = await AsyncStorage.getItem('onboarding')

        if (storedToken) {
          const decodedUser: IFullUser = jwtDecode(storedToken)
          const isExpired = Date.now() >= decodedUser.exp * 1000

          // not expired
          if (!isExpired) {
            dispatch(setUser(decodedUser))
            if (onboarding) {
              dispatch(setOnboarding(JSON.parse(onboarding)))
            }
          }
          // expired
          else {
            const { token: newToken } = await refreshTokenApi()
            const decodedUser: IFullUser = jwtDecode(newToken)
            await AsyncStorage.setItem('token', newToken)
            dispatch(setUser(decodedUser))
          }
        }
      } catch (err) {
        console.log(err)
        await AsyncStorage.removeItem('token')
        await AsyncStorage.removeItem('messages')
        dispatch(clearUser())
      } finally {
        // stop loading
        dispatch(setLoading(false))
      }
    }

    loadUserData()
  }, [dispatch, refreshToken])

  const value: AuthContextValue = {
    user,
    isPremium,
    onboarding,
    loading,
    refreshToken,
    logout,
    switchBiometric,
    biometric,
    loggingOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
