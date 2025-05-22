import { personalities } from '@/constants'
import { cn } from '@/lib/utils'
import { LucideCheck } from 'lucide-react-native'
import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, TouchableOpacity, View } from 'react-native'
import Icon from '../Icon'
import Image from '../Image'
import Text from '../Text'
import { Separator } from '../ui/separator'

function Slide5({ onChange }: { onChange: (value: any) => void }) {
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('onboardingPage.' + key)
  const [selected, setSelected] = useState<any>(personalities[0])

  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-center text-3xl font-bold text-primary">
        {t('Pick a personality for Deewas assistant?')}
      </Text>
      {/* <Text className="mt-1 text-center font-medium text-primary">
        {t("Select multiple if you'd like to mix styles")}.
      </Text> */}

      <ScrollView className="mt-21 w-full flex-1">
        <View className="mx-auto mt-8 w-full max-w-[500px] flex-row flex-wrap gap-y-2 px-21/2">
          {personalities.map((item, index) => (
            <View
              className="w-1/2 flex-row px-1"
              key={index}
            >
              <TouchableOpacity
                className={cn(
                  'relative w-full rounded-lg border-2 border-transparent bg-secondary p-2',
                  selected?.id === item.id && 'border-primary'
                )}
                onPress={() => setSelected(selected?.id !== item.id ? item : selected)}
              >
                {selected?.id === item.id && (
                  <View className="absolute right-2 top-2 z-10">
                    <Icon
                      render={LucideCheck}
                      size={20}
                      color="#22c55e"
                    />
                  </View>
                )}

                <View className="h-[100px] p-21/2">
                  <Image
                    source={item.image}
                    className="h-full w-full"
                    resizeMode="contain"
                  />
                </View>

                <Text className="text-center font-semibold">{t(item.title)}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <Separator className="my-4 h-0" />
      </ScrollView>

      <View className="w-full px-21/2 md:px-21">
        <TouchableOpacity
          className={cn(
            'mb-21 mt-21 h-14 flex-shrink-0 flex-row items-center justify-center rounded-full bg-primary px-8',
            !selected && 'opacity-50'
          )}
          onPress={() => selected && onChange([selected.id])}
          disabled={!selected}
        >
          <Text className="text-lg font-semibold text-secondary">{t('Continue')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default memo(Slide5)
