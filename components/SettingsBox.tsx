import { currencies, languages } from '@/constants/settings'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { setSettings } from '@/lib/reducers/settingsReducer'
import { cn } from '@/lib/utils'
import { updateMySettingsApi } from '@/requests'
import { router, usePathname } from 'expo-router'
import { memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, View } from 'react-native'
import Toast from 'react-native-toast-message'
import Text from './Text'
import { Select, SelectContent, SelectItem, SelectTrigger } from './ui/select'

interface SettingsBoxProps {
  className?: string
  isRequireInit?: boolean
}

function SettingsBox({ isRequireInit, className }: SettingsBoxProps) {
  // hooks
  const { t: translate, i18n } = useTranslation()
  const t = (key: string) => translate('settingsBox.' + key)
  const locale = i18n.language

  // store
  const { settings } = useAppSelector(state => state.settings)
  const currency = settings?.currency

  return (
    <View className={cn('grid grid-cols-1 gap-21/2 md:grid-cols-2 md:gap-21', className)}>
      {isRequireInit ? (
        currency ? (
          <Box
            type="currency"
            desc={t('Set your currency')}
            list={currencies.sort((a, b) => a.label.localeCompare(b.label))}
            init={currencies.find(c => c.value === currency)}
          />
        ) : null
      ) : (
        <Box
          type="currency"
          desc={t('Set your currency')}
          list={currencies.sort((a, b) => a.label.localeCompare(b.label))}
          init={currencies.find(c => c.value === 'USD')}
        />
      )}
      <Box
        type="language"
        desc={t('Set your language')}
        list={languages}
        init={languages.find(l => l.value === locale)}
      />
    </View>
  )
}

export default memo(SettingsBox)

interface BoxProps {
  type: string
  desc: string
  list: any[]
  init?: any
  className?: string
}

function Box({ type, desc, list, init, className }: BoxProps) {
  // hooks
  const dispatch = useAppDispatch()
  const pathname = usePathname()
  const { t: translate, i18n } = useTranslation()
  const t = (key: string) => translate('settingsBox.' + key)

  // states
  const [open, setOpen] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [selected, setSelected] = useState<any>(init)

  // handle update settings
  const handleUpdateSettings = useCallback(
    async (value: any) => {
      if (!value) return

      // start loading
      setLoading(true)

      try {
        const { settings } = await updateMySettingsApi({
          [type]: value,
        })

        Toast.show({
          type: 'success',
          text1: `Setting ${type} successfully`,
          text2: `You have successfully updated your ${type} setting`,
        })

        dispatch(setSettings(settings))
      } catch (err: any) {
        Toast.show({
          type: 'error',
          text1: `Setting ${type} failed`,
          text2: `Failed to update your ${type} setting`,
        })
        console.log(err)
      } finally {
        // stop loading
        setLoading(false)
      }
    },
    [dispatch, type]
  )

  // handle change language
  const handleChangeLanguage = useCallback(
    (nextLocale: string) => {
      i18n.changeLanguage(nextLocale)
      Toast.show({
        type: 'success',
        text1: 'Language changed to ' + languages.find(l => l.value === nextLocale)?.label,
      })
    },
    [router, pathname]
  )

  return (
    <View
      className={cn(
        'w-full justify-center rounded-lg border border-border bg-secondary p-21',
        className
      )}
    >
      <Text className="font-bold capitalize">{t(type)}</Text>
      <Text className="mb-3 text-sm text-muted-foreground">{desc}</Text>

      <Select
        value={selected?.value}
        defaultValue={init?.value}
        onValueChange={option => {
          if (!option) return

          if (type === 'language') {
            handleChangeLanguage(option.value)
          } else {
            handleUpdateSettings(option.value)
          }
          setSelected(option)
          setOpen(false)
        }}
      >
        <SelectTrigger>
          <Text>{selected ? selected.label : `${t('Select')} ${t(type)}`}</Text>
        </SelectTrigger>

        <SelectContent>
          <ScrollView>
            {list.map((item, index) => (
              <SelectItem
                value={item.value}
                label={item.label}
                key={index}
              />
            ))}
          </ScrollView>
        </SelectContent>
      </Select>
    </View>
  )
}
