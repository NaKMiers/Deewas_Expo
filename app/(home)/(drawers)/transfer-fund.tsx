import CustomInput from '@/components/CustomInput'
import DateTimePicker from '@/components/DateTimePicker'
import CommonFooter from '@/components/dialogs/CommonFooter'
import CommonHeader from '@/components/dialogs/CommonHeader'
import DrawerWrapper from '@/components/DrawerWrapper'
import Icon from '@/components/Icon'
import { Separator } from '@/components/ui/separator'
import { Text } from '@/components/ui/text'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { refresh, setRefreshing } from '@/lib/reducers/loadReducer'
import { setFromWallet, setToWallet } from '@/lib/reducers/screenReducer'
import { capitalize, formatSymbol, getLocale } from '@/lib/string'
import { toUTC } from '@/lib/time'
import { cn } from '@/lib/utils'
import { transferFundApi } from '@/requests/walletRequests'
import { format } from 'date-fns'
import { router } from 'expo-router'
import { LucideChevronsUpDown } from 'lucide-react-native'
import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Platform, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import Toast from 'react-native-toast-message'

function TransferFundPage() {
  // hooks
  const { t: translate, i18n } = useTranslation()
  const t = useCallback((key: string) => translate('transferFundPage.' + key), [translate])
  const tSuccess = useCallback((key: string) => translate('success.' + key), [translate])
  const tError = useCallback((key: string) => translate('error.' + key), [translate])
  const dispatch = useAppDispatch()
  const locale = i18n.language

  // store
  const currency = useAppSelector(state => state.settings.settings?.currency)
  const { fromWallet, toWallet } = useAppSelector(state => state.screen)

  // form
  const {
    handleSubmit,
    setError,
    setValue,
    watch,
    clearErrors,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      fromWalletId: fromWallet?._id || '',
      toWalletId: toWallet?._id || '',
      amount: '',
      date: moment().format('YYYY-MM-DD'),
    },
  })
  const form = watch()

  // states
  const [saving, setSaving] = useState<boolean>(false)
  const [openDate, setOpenDate] = useState<boolean>(false)

  useEffect(() => {
    if (fromWallet) {
      if (toWallet && fromWallet._id === toWallet._id) {
        setValue('fromWalletId', '')
        setError('fromWalletId', {
          type: 'manual',
          message: t('Source wallet and destination wallet must be different'),
        })
      } else {
        setValue('fromWalletId', fromWallet._id)
        clearErrors('fromWalletId')
      }
    }
    if (toWallet) {
      if (fromWallet && fromWallet._id === toWallet._id) {
        setValue('toWalletId', '')
        setError('toWalletId', {
          type: 'manual',
          message: t('Source wallet and destination wallet must be different'),
        })
      } else {
        setValue('toWalletId', toWallet._id)
        clearErrors('toWalletId')
      }
    }
  }, [setValue, setError, clearErrors, t, fromWallet, toWallet])

  useEffect(
    () => () => {
      dispatch(setFromWallet(null))
      dispatch(setToWallet(null))
    },
    [dispatch]
  )

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
    <DrawerWrapper>
      <CommonHeader
        title={t('Transfer Fund')}
        desc={t('Transfer money between wallets')}
      />

      <View className="mt-6 flex-col gap-6">
        {/* MARK: From Wallet */}
        <View>
          <Text className={cn('mb-1 font-semibold', errors.fromWalletId?.message && 'text-rose-500')}>
            {t('From Wallet')}
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            className="h-12 flex-row items-center justify-between gap-2 rounded-lg border border-primary bg-white px-21/2"
            onPress={() => router.push('/wallet-picker?isFromWallet=true')}
          >
            {fromWallet ? (
              <View className="flex-row items-center gap-2">
                <Text className="text-base text-black">{fromWallet.icon}</Text>
                <Text className="text-base font-semibold text-black">{fromWallet.name}</Text>
              </View>
            ) : (
              <Text className="text-base font-semibold text-black">{t('Select wallet')}</Text>
            )}
            <Icon
              render={LucideChevronsUpDown}
              size={18}
              color="black"
            />
          </TouchableOpacity>
          {errors.fromWalletId?.message && (
            <Text className="ml-1 mt-0.5 block italic text-rose-400">
              {errors.fromWalletId?.message?.toString()}
            </Text>
          )}
        </View>

        {/* MARK: To Wallet */}
        <View>
          <Text className={cn('mb-1 font-semibold', errors.toWalletId?.message && 'text-rose-500')}>
            {t('To Wallet')}
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            className="h-12 flex-row items-center justify-between gap-2 rounded-lg border border-primary bg-white px-21/2"
            onPress={() => router.push('/wallet-picker?isToWallet=true')}
          >
            {toWallet ? (
              <View className="flex-row items-center gap-2">
                <Text className="text-base text-black">{toWallet.icon}</Text>
                <Text className="text-base font-semibold text-black">{toWallet.name}</Text>
              </View>
            ) : (
              <Text className="text-base font-semibold text-black">{t('Select wallet')}</Text>
            )}
            <Icon
              render={LucideChevronsUpDown}
              size={18}
              color="black"
            />
          </TouchableOpacity>
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
            onChange={setValue}
            onFocus={() => clearErrors('amount')}
            icon={<Text className="text-lg font-semibold text-black">{formatSymbol(currency)}</Text>}
            errors={errors}
            containerClassName="bg-white"
            inputClassName="text-black"
          />
        )}

        {/* MARK: Date */}
        {Platform.OS === 'ios' ? (
          <View className={cn('flex-1 flex-col', openDate ? '-mt-6' : 'mb-6')}>
            {!openDate && (
              <Text className={cn('mb-1 font-semibold', errors.date?.message && 'text-rose-500')}>
                {t('Date')}
              </Text>
            )}
            <TouchableWithoutFeedback
              onPress={() => {
                setOpenDate(!openDate)
                clearErrors('date')
              }}
            >
              {openDate ? (
                <View className="mx-auto w-full flex-col items-center px-21/2">
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
                    {capitalize(format(form.date, 'MMM dd, yyyy', { locale: getLocale(locale) }))}
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
          <View className="mb-6 flex-1 flex-col">
            <Text className={cn('mb-1 font-semibold', errors.date?.message && 'text-rose-500')}>
              {t('Date')}
            </Text>
            <TouchableWithoutFeedback
              onPress={() => {
                setOpenDate(!openDate)
                clearErrors('date')
              }}
            >
              <View>
                <View className="mx-auto w-full max-w-sm flex-col items-center px-21/2">
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
                    {capitalize(format(form.date, 'MMM dd, yyyy', { locale: getLocale(locale) }))}
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

      <CommonFooter
        className="mb-21 mt-6 px-0"
        cancelLabel={t('Cancel')}
        acceptLabel={t('Save')}
        onCancel={router.back}
        onAccept={handleSubmit(handleTransferFund)}
        loading={saving}
      />

      <Separator className="my-8 h-0" />
    </DrawerWrapper>
  )
}

export default TransferFundPage
