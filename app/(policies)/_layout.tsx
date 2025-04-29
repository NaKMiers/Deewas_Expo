import { Tabs } from 'expo-router'

function PolicyLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        tabBarStyle: { display: 'none' },
      }}
    />
  )
}

export default PolicyLayout
