import { shortName } from '@/lib/string'
import { cn } from '@/lib/utils'
import { router } from 'expo-router'
import { LucideBell, LucideCalendarDays } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable, SafeAreaView, TouchableOpacity, View } from 'react-native'
import Icon from './Icon'
import { useAuth } from './providers/AuthProvider'
import Text from './Text'
import { Button } from './ui/button'

interface HeaderProps {
  navigation?: any
  className?: string
}

function Header({ navigation, className }: HeaderProps) {
  // hooks
  let { t: translate } = useTranslation()
  const t = (key: string) => translate('header.' + key)
  const { user } = useAuth()

  return (
    <SafeAreaView className={cn(className)}>
      <View className='flex w-full flex-row items-center justify-between gap-2 bg-primary px-21/2 py-2 md:px-21'>
        <View className='flex flex-row items-center gap-2 md:gap-4'>
          <Button
            variant='secondary'
            size='icon'
            // onPress={() => router.push('/calendar')}
          >
            <Icon render={LucideCalendarDays} size={22} />
          </Button>
          <Pressable onPress={() => navigation.navigate('home')}>
            <Text className='text-nowrap text-lg font-semibold tracking-wide text-secondary'>
              {t('Hello')} {user ? shortName(user) : 'there'}!👋
            </Text>
          </Pressable>
        </View>

        <View className='flex flex-row items-center gap-2'>
          <TouchableOpacity
            className='flex h-10 flex-row items-center rounded-md bg-secondary px-4'
            activeOpacity={0.9}
          >
            <Text className='font-semibold'> {t('Upgrade')}</Text>
          </TouchableOpacity>
          <Button variant='secondary' size='icon'>
            <Icon render={LucideBell} size={18} />
          </Button>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default Header
