import { Stack } from 'expo-router'

function HomeLayout() {

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(drawers)" />
    </Stack>
  )
}

export default HomeLayout
