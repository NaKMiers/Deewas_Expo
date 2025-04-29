import { images } from '@/assets/images/images'
import CustomInput from '@/components/CustomInput'
import Icon from '@/components/Icon'
import Text from '@/components/Text'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { refresh } from '@/lib/reducers/loadReducer'
import { setSelectedEmoji, setWalletToEdit } from '@/lib/reducers/screenReducer'
import { updateWalletApi } from '@/requests/walletRequests'
import { BlurView } from 'expo-blur'
import { router } from 'expo-router'
import { LucideCircleOff } from 'lucide-react-native'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, ImageBackground, ScrollView, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

function UpdateWalletPage() {
  // hooks
  const { t: translate } = useTranslation()
  const t = useCallback((key: string) => translate('updateWalletPage.' + key), [translate])
  const tSuccess = useCallback((key: string) => translate('success.' + key), [translate])
  const tError = useCallback((key: string) => translate('error.' + key), [translate])
  const dispatch = useAppDispatch()

  // store
  const wallet = useAppSelector(state => state.screen.walletToEdit)
  const selectedEmoji = useAppSelector(state => state.screen.selectedEmoji)

  const defaultValues = useMemo(
    () => ({
      name: wallet?.name,
      icon: wallet?.icon,
    }),
    [wallet]
  )

  // form
  const {
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    clearErrors,
    watch,
  } = useForm<FieldValues>({
    defaultValues,
  })

  // states
  const form = watch()
  const [saving, setSaving] = useState<boolean>(false)

  useEffect(() => {
    setValue('icon', selectedEmoji)
  }, [setValue, selectedEmoji])

  // check change
  const checkChanged = useCallback(
    (newValues: any) => {
      if (!wallet || !newValues) return false

      if (wallet.name !== newValues.name) return true
      if (wallet.icon !== newValues.icon) return true

      return false
    },
    [wallet]
  )

  // validate form
  const validate: SubmitHandler<FieldValues> = useCallback(
    data => {
      let isValid = true

      // name is required
      if (!data.name) {
        setError('name', {
          type: 'manual',
          message: t('Name is required'),
        })
        isValid = false
      }

      if (!checkChanged(data)) {
        dispatch(setWalletToEdit(null))
        router.back()
        return false
      }

      return isValid
    },
    [dispatch, setError, checkChanged, t]
  )

  // update wallet
  const handleUpdateWallet: SubmitHandler<FieldValues> = useCallback(
    async data => {
      // validate form
      if (!wallet) return
      if (!validate(data)) return

      // start loading
      setSaving(true)

      try {
        await updateWalletApi(wallet._id, data)

        Toast.show({
          type: 'success',
          text1: tSuccess('Wallet updated'),
        })

        dispatch(refresh())
        dispatch(setWalletToEdit(null))
        router.back()
      } catch (err: any) {
        Toast.show({
          type: 'error',
          text1: tError('Failed to update wallet'),
        })
        console.log(err)
      } finally {
        // stop loading
        setSaving(false)
      }
    },
    [dispatch, validate, tSuccess, tError, wallet]
  )

  return (
    <SafeAreaView className="flex-1">
      <BlurView
        className="flex-1"
        intensity={80}
        tint="prominent"
      >
        <ScrollView className="flex-1">
          <View className="mx-auto w-full max-w-[500px] flex-1 p-21">
            <View>
              <Text className="text-center text-xl font-semibold text-primary">
                {t('Update wallet')}
              </Text>
              <Text className="text-center tracking-wider text-muted-foreground">
                {t('Wallets are used to group your transactions by source of funds')}
              </Text>
            </View>

            <View className="mt-6 flex flex-col gap-6">
              {/* MARK: Name */}
              <CustomInput
                id="name"
                label={t('Name')}
                value={form.name}
                placeholder="..."
                clearErrors={clearErrors}
                onChange={setValue}
                errors={errors}
                containerClassName="bg-white"
                inputClassName="text-black"
              />

              {/* MARK: Icon */}
              <View className="mt-3">
                <Text className="font-semibold">
                  Icon <Text className="font-normal">({t('optional')})</Text>
                </Text>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => router.push('/emoji-picker')}
                >
                  <ImageBackground
                    source={images.preBgVFlip}
                    className="mt-1.5 flex h-[150px] items-center justify-center overflow-hidden rounded-lg border border-primary p-21"
                  >
                    {form.icon ? (
                      <Text style={{ fontSize: 60 }}>{form.icon}</Text>
                    ) : (
                      <Icon
                        render={LucideCircleOff}
                        size={60}
                        color="#262626"
                        style={{ opacity: 0.7 }}
                      />
                    )}
                  </ImageBackground>
                </TouchableOpacity>

                <Text className="mt-2 text-muted-foreground">
                  {t('This is how your wallet will appear in the app')}
                </Text>
              </View>
            </View>

            {/* MARK: Footer */}
            <View className="mb-21 mt-6 px-0">
              <View className="mt-3 flex flex-row items-center justify-end gap-21/2">
                <View>
                  <Button
                    variant="secondary"
                    className="h-10 rounded-md px-21/2"
                    onPress={() => {
                      dispatch(setSelectedEmoji(''))
                      router.back()
                    }}
                  >
                    <Text className="font-semibold text-primary">{t('Cancel')}</Text>
                  </Button>
                </View>
                <Button
                  variant="default"
                  className="h-10 min-w-[60px] rounded-md px-21/2"
                  onPress={handleSubmit(handleUpdateWallet)}
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

export default UpdateWalletPage
