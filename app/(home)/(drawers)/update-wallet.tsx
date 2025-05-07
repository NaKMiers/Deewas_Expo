import { images } from '@/assets/images/images'
import CustomInput from '@/components/CustomInput'
import CommonFooter from '@/components/dialogs/CommonFooter'
import DrawerWrapper from '@/components/DrawerWrapper'
import Icon from '@/components/Icon'
import Text from '@/components/Text'
import { Separator } from '@/components/ui/separator'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { refresh } from '@/lib/reducers/loadReducer'
import { setSelectedEmoji, setWalletToEdit } from '@/lib/reducers/screenReducer'
import { updateWalletApi } from '@/requests/walletRequests'
import { router } from 'expo-router'
import { LucideCircleOff } from 'lucide-react-native'
import { useCallback, useEffect, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ImageBackground, TouchableOpacity, View } from 'react-native'
import Toast from 'react-native-toast-message'

function UpdateWalletPage() {
  // hooks
  const { t: translate } = useTranslation()
  const t = useCallback((key: string) => translate('updateWalletPage.' + key), [translate])
  const tSuccess = useCallback((key: string) => translate('success.' + key), [translate])
  const tError = useCallback((key: string) => translate('error.' + key), [translate])
  const dispatch = useAppDispatch()

  // store
  const { walletToEdit: wallet, selectedEmoji } = useAppSelector(state => state.screen)

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
      name: wallet?.name,
      icon: wallet?.icon,
    },
  })

  // states
  const form = watch()
  const [saving, setSaving] = useState<boolean>(false)

  useEffect(() => {
    setValue('icon', selectedEmoji || wallet?.icon)
  }, [setValue, selectedEmoji, wallet])

  // leave page
  useEffect(
    () => () => {
      dispatch(setWalletToEdit(null))
      dispatch(setSelectedEmoji(''))
    },
    [dispatch]
  )

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
        router.back()
        return false
      }

      return isValid
    },
    [setError, checkChanged, t]
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
    <DrawerWrapper>
      <View>
        <Text className="text-center text-xl font-semibold text-primary">{t('Update wallet')}</Text>
        <Text className="text-center tracking-wider text-muted-foreground">
          {t('Wallets are used to group your transactions by source of funds')}
        </Text>
      </View>

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
        <View className="mt-3">
          <Text className="font-semibold">
            Icon <Text className="font-normal">({t('optional')})</Text>
          </Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              router.push('/emoji-picker')
              clearErrors('icon')
            }}
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

      <CommonFooter
        className="mb-21 mt-6 px-0"
        cancelLabel={t('Cancel')}
        acceptLabel={t('Save')}
        onCancel={router.back}
        onAccept={handleSubmit(handleUpdateWallet)}
        loading={saving}
      />

      <Separator className="my-8 h-0" />
    </DrawerWrapper>
  )
}

export default UpdateWalletPage
