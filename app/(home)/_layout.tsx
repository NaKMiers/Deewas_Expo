import Header from '@/components/Header'
import Navbar from '@/components/Navbar'
import { useAuth } from '@/components/providers/AuthProvider'
import useLanguage from '@/hooks/useLanguage'
import useSettings from '@/hooks/useSettings'
import useWallets from '@/hooks/useWallets'
import { Redirect, Tabs } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

function HomeTabLayout() {
  const { user, loading, onboarding } = useAuth()
  useSettings()
  useWallets()
  useLanguage()

  if (loading) return null
  if (!user) {
    return onboarding ? <Redirect href="/auth/sign-in" /> : <Redirect href="/welcome" />
  }

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

export default HomeTabLayout
