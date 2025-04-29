import Header from '@/components/Header'
import Navbar from '@/components/Navbar'
import { Tabs } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

function TabLayout() {
  return (
    <SafeAreaView className="flex-1">
      <Tabs
        initialRouteName="home"
        tabBar={props => <Navbar {...props} />}
        screenOptions={{
          header: () => <Header />,
          animation: 'fade',
        }}
      />
    </SafeAreaView>
  )
}

export default TabLayout
