import { images } from '@/assets/images/images'
import { shortName } from '@/lib/string'
import { cn } from '@/lib/utils'
import { router } from 'expo-router'
import { LucideBell, LucideCalendarDays } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { ImageBackground, SafeAreaView, TouchableOpacity, View } from 'react-native'
import Icon from './Icon'
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
  const { user } = useAuth()

  return (
    <SafeAreaView className={cn(className)}>
      <View className="flex w-full flex-row items-center justify-between gap-2 bg-primary px-21/2 py-2 md:px-21">
        <View className="flex flex-1 flex-row items-center gap-2 md:gap-4">
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
            <Text className="line-clamp-1 text-ellipsis text-nowrap text-lg font-semibold tracking-wide text-secondary">
              {t('Hi')} {user ? shortName(user) : 'there'}!👋
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex flex-row items-center gap-2">
          <ImageBackground
            source={images.preBg}
            className="overflow-hidden rounded-md"
          >
            <TouchableOpacity
              className="flex h-10 flex-row items-center px-4"
              activeOpacity={0.9}
              onPress={() => router.push('/premium')}
            >
              <Text className="font-semibold text-neutral-800"> {t('Upgrade')}</Text>
            </TouchableOpacity>
          </ImageBackground>
          <Button
            variant="secondary"
            size="icon"
          >
            <Icon
              render={LucideBell}
              size={18}
            />
          </Button>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default Header
