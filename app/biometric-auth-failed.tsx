import { images } from '@/assets/images/images'
import Icon from '@/components/Icon'
import Image from '@/components/Image'
import { useAuth } from '@/components/providers/AuthProvider'
import { Separator } from '@/components/ui/separator'
import { Redirect, router, useNavigation } from 'expo-router'
import { LucideLogOut, LucideScanFace } from 'lucide-react-native'
import React, { useEffect } from 'react'
import { BackHandler, ImageBackground, Text, TouchableOpacity, View } from 'react-native'

function BiometricAuthFailedPage() {
  // hooks
  const { user, onboarding, logout } = useAuth()
  const navigation = useNavigation()

  // prevent change screen when back button pressed or when swipe back
  useEffect(() => {
    navigation.setOptions({ gestureEnabled: false })
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      return true
    })
    return () => backHandler.remove()
  }, [])

  if (!user) {
    return onboarding ? <Redirect href="/auth/sign-in" /> : <Redirect href="/welcome" />
  }

  return (
    <ImageBackground
      source={images.preBgVFlip}
      className="flex-1 items-center justify-center"
      style={{ paddingBottom: 200 }}
    >
      <View style={{ height: 200, width: 200 }}>
        <Image
          source={images.preLogo}
          resizeMode="contain"
          className="h-full w-full"
        />
      </View>

      <Text
        className="flex items-end text-center font-bold tracking-wider text-neutral-800"
        style={{ fontSize: 56 }}
      >
        DEEWAS
        <Text className="text-[40px] font-bold text-green-500">.</Text>
      </Text>

      <Separator className="my-4 h-0" />

      <View className="w-full flex-row items-center justify-evenly">
        <View className="items-center gap-2">
          <TouchableOpacity
            className="rounded-xl border-2 border-yellow-500 bg-yellow-500/10 p-21 shadow-lg"
            onPress={logout}
          >
            <Icon
              render={LucideLogOut}
              size={36}
              color="#eab308"
            />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-neutral-800">Log Out</Text>
        </View>
        <View className="items-center gap-2">
          <TouchableOpacity
            className="rounded-xl border-2 border-sky-500 bg-sky-500/10 p-21 shadow-lg"
            onPress={() => router.replace('/home')}
          >
            <Icon
              render={LucideScanFace}
              size={36}
              color="#0ea5e9"
            />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-neutral-800">Unlock</Text>
        </View>
      </View>
    </ImageBackground>
  )
}

export default BiometricAuthFailedPage
