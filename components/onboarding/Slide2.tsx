import { images } from '@/assets/images/images'
import { useTranslation } from 'react-i18next'
import { ScrollView, TouchableOpacity, View } from 'react-native'
import Image from '../Image'
import Text from '../Text'
import { Separator } from '../ui/separator'
import { memo } from 'react'

function Slide2({ onChange }: { onChange: (value: any) => void }) {
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('onboardingPage.' + key)

  return (
    <View className="mx-auto w-full max-w-[500px] flex-1 items-center justify-center">
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
        {t('How do you feel about your finances?')}
      </Text>

      <ScrollView className="w-full">
        <View className="mt-8 w-full flex-col gap-2 px-21/2">
          {[
            `${t("It's pretty complicated")} 😶‍🌫️`,
            `${t("I'm a bit stressed")} 😓`,
            `${t('Not sure yet')} 🤔`,
            `${t('I want to improve')} 😉`,
            `${t('I feel confident')} 😊`,
          ].map((item, index) => (
            <TouchableOpacity
              onPress={() =>
                onChange({ question: 'How do you feel about your finances?', answer: item })
              }
              className="flex-row items-center justify-start rounded-lg bg-secondary px-21"
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

export default memo(Slide2)
