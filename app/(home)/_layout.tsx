import Header from '@/components/Header'
import Navbar from '@/components/Navbar'
import { useAuth } from '@/components/providers/AuthProvider'
import useLanguage from '@/hooks/useLanguage'
import useSettings from '@/hooks/useSettings'
import useWallets from '@/hooks/useWallets'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as LocalAuthentication from 'expo-local-authentication'
import { Redirect, router, Tabs } from 'expo-router'
import { useLayoutEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

function HomeTabLayout() {
  // hooks
  const { user, loading, onboarding } = useAuth()
  useSettings()
  useWallets()
  useLanguage()

  const [bioAuthenticating, setBioAuthenticating] = useState(false)

  useLayoutEffect(() => {
    const bioAuth = async () => {
      // start loading
      setBioAuthenticating(true)

      try {
        // check if biometric is supported
        const isSupported = await LocalAuthentication.hasHardwareAsync()
        if (!isSupported) return

        const biometricRaw = await AsyncStorage.getItem('biometric')
        const dfBio = biometricRaw ? JSON.parse(biometricRaw) : { open: false, isSupported }
        if (!biometricRaw) await AsyncStorage.setItem('biometric', JSON.stringify(dfBio))

        // check if biometric is turned on
        if (!dfBio.open) return

        // biometric authentication
        const result: any = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Unlock Deewas',
          fallbackLabel: 'Enter PIN',
          cancelLabel: 'Cancel',
        })

        if (!result.success) {
          router.replace('/biometric-auth-failed')
        }
      } catch (err: any) {
        console.error(err)
        router.replace('/biometric-auth-failed')
      } finally {
        // stop loading
        setBioAuthenticating(false)
      }
    }

    bioAuth()
  }, [])

  if (loading || bioAuthenticating) return null
  if (!user) {
    return onboarding ? <Redirect href="/auth/sign-in" /> : <Redirect href="/welcome" />
  }

  return (
    <SafeAreaView className="flex-1">
      <Tabs
        initialRouteName="home"
        tabBar={props => <Navbar {...props} />}
        screenOptions={{
          header: () => <Header />,
          animation: 'fade',
        }}
      />
    </SafeAreaView>
  )
}

export default HomeTabLayout
