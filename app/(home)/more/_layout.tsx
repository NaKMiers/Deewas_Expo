import { Stack } from 'expo-router'
import React from 'react'

function MoreLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="about" />
      <Stack.Screen name="guide" />
      <Stack.Screen name="help-and-support" />
      <Stack.Screen name="privacy-policy" />
      <Stack.Screen name="terms-and-conditions" />
    </Stack>
  )
}

export default MoreLayout
