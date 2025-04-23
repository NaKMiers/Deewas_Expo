import { cn } from '@/lib/utils'
import { LucideCheck } from 'lucide-react-native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, TouchableOpacity, View } from 'react-native'
import Icon from '../Icon'
import Text from '../Text'
import { Separator } from '../ui/separator'

function Slide3({ onChange }: { onChange: (value: any) => void }) {
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('onboardingPage.' + key)
  const [selected, setSelected] = useState<string[]>([])

  return (
    <View className="mx-auto flex w-full max-w-[500px] flex-1 items-center justify-center">
      <Text className="mt-21 text-center text-3xl font-bold text-primary">
        {t('Who do you spend money on')} 🤔?
      </Text>

      <ScrollView className="w-full">
        <View className="mt-8 flex w-full flex-col gap-2 px-21/2">
          {[
            t('Myself'),
            t('My partner'),
            t('Other family members'),
            t('My friends'),
            t('My kids'),
            t('My pets'),
          ].map((item, index) => (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                setSelected(prev =>
                  prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
                )
              }
              className={cn(
                'flex flex-row items-center justify-between rounded-lg bg-secondary px-21',
                selected.includes(item) && 'bg-primary'
              )}
              style={{ height: 56 }}
              key={index}
            >
              <Text className={cn('text-lg', selected.includes(item) && 'text-secondary')}>{item}</Text>

              {selected.includes(item) && (
                <Icon
                  render={LucideCheck}
                  size={18}
                  color="#22c55e"
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Separator className="my-4 h-0" />
      </ScrollView>

      <View className="w-full px-21/2 md:px-21">
        <TouchableOpacity
          onPress={() => onChange({ question: 'Who do you spend money on?', answer: selected })}
          className={cn(
            'mb-21 mt-21 flex h-14 flex-shrink-0 flex-row items-center justify-center rounded-full bg-primary px-8',
            selected.length === 0 && 'opacity-50'
          )}
          disabled={selected.length === 0}
        >
          <Text className="text-lg font-semibold text-secondary">{t('Continue')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default Slide3
