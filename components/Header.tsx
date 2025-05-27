import icons from '@/assets/icons/icons'
import { images } from '@/assets/images/images'
import { useAppSelector } from '@/hooks/reduxHook'
import { shortName } from '@/lib/string'
import { cn } from '@/lib/utils'
import { router } from 'expo-router'
import { LucideCalendarDays } from 'lucide-react-native'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { ImageBackground, SafeAreaView, TouchableOpacity, View } from 'react-native'
import Icon from './Icon'
import Image from './Image'
import { useAuth } from './providers/AuthProvider'
import Text from './Text'
import { Button } from './ui/button'

interface HeaderProps {
  className?: string
}

function Header({ className }: HeaderProps) {
  // hooks
  let { t: translate } = useTranslation()
  const t = (key: string) => translate('header.' + key)
  const { user, isPremium } = useAuth()

  // store
  const { inProgress } = useAppSelector(state => state.tutorial)

  return (
    <SafeAreaView className={cn('relative', className)}>
      {inProgress && <View className="absolute left-0 top-0 z-10 h-full w-full" />}
      <View className="w-full flex-row items-center justify-between gap-2 bg-primary px-21/2 py-2 md:px-21">
        <View className="flex-1 flex-row items-center gap-2 md:gap-4">
          <Button
            variant="secondary"
            size="icon"
            onPress={() => router.push('/calendar')}
          >
            <Icon
              render={LucideCalendarDays}
              size={22}
            />
          </Button>
          <TouchableOpacity
            className="flex-1"
            onPress={() => router.push('/home')}
          >
            <Text className="text-nowrap line-clamp-1 text-ellipsis text-lg font-semibold tracking-tight text-secondary">
              {t('Hi')} {user ? shortName(user, 'User') : 'there'}! 👋
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center gap-2">
          {!isPremium && (
            <View className="shadow-md">
              <ImageBackground
                source={images.preBg}
                className="overflow-hidden rounded-md"
              >
                <TouchableOpacity
                  className="h-10 flex-row items-center px-4"
                  activeOpacity={0.9}
                  onPress={() => router.push('/premium')}
                >
                  <Text className="font-semibold text-neutral-800"> {t('Upgrade')}</Text>
                </TouchableOpacity>
              </ImageBackground>
            </View>
          )}
          <Button
            variant="secondary"
            size="icon"
            onPress={() => router.push('/streaks')}
          >
            <Image
              source={icons.flame}
              className="h-full w-full"
            />
          </Button>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default memo(Header)
