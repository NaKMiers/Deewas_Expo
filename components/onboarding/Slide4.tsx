import { currencies, CurrencyType, defaultCurrency } from '@/constants/settings'
import { cn } from '@/lib/utils'
import { LucideCheck } from 'lucide-react-native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, TouchableOpacity, View } from 'react-native'
import Icon from '../Icon'
import Text from '../Text'
import { Input } from '../ui/input'

export default function Slide4({ onChange }: { onChange: (value: any) => void }) {
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('onboardingPage.' + key)
  const [open, setOpen] = useState<boolean>(false)
  const [selected, setSelected] = useState<CurrencyType>(defaultCurrency)
  const [search, setSearch] = useState<string>('')

  return (
    <View className='mx-auto flex w-full max-w-[500px] flex-1 items-center justify-center'>
      <Text className='mt-21 text-center text-3xl font-bold text-primary'>
        💸 {t('Which currency do you usually use?')}
      </Text>

      <View className='mt-6 w-full flex-1'>
        <View>
          <TouchableOpacity
            activeOpacity={0.7}
            className='flex h-12 w-full flex-row items-center gap-2 rounded-lg bg-primary px-3 font-semibold'
            onPress={() => setOpen(!open)}
          >
            <Text className='font-semibold capitalize text-secondary'>{selected.label}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView>
          <View className='mt-21/2 flex flex-col gap-0.5 overflow-hidden rounded-lg'>
            <View className='overflow-hidden rounded-lg border border-border'>
              <Input
                value={search}
                placeholder='Find a currency...'
                onChangeText={value => setSearch(value)}
                className='w-full border-transparent'
              />
            </View>
            {currencies
              .filter(c => {
                const key = c.label + c.value + c.symbol + c.locale
                return key.toLowerCase().includes(search.toLowerCase())
              })
              .map(currency => (
                <TouchableOpacity
                  className={cn(
                    'flex flex-row items-center justify-between rounded-lg bg-secondary px-21/2 py-2.5'
                  )}
                  key={currency.value}
                  onPress={() => setSelected(currency)}
                >
                  <Text className={cn('text-lg')}>{currency.label}</Text>

                  {selected.value === currency.value && (
                    <Icon render={LucideCheck} size={18} color='#22c55e' />
                  )}
                </TouchableOpacity>
              ))}
          </View>
        </ScrollView>
      </View>

      <View className='w-full px-21/2 md:px-21'>
        <TouchableOpacity
          className={cn(
            'mb-21 mt-21 flex h-14 flex-shrink-0 flex-row items-center justify-center rounded-full bg-primary px-8',
            !selected.value && 'opacity-50'
          )}
          onPress={() => onChange(selected.value)}
          disabled={!selected.value}
        >
          <Text className='text-lg font-semibold text-secondary'>{t('Continue')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
