import { ScrollView, TouchableOpacity, View } from 'react-native'
import Text from '../Text'
import { Separator } from '../ui/separator'

export default function Slide1({ onChange }: { onChange: (value: any) => void }) {
  return (
    <View className="flex flex-1 items-center justify-center">
      <Text className="text-center text-3xl font-bold text-primary">
        How did would you here about us?
      </Text>

      <ScrollView className="w-full">
        <View className="mx-auto mt-8 flex w-full max-w-[500px] flex-col gap-2 px-21/2">
          {[
            'Youtube',
            'TikTok',
            'App Store',
            'Online Search',
            'Friend, Family, or Colleague',
            'Influencer',
            'News Article',
            'Podcast',
          ].map((item, index) => (
            <TouchableOpacity
              activeOpacity={0.7}
              className="flex flex-row items-center justify-start rounded-lg bg-secondary px-21"
              onPress={() => onChange({ question: 'How did you hear about us?', answer: item })}
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
