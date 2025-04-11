import { images } from '@/assets/images/images'
import { cn } from '@/lib/utils'
import { router } from 'expo-router'
import { LucideArrowRight } from 'lucide-react-native'
import { Image, TouchableOpacity, View } from 'react-native'
import Icon from '../Icon'
import Text from '../Text'

export default function Slide6({ onPress }: { onPress: () => void }) {
  return (
    <View className="mx-auto flex w-full max-w-[500px] flex-1 items-center justify-center">
      <View
        className="w-full overflow-hidden rounded-lg shadow-lg"
        style={{ height: 200 }}
      >
        <Image
          source={images.onboardingWelcome}
          resizeMode="cover"
          className="h-full w-full"
        />
      </View>
      <Text className="mt-21 text-center text-3xl font-bold text-primary">Welcome to the family!</Text>
      <Text className="text-center text-base font-semibold text-muted-foreground">
        We're excited to have you here. Let's get started on your financial journey together! 🚀
      </Text>

      <View className="w-full flex-1">
        <TouchableOpacity
          className={cn(
            'mb-21 mt-21 flex h-14 flex-shrink-0 flex-row items-center justify-center gap-2 rounded-full bg-primary px-8'
          )}
          onPress={() => {
            onPress()
            router.push('/auth/register')
          }}
        >
          <Text className="text-lg font-semibold text-secondary">Get started now</Text>
          <View className="rounded-full bg-secondary p-1">
            <Icon
              render={LucideArrowRight}
              size={18}
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  )
}
