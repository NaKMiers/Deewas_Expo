import { useAuth } from '@/components/providers/AuthProvider'
import { Redirect, Stack } from 'expo-router'

function AuthLayout() {
  const { user, loading } = useAuth()

  if (loading) return null
  if (user) return <Redirect href="/" />

  return (
    <Stack>
      <Stack.Screen
        name="auth/login"
        options={
          {
            // title: 'Login',
            // headerShown: false
          }
        }
      />
      <Stack.Screen
        name="auth/register"
        options={
          {
            // title: 'Login',
            // headerShown: false
          }
        }
      />
      <Stack.Screen
        name="auth/forgot-password"
        options={
          {
            // title: 'Login',
            // headerShown: false
          }
        }
      />
    </Stack>
  )
}

export default AuthLayout
