import { Stack } from 'expo-router'

export default function DrawerLayout() {
  return (
    <Stack
      screenOptions={{
        presentation: 'modal',
        animation: 'slide_from_bottom',
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
      }}
    />
  )
}
