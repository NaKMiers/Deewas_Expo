import { currencies, languages } from '@/constants/settings'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import useLanguage from '@/hooks/useLanguage'
import { refresh } from '@/lib/reducers/loadReducer'
import { setSettings } from '@/lib/reducers/settingsReducer'
import { setCurWallet } from '@/lib/reducers/walletReducer'
import { cn } from '@/lib/utils'
import { deleteAllDataApi, updateMySettingsApi } from '@/requests'
import { memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, View } from 'react-native'
import Toast from 'react-native-toast-message'
import ConfirmDialog from './dialogs/ConfirmDialog'
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
    <View className={cn('gap-21/2', className)}>
      <Box
        type="language"
        desc={t('Set your language')}
        list={languages}
        init={languages.find(l => l.value === locale)}
      />
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
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('settingsBox.' + key)
  const tSuccess = (key: string) => translate('success.' + key)
  const tError = (key: string) => translate('error.' + key)
  const { changeLanguage } = useLanguage()

  // states
  const [loading, setLoading] = useState<boolean>(false)
  const [selected, setSelected] = useState<any>(init)
  const [nextSelected, setNextSelected] = useState<any>(null)
  const [openConfirmDialog, setOpenConfirmDialog] = useState<boolean>(false)

  // handle update settings
  const handleUpdateCurrency = useCallback(
    async (value: any) => {
      if (!value) return

      // start loading
      setLoading(true)

      try {
        const { settings } = await updateMySettingsApi({
          currency: value,
        })

        const { message } = await deleteAllDataApi()
        Toast.show({
          type: 'success',
          text1: message,
        })

        Toast.show({
          type: 'success',
          text1: tSuccess('Update currency successfully'),
        })
        Toast.show({
          type: 'success',
          text1: tSuccess('Erase all data successfully'),
        })

        dispatch(refresh())
        dispatch(setCurWallet(null))
        setSelected(nextSelected)
        setNextSelected(null)
        dispatch(setSettings(settings))
      } catch (err: any) {
        Toast.show({
          type: 'error',
          text1: tError('Failed to update your currency'),
        })
        console.log(err)
      } finally {
        // stop loading
        setLoading(false)
      }
    },
    [dispatch, type, nextSelected]
  )

  // handle change option
  const handleChangeOption = useCallback(
    (option: any) => {
      if (loading) return
      if (!option) return
      if (option.value === selected?.value) return

      if (type === 'language') {
        changeLanguage(option.value)
        setSelected(option)
      } else {
        setOpenConfirmDialog(true)
        setNextSelected(option)
      }
    },
    [loading, selected, type]
  )

  return (
    <View
      className={cn(
        'w-full justify-center rounded-lg border border-border bg-secondary p-21',
        className
      )}
    >
      <Text className="text-lg font-bold capitalize">{t(type)}</Text>
      <Text className="mb-3 text-muted-foreground">{desc}</Text>

      <Select
        value={selected?.value}
        defaultValue={init?.value}
        onValueChange={handleChangeOption}
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

      {type === 'currency' && (
        <Text className="mt-2 pl-1 font-medium text-rose-500">
          {t('Changing currency will erase all your data')}.
        </Text>
      )}

      <ConfirmDialog
        open={openConfirmDialog}
        close={open => setOpenConfirmDialog(open)}
        label={t('Change Currency')}
        desc={t('Changing currency will erase all your data, are you sure you still want to change?')}
        confirmLabel={t('Confirm')}
        onConfirm={() => handleUpdateCurrency(nextSelected.value)}
      />
    </View>
  )
}
