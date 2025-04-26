import { useTranslation } from 'react-i18next'
import { ScrollView, TouchableOpacity, View } from 'react-native'
import Text from '../Text'
import { Separator } from '../ui/separator'

function Slide1({ onChange }: { onChange: (value: any) => void }) {
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('onboardingPage.' + key)

  return (
    <View className="flex flex-1 items-center justify-center">
      <Text className="text-center text-3xl font-bold text-primary">
        {t('How did would you here about us?')}
      </Text>

      <ScrollView className="w-full">
        <View className="mx-auto mt-8 flex w-full max-w-[500px] flex-col gap-2 px-21/2">
          {[
            'Youtube',
            'TikTok',
            'App Store',
            t('Online Search'),
            t('Friend, Family, or Colleague'),
            t('Influencer'),
            t('News Article'),
            'Podcast',
          ].map((item, index) => (
            <TouchableOpacity
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

export default Slide1
