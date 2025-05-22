import { images } from '@/assets/images/images'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { setStep } from '@/lib/reducers/tutorialReducer'
import { useColorScheme } from '@/lib/useColorScheme'
import { cn } from '@/lib/utils'
import { router, usePathname } from 'expo-router'
import { LucideCircleUserRound, LucideHome, LucidePieChart, LucideWallet } from 'lucide-react-native'
import { memo } from 'react'
import { TouchableOpacity, View } from 'react-native'
import Image from './Image'
import { useAuth } from './providers/AuthProvider'

interface NavbarProps {
  className?: string
  [key: string]: any
}

function Navbar({ className }: NavbarProps) {
  // hooks
  const { user } = useAuth()
  const { isDarkColorScheme } = useColorScheme()
  const pathname = usePathname()
  const dispatch = useAppDispatch()

  // store
  const { inProgress, step } = useAppSelector(state => state.tutorial)

  return (
    <View
      className={cn(className)}
      style={{
        maxHeight: 48,
      }}
    >
      <View className="mx-auto h-full max-w-[400px] flex-row items-center justify-center">
        {/* MARK: Home */}
        <TouchableOpacity
          onPress={() => router.push('/home')}
          className={cn(
            'trans-200 flex-1 flex-col items-center justify-center gap-0.5 rounded-full py-1'
          )}
        >
          <LucideHome
            size={24}
            color={pathname === '/home' ? '#10b981' : isDarkColorScheme ? 'white' : 'black'}
          />
        </TouchableOpacity>

        {/* MARK: Transactions */}
        <TouchableOpacity
          onPress={() => {
            router.push('/transactions')
            if (inProgress && step === 3) dispatch(setStep(4))
          }}
          className={cn(
            'trans-200 flex-1 flex-col items-center justify-center gap-0.5 rounded-full py-1',
            inProgress && step === 3 && 'rounded-lg border-2 border-sky-500 bg-sky-500/10'
          )}
        >
          <LucideWallet
            size={24}
            color={pathname === '/transactions' ? '#0ea5e9' : isDarkColorScheme ? 'white' : 'black'}
          />
        </TouchableOpacity>

        {/* MARK: AI */}
        <TouchableOpacity
          onPress={() => {
            router.push('/ai')
            if (inProgress && step === 9) dispatch(setStep(10))
          }}
          className={cn(
            'trans-200 flex-1 flex-col items-center justify-center gap-0.5 rounded-full py-1',
            inProgress && step === 9 && 'rounded-lg border-2 border-sky-500 bg-sky-500/10'
          )}
        >
          <View style={{ height: 32, width: 32 }}>
            <Image
              className="h-full w-full"
              source={isDarkColorScheme ? images.roundedLogoLight : images.roundedLogoDark}
              resizeMode="cover"
            />
          </View>
        </TouchableOpacity>

        {/* MARK: Budgets */}
        <TouchableOpacity
          onPress={() => {
            router.push('/budgets')
            if (inProgress && step === 6) dispatch(setStep(7))
          }}
          className={cn(
            'trans-200 flex-1 flex-col items-center justify-center gap-0.5 rounded-full py-1',
            inProgress && step === 6 && 'rounded-lg border-2 border-sky-500 bg-sky-500/10'
          )}
        >
          <LucidePieChart
            size={24}
            color={pathname === '/budgets' ? '#8b5cf6' : isDarkColorScheme ? 'white' : 'black'}
          />
        </TouchableOpacity>

        {/* MARK: Account */}
        <TouchableOpacity
          onPress={() => router.push('/account')}
          className={cn(
            'trans-200 flex-1 flex-col items-center justify-center gap-0.5 rounded-full py-1'
          )}
        >
          {user?.authType !== 'google' ? (
            <LucideCircleUserRound
              size={25}
              color={pathname === '/account' ? '#f59e0b' : isDarkColorScheme ? 'white' : 'black'}
            />
          ) : (
            <View
              className="aspect-square overflow-hidden rounded-full"
              style={{ height: 26, width: 26 }}
            >
              <Image
                className="h-full w-full"
                source={{ uri: user?.avatar }}
                resizeMode="cover"
              />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default memo(Navbar)
