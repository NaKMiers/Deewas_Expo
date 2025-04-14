import { personalities } from '@/constants'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { setSettings } from '@/lib/reducers/settingsReducer'
import { cn } from '@/lib/utils'
import { updateMySettingsApi } from '@/requests'
import { LucideCheck } from 'lucide-react-native'
import { ReactNode, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Keyboard, TouchableOpacity, View } from 'react-native'
import Toast from 'react-native-toast-message'
import Icon from '../Icon'
import Image from '../Image'
import { useDrawer } from '../providers/DrawerProvider'
import Text from '../Text'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'

interface ChangePersonalitiesDrawerProps {
  refresh?: () => void
  update?: (value: any) => void
  className?: string
}

function ChangePersonalitiesDrawer({ update, refresh, className }: ChangePersonalitiesDrawerProps) {
  // hooks
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('changePersonalitiesDrawer.' + key)
  const tSuccess = (key: string) => translate('success.' + key)
  const tError = (key: string) => translate('error.' + key)
  const { closeDrawer } = useDrawer()
  const dispatch = useAppDispatch()

  const { settings } = useAppSelector(state => state.settings)

  // states
  const [saving, setSaving] = useState<boolean>(false)
  const [selected, setSelected] = useState<any>(null)

  useEffect(() => {
    if (settings?.personalities?.[0]) {
      const selected = personalities.find(p => p.id === settings?.personalities[0])
      setSelected(selected)
    }
  }, [settings])

  // change personalities
  const handleChangePersonalities = useCallback(async () => {
    // start loading
    setSaving(true)

    try {
      // check if at least one personality is selected
      if (!selected) {
        return Toast.show({
          type: 'error',
          text1: tError('Please select a personality'),
        })
      }

      // update settings in API
      const { settings } = await updateMySettingsApi({
        personalities: [selected.id],
      })

      // update settings in store
      dispatch(setSettings(settings))

      if (refresh) refresh()
      if (update) update(selected)

      Toast.show({
        type: 'success',
        text1: tSuccess('Personalities changed'),
      })

      closeDrawer()
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: tError('Failed to change personalities'),
      })

      console.log(err)
    } finally {
      // stop loading
      setSaving(false)
    }
  }, [dispatch, refresh, update, selected, closeDrawer])

  return (
    <View className={cn('mx-auto mt-21 w-full max-w-sm', className)}>
      <View>
        <Text className='text-center text-xl font-semibold text-primary'>
          {t('Pick a personality for Deewas assistant?')}
        </Text>
        {/* <Text className="text-center text-muted-foreground">
          {t("Select multiple if you'd like to mix styles")}
        </Text> */}
      </View>

      <View className='mb-21 mt-21 flex w-full flex-row flex-wrap gap-y-2 px-21/2'>
        {personalities.map((item, index) => (
          <View className='w-1/2 flex-row px-1' key={index}>
            <TouchableOpacity
              activeOpacity={0.7}
              className={cn(
                'relative flex w-full rounded-lg border-2 border-transparent bg-secondary p-2',
                selected?.id === item.id && 'border-primary'
              )}
              onPress={() => setSelected(selected?.id !== item.id ? item : selected)}
              key={index}
            >
              {selected?.id === item.id && (
                <Icon
                  className='absolute right-21/2 top-21/2'
                  render={LucideCheck}
                  size={20}
                  color='#22c55e'
                />
              )}

              <View className='h-[80px] p-21/2'>
                <Image source={item.image} className='h-full w-full' resizeMode='contain' />
              </View>

              <Text className='text-center font-semibold'>{t(item.title)}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* MARK: Footer */}
      <View className='mb-21 px-0'>
        <View className='mt-3 flex flex-row items-center justify-end gap-21/2'>
          <View>
            <Button
              variant='default'
              className='h-10 rounded-md px-21/2'
              onPress={() => {
                closeDrawer()
              }}
            >
              <Text className='font-semibold text-secondary'>{t('Cancel')}</Text>
            </Button>
          </View>
          <Button
            variant='secondary'
            className='h-10 min-w-[60px] rounded-md px-21/2'
            onPress={handleChangePersonalities}
          >
            {saving ? <ActivityIndicator /> : <Text className='font-semibold'>{t('Save')}</Text>}
          </Button>
        </View>
      </View>

      <Separator className='my-8 h-0' />
    </View>
  )
}

interface NodeProps extends ChangePersonalitiesDrawerProps {
  disabled?: boolean
  trigger?: ReactNode
  open?: boolean
  onClose?: () => void
  reach?: number
  className?: string
}

function Node({ open, onClose, reach, disabled, trigger, className, ...props }: NodeProps) {
  const { openDrawer, open: openState, reach: defaultReach } = useDrawer()
  const r = reach || defaultReach

  useEffect(() => {
    if (open === true) {
      Keyboard.dismiss()
      openDrawer(<ChangePersonalitiesDrawer {...props} />, r)
    }
  }, [open])

  useEffect(() => {
    if (onClose && openState) onClose()
  }, [openState, onClose])

  return (
    trigger && (
      <TouchableOpacity
        activeOpacity={0.7}
        className={cn(className, disabled && 'opacity-50')}
        disabled={disabled}
        onPress={() => {
          Keyboard.dismiss()
          openDrawer(<ChangePersonalitiesDrawer {...props} />, r)
        }}
      >
        {trigger}
      </TouchableOpacity>
    )
  )
}

export default Node
