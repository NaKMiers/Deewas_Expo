import Icon from '@/components/Icon'
import Image from '@/components/Image'
import Text from '@/components/Text'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { personalities } from '@/constants'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { setSettings } from '@/lib/reducers/settingsReducer'
import { cn } from '@/lib/utils'
import { updateMySettingsApi } from '@/requests'
import { BlurView } from 'expo-blur'
import { router } from 'expo-router'
import { LucideCheck } from 'lucide-react-native'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, TouchableOpacity, View } from 'react-native'
import Toast from 'react-native-toast-message'

function ChangePersonalityPage() {
  // hooks
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('changePersonalityPage.' + key)
  const tSuccess = useCallback((key: string) => translate('success.' + key), [translate])
  const tError = useCallback((key: string) => translate('error.' + key), [translate])
  const dispatch = useAppDispatch()

  const { settings } = useAppSelector(state => state.settings)

  // states
  const [saving, setSaving] = useState<boolean>(false)
  const [selected, setSelected] = useState<any>(null)

  // initially set selected personality
  useEffect(() => {
    if ((settings?.personalities?.[0] ?? -1) >= 0) {
      const selected = personalities.find(p => p.id === settings?.personalities[0])
      setSelected(selected)
    }
  }, [settings])

  // validate
  const validate = useCallback(() => {
    let isValid = true

    if (!settings) return false
    if (!selected) {
      Alert.alert(tError('Please select a personality'))
      return false
    }
    if (settings?.personalities[0] === selected.id) {
      return false
    }

    return isValid
  }, [tError, selected, settings])

  // change personalities
  const handleChangePersonalities = useCallback(async () => {
    // validate
    if (!validate()) return

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

      Toast.show({
        type: 'success',
        text1: tSuccess('Personalities changed'),
      })

      // update settings in store
      dispatch(setSettings(settings))
      router.back()
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
  }, [dispatch, tError, tSuccess, validate, selected])

  return (
    <SafeAreaView className="flex-1">
      <BlurView
        className="flex-1"
        intensity={80}
      >
        <ScrollView className="flex-1">
          <View className="mx-auto w-full max-w-[500px] flex-1 p-21">
            <Text className="text-center text-xl font-semibold text-primary">
              {t('Pick a personality for Deewas assistant?')}
            </Text>

            <View className="mb-21 mt-21 flex w-full flex-row flex-wrap gap-y-2 px-21/2">
              {personalities.map((item, index) => (
                <View
                  className="w-1/2 flex-row px-1"
                  key={index}
                >
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
                        className="absolute right-21/2 top-21/2"
                        render={LucideCheck}
                        size={20}
                        color="#22c55e"
                      />
                    )}

                    <View className="h-[80px] p-21/2">
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

            {/* MARK: Footer */}
            <View className="mb-21 px-0">
              <View className="mt-3 flex flex-row items-center justify-end gap-21/2">
                <View>
                  <Button
                    variant="secondary"
                    className="h-10 rounded-md px-21/2"
                    onPress={() => router.back()}
                  >
                    <Text className="font-semibold text-primary">{t('Cancel')}</Text>
                  </Button>
                </View>
                <Button
                  variant="default"
                  className="h-10 min-w-[60px] rounded-md px-21/2"
                  onPress={handleChangePersonalities}
                >
                  {saving ? (
                    <ActivityIndicator />
                  ) : (
                    <Text className="font-semibold text-secondary">{t('Save')}</Text>
                  )}
                </Button>
              </View>
            </View>

            <Separator className="my-8 h-0" />
          </View>
        </ScrollView>
      </BlurView>
    </SafeAreaView>
  )
}

export default ChangePersonalityPage
