import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { clearUser, setLoading, setOnboarding, setToken, setUser } from '@/lib/reducers/userReducer'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as LocalAuthentication from 'expo-local-authentication'
import { router } from 'expo-router'
import { jwtDecode } from 'jwt-decode'
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'

interface AuthContextValue {
  token: string | null
  user: IFullUser | null
  loading: boolean
  logout: () => Promise<void>
  onboarding: any
  switchBiometric: (value?: -1 | 0 | 1) => Promise<void>
  biometric: { open: boolean; isSupported: boolean }
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function AuthProvider({ children }: { children: ReactNode }) {
  // hooks
  const dispatch = useAppDispatch()
  const { token, user, loading, onboarding } = useAppSelector(state => state.user)
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('authProvider.' + key)
  const tError = (key: string) => translate('error.' + key)

  // states
  const [biometric, setBiometric] = useState<any>({
    open: false,
    isSupported: false,
  })

  // load user data from AsyncStorage
  useEffect(() => {
    const loadUserData = async () => {
      dispatch(setLoading(true))

      try {
        const storedToken = await AsyncStorage.getItem('token')
        const onboarding = await AsyncStorage.getItem('onboarding')

        if (storedToken && !token) {
          const decodedUser: IFullUser = jwtDecode(storedToken)
          const isExpired = Date.now() >= decodedUser.exp * 1000

          // not expired
          if (!isExpired) {
            dispatch(setToken(storedToken))
            dispatch(setUser(decodedUser))
            if (onboarding) {
              dispatch(setOnboarding(JSON.parse(onboarding)))
            }
          }
          // expired
          else {
            await AsyncStorage.removeItem('token')
            dispatch(clearUser())
            router.replace('/auth/sign-in')
          }
        }
      } catch (err) {
        console.log(err)
        await AsyncStorage.removeItem('token')
        dispatch(clearUser())
      } finally {
        dispatch(setLoading(false))
      }
    }

    loadUserData()
  }, [dispatch, token])

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

      const val = value === 1 ? true : value === 0 ? false : !biometric.open

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
    [biometric]
  )

  // handle logout
  const logout = useCallback(async () => {
    await AsyncStorage.removeItem('token')
    await AsyncStorage.removeItem('messages')
    dispatch(clearUser())
    switchBiometric(-1)
  }, [dispatch, switchBiometric])

  const value: AuthContextValue = {
    token,
    user,
    onboarding,
    loading,
    logout,
    switchBiometric,
    biometric,
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
