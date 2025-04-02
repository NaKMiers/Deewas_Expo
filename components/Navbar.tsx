import { useAppDispatch } from '@/hooks/reduxHook'
import { setCurWallet } from '@/lib/reducers/walletReducer'
import { useColorScheme } from '@/lib/useColorScheme'
import { cn } from '@/lib/utils'
import { usePathname, useRouter } from 'expo-router'
import { LucideBrain, LucideHome, LucidePieChart, LucideWallet } from 'lucide-react-native'
import { memo } from 'react'
import { Image, TouchableOpacity, View } from 'react-native'
import { useAuth } from './providers/AuthProvider'

const routes = [
  {
    label: 'Home',
    icon: LucideHome,
    activeColor: '#10b981',
    href: '/',
  },
  {
    label: 'Transactions',
    icon: LucideWallet,
    activeColor: '#0ea5e9',
    href: '/transactions',
  },
  {
    label: 'AI',
    icon: LucideBrain,
    activeColor: '#f43f5e',
    href: '/ai',
  },
  {
    label: 'Budgets',
    icon: LucidePieChart,
    activeColor: '#8b5cf6',
    href: '/budgets',
  },
  {
    label: 'Account',
    href: '/account',
  },
]

function Navbar({ className, state, navigation, ...props }: { className?: string; [key: string]: any }) {
  // hooks
  const dispatch = useAppDispatch()
  const pathname = usePathname()
  const router = useRouter()
  // const { t: translate } = useTranslation()
  // const t = (key: string) => translate('navbar.' + key)
  const { user } = useAuth()
  const { isDarkColorScheme } = useColorScheme()

  const handleNavigate = (route: any, isFocused: boolean) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: state.routes.find((r: any) => r.name === route.label)?.key,
    })

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.label.toLowerCase())
    }

    if (route.href === '/transactions') {
      dispatch(setCurWallet(null))
    }
  }

  return (
    <View
      className={cn('flex items-center', className)}
      style={{ maxHeight: 48, paddingRight: 10.5, paddingLeft: 10.5 }}
    >
      <View className="flex h-full max-w-[400px] flex-row items-center rounded-full bg-primary">
        {routes.map(route => {
          const isFocused = state.routes[state.index]?.name === route.label

          return (
            <TouchableOpacity
              onPress={() => handleNavigate(route, isFocused)}
              className={cn(
                'trans-200 flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full py-1'
              )}
              key={route.href}
            >
              {route.icon ? (
                <route.icon
                  size={24}
                  color={isFocused ? route.activeColor : isDarkColorScheme ? 'black' : 'white'}
                />
              ) : (
                <Image
                  className="rounded-full"
                  source={{ uri: user?.avatar || process.env.NEXT_PUBLIC_DEFAULT_AVATAR }}
                  width={26}
                  height={26}
                  alt="account"
                />
              )}
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

export default memo(Navbar)
