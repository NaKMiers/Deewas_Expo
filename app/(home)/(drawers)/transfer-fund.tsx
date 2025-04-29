import CustomInput from '@/components/CustomInput'
import DateTimePicker from '@/components/DateTimePicker'
import WalletPicker from '@/components/dialogs/WalletPicker'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Text } from '@/components/ui/text'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { refresh, setRefreshing } from '@/lib/reducers/loadReducer'
import { setInitFromWallet, setInitToWallet } from '@/lib/reducers/screenReducer'
import { formatSymbol } from '@/lib/string'
import { toUTC } from '@/lib/time'
import { cn } from '@/lib/utils'
import { transferFundApi } from '@/requests/walletRequests'
import { BlurView } from 'expo-blur'
import { router } from 'expo-router'
import moment from 'moment'
import { useCallback, useMemo, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Platform, ScrollView, TouchableWithoutFeedback, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

function TransferFundPage() {
  // hooks
  const { t: translate } = useTranslation()
  const t = useCallback((key: string) => translate('transferFundPage.' + key), [translate])
  const tSuccess = useCallback((key: string) => translate('success.' + key), [translate])
  const tError = useCallback((key: string) => translate('error.' + key), [translate])
  const dispatch = useAppDispatch()

  // store
  const currency = useAppSelector(state => state.settings.settings?.currency)
  const { wallets } = useAppSelector(state => state.wallet)
  const { initFromWallet, initToWallet } = useAppSelector(state => state.screen)

  const defaultValues = useMemo(
    () => ({
      fromWalletId: initFromWallet?._id || '',
      toWalletId: initToWallet?._id || '',
      amount: '',
      date: moment().format('YYYY-MM-DD'),
    }),
    [initFromWallet, initToWallet]
  )

  // form
  const {
    handleSubmit,
    setError,
    setValue,
    watch,
    clearErrors,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues,
  })
  const form = watch()

  // states
  const [saving, setSaving] = useState<boolean>(false)
  const [openDate, setOpenDate] = useState<boolean>(false)

  // validate form
  const validate: SubmitHandler<FieldValues> = useCallback(
    data => {
      let isValid = true

      // source wallet is required
      if (!data.fromWalletId) {
        setError('fromWalletId', {
          type: 'manual',
          message: t('Source wallet is required'),
        })
        isValid = false
      }

      // destination wallet is required
      if (!data.toWalletId) {
        setError('toWalletId', {
          type: 'manual',
          message: t('Destination wallet is required'),
        })
        isValid = false
      }

      // source wallet and destination wallet must be different
      if (data.fromWalletId === data.toWalletId) {
        setError('toWalletId', {
          type: 'manual',
          message: t('Source wallet and destination wallet must be different'),
        })
        isValid = false
      }

      // amount is required
      if (!data.amount) {
        setError('amount', {
          type: 'manual',
          message: t('Amount is required'),
        })
        isValid = false
      }

      // date must be selected
      if (!data.date) {
        setError('date', {
          type: 'manual',
          message: t('Date is required'),
        })
        isValid = false
      }

      return isValid
    },
    [setError, t]
  )

  // transfer fund
  const handleTransferFund: SubmitHandler<FieldValues> = useCallback(
    async data => {
      // validate form
      if (!validate(data)) return

      // start loading
      setSaving(true)

      try {
        await transferFundApi({
          ...data,
          date: toUTC(data.date),
          amount: data.amount,
        })

        Toast.show({
          type: 'success',
          text1: tSuccess('Transferred fund'),
        })

        dispatch(refresh())
        dispatch(setInitFromWallet(null))
        dispatch(setInitToWallet(null))
        router.back()
      } catch (err: any) {
        Toast.show({
          type: 'error',
          text1: tError('Failed to transfer'),
        })

        console.log(err)
      } finally {
        // stop loading
        setSaving(false)
        dispatch(setRefreshing(false))
      }
    },
    [dispatch, validate, tError, tSuccess]
  )

  return (
    <SafeAreaView className="flex-1">
      <BlurView
        className="flex-1"
        tint="prominent"
        intensity={90}
      >
        <ScrollView className="flex-1">
          <View className="mx-auto w-full max-w-[500px] flex-1 p-21">
            <View className="mx-auto w-full max-w-sm px-21/2">
              <View>
                <Text className="text-center text-xl font-semibold text-primary">
                  {t('Transfer Fund')}
                </Text>
                <Text className="text-center tracking-wider text-muted-foreground">
                  {t('Transfer money between wallets')}
                </Text>
              </View>

              <View className="mt-6 flex flex-col gap-6">
                {/* MARK: From Wallet */}
                <View>
                  <Text
                    className={cn('mb-1 font-semibold', errors.fromWalletId?.message && 'text-rose-500')}
                  >
                    {t('From Wallet')}
                  </Text>
                  <WalletPicker
                    className={cn(
                      'w-full justify-normal',
                      errors.fromWalletId?.message && 'border-rose-500'
                    )}
                    onChange={(wallet: IWallet | null) => wallet && setValue('fromWalletId', wallet._id)}
                    wallet={wallets.find(w => w._id === form.fromWalletId) || initToWallet}
                  />
                  {errors.fromWalletId?.message && (
                    <Text className="ml-1 mt-0.5 block italic text-rose-400">
                      {errors.fromWalletId?.message?.toString()}
                    </Text>
                  )}
                </View>

                {/* MARK: To Wallet */}
                <View className="">
                  <Text
                    className={cn('mb-1 font-semibold', errors.toWalletId?.message && 'text-rose-500')}
                  >
                    {t('To Wallet')}
                  </Text>
                  <View>
                    <WalletPicker
                      className={cn(
                        'w-full justify-normal',
                        errors.toWalletId?.message && 'border-rose-500'
                      )}
                      onChange={(wallet: IWallet | null) => {
                        if (wallet) setValue('toWalletId', wallet._id)
                        clearErrors('toWalletId')
                      }}
                      wallet={wallets.find(w => w._id === form.toWalletId)}
                    />
                  </View>
                  {errors.toWalletId?.message && (
                    <Text className="ml-1 mt-0.5 block italic text-rose-400">
                      {errors.toWalletId?.message?.toString()}
                    </Text>
                  )}
                </View>

                {/* MARK: Amount */}
                {currency && (
                  <CustomInput
                    id="amount"
                    type="number"
                    value={form.amount}
                    label={t('Amount')}
                    placeholder="..."
                    clearErrors={clearErrors}
                    onChange={setValue}
                    icon={
                      <Text className="text-lg font-semibold text-black">{formatSymbol(currency)}</Text>
                    }
                    errors={errors}
                    containerClassName="bg-white"
                    inputClassName="text-black"
                  />
                )}

                {/* MARK: Date */}
                {Platform.OS === 'ios' ? (
                  <View className={cn('flex flex-1 flex-col', openDate ? '-mt-6' : 'mb-6')}>
                    {!openDate && (
                      <Text
                        className={cn('mb-1 font-semibold', errors.walletId?.message && 'text-rose-500')}
                      >
                        {t('Date')}
                      </Text>
                    )}
                    <TouchableWithoutFeedback
                      onPress={() => setOpenDate(!openDate)}
                      onFocus={() => clearErrors('date')}
                    >
                      {openDate ? (
                        <View className="mx-auto flex w-full max-w-sm flex-col items-center px-21/2">
                          <DateTimePicker
                            display="inline"
                            currentDate={moment(form.date).toDate()}
                            onChange={date => {
                              setValue('date', date)
                              setOpenDate(false)
                            }}
                          />
                        </View>
                      ) : (
                        <View className="h-12 flex-row items-center justify-center rounded-lg border border-primary bg-white px-21/2">
                          <Text className="text-center font-semibold text-black">
                            {moment(form.date).format('MMM DD, YYYY')}
                          </Text>
                        </View>
                      )}
                    </TouchableWithoutFeedback>
                    {errors.date?.message && (
                      <Text className="ml-1 mt-0.5 italic text-rose-400">
                        {errors.date?.message?.toString()}
                      </Text>
                    )}
                  </View>
                ) : (
                  <View className="mb-6 flex flex-1 flex-col">
                    <Text
                      className={cn('mb-1 font-semibold', errors.walletId?.message && 'text-rose-500')}
                    >
                      {t('Date')}
                    </Text>
                    <TouchableWithoutFeedback
                      onPress={() => setOpenDate(!openDate)}
                      onFocus={() => clearErrors('date')}
                    >
                      <View>
                        <View className="mx-auto flex w-full max-w-sm flex-col items-center px-21/2">
                          <DateTimePicker
                            display="inline"
                            open={openDate}
                            close={() => setOpenDate(false)}
                            currentDate={moment(form.date).toDate()}
                            onChange={date => {
                              setValue('date', date)
                              setOpenDate(false)
                            }}
                          />
                        </View>
                        <View className="h-12 flex-row items-center justify-center rounded-lg border border-primary bg-white px-21/2">
                          <Text className="text-center font-semibold text-black">
                            {moment(form.date).format('MMM DD, YYYY')}
                          </Text>
                        </View>
                      </View>
                    </TouchableWithoutFeedback>
                    {errors.date?.message && (
                      <Text className="ml-1 mt-0.5 italic text-rose-400">
                        {errors.date?.message?.toString()}
                      </Text>
                    )}
                  </View>
                )}
              </View>

              {/* MARK: Footer */}
              <View className="mb-21 px-0">
                <View className="mt-3 flex flex-row items-center justify-end gap-21/2">
                  <View>
                    <Button
                      variant="secondary"
                      className="h-10 rounded-md px-21/2"
                      onPress={() => {
                        dispatch(setInitFromWallet(null))
                        dispatch(setInitToWallet(null))
                        router.back()
                      }}
                    >
                      <Text className="font-semibold text-primary">{t('Cancel')}</Text>
                    </Button>
                  </View>
                  <Button
                    variant="default"
                    className="h-10 min-w-[60px] rounded-md px-21/2"
                    onPress={handleSubmit(handleTransferFund)}
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
          </View>
        </ScrollView>
      </BlurView>
    </SafeAreaView>
  )
}

export default TransferFundPage
