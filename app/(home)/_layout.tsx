import Header from '@/components/Header'
import Navbar from '@/components/Navbar'
import { useAuth } from '@/components/providers/AuthProvider'
import UseSettings from '@/components/UseSettings'
import UseWallets from '@/components/UseWallets'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Redirect } from 'expo-router'
import { SafeAreaView } from 'react-native'
import Account from './account'
import AI from './ai'
import Budgets from './budgets'
import Calendar from './calendar'
import Categories from './categories'
import Home from './index'
import Transactions from './transactions'

const Tab = createBottomTabNavigator()

function HomeLayout() {
  const { user, loading } = useAuth()

  if (loading) return null
  if (!user) return <Redirect href="/auth/login" />

  return (
    <>
      <SafeAreaView className="flex-1">
        <Tab.Navigator
          initialRouteName="home"
          screenOptions={{
            header: ({ navigation }) => <Header navigation={navigation} />,
          }}
          tabBar={props => <Navbar {...props} />}
        >
          <Tab.Screen
            name="home"
            component={Home}
          />
          <Tab.Screen
            name="transactions"
            component={Transactions}
          />
          <Tab.Screen
            name="ai"
            component={AI}
          />
          <Tab.Screen
            name="budgets"
            component={Budgets}
          />
          <Tab.Screen
            name="account"
            component={Account}
          />
          <Tab.Screen
            name="categories"
            component={Categories}
          />
          <Tab.Screen
            name="calendar"
            component={Calendar}
          />
        </Tab.Navigator>
      </SafeAreaView>

      <UseWallets />
      <UseSettings />
    </>
  )
}

export default HomeLayout
