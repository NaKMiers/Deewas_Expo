import { images } from '@/assets/images/images'
import CustomInput from '@/components/CustomInput'
import CommonFooter from '@/components/dialogs/CommonFooter'
import CommonHeader from '@/components/dialogs/CommonHeader'
import DrawerWrapper from '@/components/DrawerWrapper'
import Icon from '@/components/Icon'
import { useAuth } from '@/components/providers/AuthProvider'
import Text from '@/components/Text'
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
import { ImageBackground, TouchableOpacity, View } from 'react-native'
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
        <CommonHeader
          title={t('Create wallet')}
          desc={t('Wallets are used to group your transactions by source of funds')}
        />

        <View className="mt-6 flex-col gap-6">
          {/* MARK: Name */}
          <CustomInput
            id="name"
            label={t('Name')}
            value={form.name}
            placeholder="..."
            onChange={setValue}
            onFocus={() => clearErrors('name')}
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
                className="mt-1.5 h-[150px] items-center justify-center overflow-hidden rounded-lg border border-primary p-21"
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
        <CommonFooter
          className="mb-21 mt-6 px-0"
          cancelLabel={t('Cancel')}
          acceptLabel={t('Save')}
          onCancel={router.back}
          onAccept={handleSubmit(handleCreateWallet)}
          loading={saving}
        />

        <Separator className="my-8 h-0" />
      </View>
    </DrawerWrapper>
  )
}

export default CreateWalletPage
