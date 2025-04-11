import { images } from '@/assets/images/images'
import { Image, ScrollView, TouchableOpacity, View } from 'react-native'
import Text from '../Text'
import { Separator } from '../ui/separator'

export default function Slide2({ onChange }: { onChange: (value: any) => void }) {
  return (
    <View className="mx-auto flex w-full max-w-[500px] flex-1 items-center justify-center">
      <View
        className="w-full overflow-hidden rounded-lg shadow-lg"
        style={{ height: 150 }}
      >
        <Image
          source={images.onboarding2}
          resizeMode="cover"
          className="h-full w-full"
        />
      </View>
      <Text className="mt-21 text-center text-3xl font-bold text-primary">
        How do you feel about your finances?
      </Text>

      <ScrollView className="w-full">
        <View className="mt-8 flex w-full flex-col gap-2 px-21/2">
          {[
            'It’s pretty complicated 😶‍🌫️',
            'I’m a bit stressed 😓',
            'Not sure yet 🤔',
            'I want to improve 😉',
            'I feel confident 😊',
          ].map((item, index) => (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                onChange({ question: 'How do you feel about your finances?', answer: item })
              }
              className="flex flex-row items-center justify-start rounded-lg bg-secondary px-21"
              style={{ height: 56 }}
              key={index}
            >
              <Text className="text-lg">{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Separator className="my-4 h-0" />
      </ScrollView>
    </View>
  )
}
