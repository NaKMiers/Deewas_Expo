import { useAuth } from '@/components/providers/AuthProvider'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { Redirect, Stack } from 'expo-router'
import { useEffect } from 'react'

function AuthLayout() {
  const { user, loading } = useAuth()

  useEffect(() => {
    GoogleSignin.configure({
      iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
      webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
      profileImageSize: 150,
    })
  }, [])

  if (loading) return null
  if (user) return <Redirect href="/home" />

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  )
}

export default AuthLayout
