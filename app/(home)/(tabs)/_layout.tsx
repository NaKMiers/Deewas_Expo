import { Tabs } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

function TabLayout() {
  return (
    <SafeAreaView className="flex-1">
      <Tabs
        initialRouteName="home"
        screenOptions={{
          animation: 'fade',
        }}
      />
    </SafeAreaView>
  )
}

export default TabLayout
