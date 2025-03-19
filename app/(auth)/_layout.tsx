import { Stack } from 'expo-router'

function AuthLayout() {
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
    </Stack>
  )
}

export default AuthLayout
