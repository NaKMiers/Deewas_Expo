import { images } from '@/assets/images/images'
import TutorialOverlay from '@/components/dialogs/TutorialOverlay'
import { useAuth } from '@/components/providers/AuthProvider'
import Text from '@/components/Text'
import useLanguage from '@/hooks/useLanguage'
import { useColorScheme } from '@/lib/useColorScheme'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Device from 'expo-device'
import * as LocalAuthentication from 'expo-local-authentication'
import { Redirect, router, Stack } from 'expo-router'
import { useLayoutEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Image, SafeAreaView, View } from 'react-native'

function HomeLayout() {
  // hooks
  const { user, loading, onboarding } = useAuth()
  const { isDarkColorScheme } = useColorScheme()
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('metaData.' + key)
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

  if (loading) return null
  if (bioAuthenticating)
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="mt-21">
          <Text className="mt-21 items-end text-center text-4xl font-bold tracking-wider">
            DEEWAS
            <Text className="text-[40px] font-bold text-green-500">.</Text>
          </Text>
          <Text className="px-21 text-center text-lg text-muted-foreground">
            {t(
              'Deewas is your all-in-one finance app with an AI that fits your vibe, helping you track, save, and grow'
            )}
            .
          </Text>
        </View>
        <ActivityIndicator
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          size="large"
        />
      </SafeAreaView>
    )
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
        <Stack.Screen name="more" />
      </Stack>

      <TutorialOverlay />
    </>
  )
}

export default HomeLayout
