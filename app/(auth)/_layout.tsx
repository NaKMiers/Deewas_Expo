import { useAuth } from '@/components/providers/AuthProvider'
import { Redirect, Stack } from 'expo-router'

function AuthLayout() {
  const { user, loading } = useAuth()

  if (loading) return null
  // if (user) return <Redirect href="/home" />

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='login' />
      <Stack.Screen name='register' />
      <Stack.Screen name='forgot-password' />
    </Stack>
  )
}

export default AuthLayout
