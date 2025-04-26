import { images } from '@/assets/images/images'
import { useColorScheme } from '@/lib/useColorScheme'
import { cn } from '@/lib/utils'
import { router } from 'expo-router'
import { LucideHome, LucidePieChart, LucideWallet } from 'lucide-react-native'
import { memo, useMemo } from 'react'
import { TouchableOpacity, View } from 'react-native'
import Image from './Image'
import { useAuth } from './providers/AuthProvider'

interface NavbarProps {
  className?: string
  state: any
  [key: string]: any
}

function Navbar({ className, state }: NavbarProps) {
  // hooks
  const { user } = useAuth()
  const { isDarkColorScheme } = useColorScheme()

  const routes = useMemo(
    () => [
      {
        label: 'Home',
        href: '/home',
        icon: LucideHome,
        activeColor: '#10b981',
      },
      {
        label: 'Transactions',
        href: '/transactions',
        icon: LucideWallet,
        activeColor: '#0ea5e9',
      },
      {
        label: 'AI',
        href: '/ai',
        activeColor: '#f43f5e',
        source: isDarkColorScheme ? images.roundedLogoDark : images.roundedLogoLight,
        fallbackSource: isDarkColorScheme ? images.roundedLogoDark : images.roundedLogoLight,
        width: 32,
        height: 32,
        className: 'rounded-none',
      },
      {
        label: 'Budgets',
        href: '/budgets',
        icon: LucidePieChart,
        activeColor: '#8b5cf6',
      },
      {
        label: 'Account',
        href: '/account',
        source: { uri: user?.avatar },
        fallbackSource: images.defaultAvatar,
      },
    ],
    [user?.avatar, isDarkColorScheme]
  )

  return (
    <View
      className={cn('flex items-center', className)}
      style={{
        maxHeight: 48,
        paddingRight: 10.5,
        paddingLeft: 10.5,
      }}
    >
      <View className="flex h-full max-w-[400px] flex-row items-center rounded-full bg-primary">
        {routes.map(route => {
          const isFocused = state.routes[state.index]?.name === route.label.toLowerCase()

          return (
            <TouchableOpacity
              onPress={() => router.replace(route.href as any)}
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
                <View
                  className={cn('overflow-hidden rounded-full', route.className)}
                  style={{ height: route.height || 26, width: route.width || 26 }}
                >
                  <Image
                    className="h-full w-full"
                    source={route.source}
                    fallbackSource={route.fallbackSource}
                    resizeMode="cover"
                    alt="account"
                  />
                </View>
              )}
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

export default memo(Navbar)
