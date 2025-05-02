import { images } from '@/assets/images/images'
import CustomInput from '@/components/CustomInput'
import DrawerWrapper from '@/components/DrawerWrapper'
import Icon from '@/components/Icon'
import { useAuth } from '@/components/providers/AuthProvider'
import Text from '@/components/Text'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { refresh } from '@/lib/reducers/loadReducer'
import { setSelectedEmoji } from '@/lib/reducers/screenReducer'
import { createWalletApi } from '@/requests/walletRequests'
import { router } from 'expo-router'
import { LucideCircleOff } from 'lucide-react-native'
import { useCallback, useEffect, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, ImageBackground, TouchableOpacity, View } from 'react-native'
import Toast from 'react-native-toast-message'

function CreateWalletPage() {
  // hooks
  const { isPremium } = useAuth()
  const { t: translate } = useTranslation()
  const t = useCallback((key: string) => translate('createWalletPage.' + key), [translate])
  const tSuccess = useCallback((key: string) => translate('success.' + key), [translate])
  const tError = useCallback((key: string) => translate('error.' + key), [translate])
  const dispatch = useAppDispatch()

  // store
  const { wallets } = useAppSelector(state => state.wallet)
  const { selectedEmoji } = useAppSelector(state => state.screen)

  // form
  const {
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    clearErrors,
    watch,
  } = useForm<FieldValues>({
    defaultValues: {
      name: '',
      icon: '',
    },
  })

  // states
  const form = watch()
  const [saving, setSaving] = useState<boolean>(false)

  useEffect(() => {
    setValue('icon', selectedEmoji)
  }, [setValue, selectedEmoji])

  // leave page
  useEffect(
    () => () => {
      dispatch(setSelectedEmoji(''))
    },
    [dispatch]
  )

  // validate form
  const validate: SubmitHandler<FieldValues> = useCallback(
    data => {
      let isValid = true

      // name is required
      if (!data.name.trim()) {
        setError('name', { message: t('Name is required') })
        isValid = false
      }

      // show paywall if not premium
      if (!isPremium && wallets.length >= 2 && isValid) {
        router.push('/premium')
        return false
      }

      return isValid
    },
    [setError, t, isPremium, wallets]
  )

  // create wallet
  const handleCreateWallet: SubmitHandler<FieldValues> = useCallback(
    async data => {
      // validate form
      if (!validate(data)) return

      // start loading
      setSaving(true)

      try {
        await createWalletApi(data)

        Toast.show({
          type: 'success',
          text1: tSuccess('Wallet created'),
        })

        dispatch(refresh())
        router.back()
      } catch (err: any) {
        Toast.show({
          type: 'error',
          text1: tError('Failed to create wallet'),
        })
        console.log(err)
      } finally {
        // stop loading
        setSaving(false)
      }
    },
    [dispatch, validate, tError, tSuccess]
  )

  return (
    <DrawerWrapper>
      <View>
        <View>
          <Text className="text-center text-xl font-semibold text-primary">{t('Create wallet')}</Text>
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
          <View>
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
                onPress={router.back}
              >
                <Text className="font-semibold text-primary">{t('Cancel')}</Text>
              </Button>
            </View>
            <Button
              variant="default"
              className="h-10 min-w-[60px] rounded-md px-21/2"
              onPress={handleSubmit(handleCreateWallet)}
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
    </DrawerWrapper>
  )
}

export default CreateWalletPage
