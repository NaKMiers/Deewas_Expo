import { images } from '@/assets/images/images'
import Image from '@/components/Image'
import { useAuth } from '@/components/providers/AuthProvider'
import useInit from '@/hooks/useInit'
import useLanguage from '@/hooks/useLanguage'
import useSettings from '@/hooks/useSettings'
import { useColorScheme } from '@/lib/useColorScheme'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Device from 'expo-device'
import * as LocalAuthentication from 'expo-local-authentication'
import { Redirect, router, Stack } from 'expo-router'
import { useLayoutEffect, useState } from 'react'

function HomeLayout() {
  // hooks
  const { user, loading, onboarding } = useAuth()
  const { isDarkColorScheme } = useColorScheme()
  useLanguage()
  useSettings()
  useInit()

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

  const isTablet = Device.deviceType === Device.DeviceType.TABLET

  return (
    <>
      <Image
        source={isDarkColorScheme ? images.darkBG : images.lightBG}
        resizeMode="cover"
        className="h-full w-full"
        style={{ position: 'absolute' }}
      />
      <Stack
        screenOptions={{
          headerShown: false,
          presentation: !isTablet ? 'modal' : undefined,
          animation: !isTablet ? 'slide_from_bottom' : undefined,
          contentStyle: { backgroundColor: 'transparent' },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(drawers)" />
      </Stack>
    </>
  )
}

export default HomeLayout
