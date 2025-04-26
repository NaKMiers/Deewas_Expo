import { currencies } from '@/constants/settings'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { setRefreshing } from '@/lib/reducers/loadReducer'
import { formatSymbol, revertAdjustedCurrency } from '@/lib/string'
import { toUTC } from '@/lib/time'
import { cn } from '@/lib/utils'
import { transferFundApi } from '@/requests/walletRequests'
import moment from 'moment'
import { ReactNode, useCallback, useEffect, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import {
  ActivityIndicator,
  Platform,
  Pressable,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import Toast from 'react-native-toast-message'
import CustomInput from '../CustomInput'
import DateTimePicker from '../DateTimePicker'
import { useDrawer } from '../providers/DrawerProvider'
import Text from '../Text'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import WalletPicker from '../WalletPicker'

interface TransferFundDrawerProps {
  type?: TransactionType
  initFromWallet?: IWallet
  initToWallet?: IWallet
  refresh?: () => void
  className?: string
}

function TransferFundDrawer({
  initFromWallet,
  initToWallet,
  refresh,
  className,
}: TransferFundDrawerProps) {
  // hooks
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('transferFundDrawer.' + key)
  const tSuccess = (key: string) => translate('success.' + key)
  const tError = (key: string) => translate('error.' + key)
  const { closeDrawer } = useDrawer()
  const dispatch = useAppDispatch()

  // store
  const currency = useAppSelector(state => state.settings.settings?.currency)
  const { wallets } = useAppSelector(state => state.wallet)

  // values
  const locale = currencies.find(c => c.value === currency)?.locale || 'en-US'

  // states
  const [saving, setSaving] = useState<boolean>(false)
  const [openDate, setOpenDate] = useState<boolean>(false)

  // form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    watch,
    control,
    clearErrors,
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      fromWalletId: initFromWallet?._id || '',
      toWalletId: initToWallet?._id || '',
      amount: '',
      date: moment().format('YYYY-MM-DD'),
    },
  })
  const form = watch()

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
        const { message } = await transferFundApi({
          ...data,
          date: toUTC(data.date),
          amount: revertAdjustedCurrency(data.amount, locale),
        })

        if (refresh) refresh()

        Toast.show({
          type: 'success',
          text1: tSuccess('Transferred fund'),
        })

        reset()
        closeDrawer()
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
    [validate, reset, refresh, dispatch, locale, t]
  )

  return (
    <View className={cn('mx-auto mt-21 w-full max-w-sm', className)}>
      <View className="mx-auto w-full max-w-sm px-21/2">
        <View>
          <Text className="text-center text-xl font-semibold text-primary">{t('Transfer Fund')}</Text>
          <Text className="text-center text-muted-foreground">
            {t('Transfer money between wallets')}
          </Text>
        </View>

        <View className="mt-6 flex flex-col gap-6">
          {/* MARK: From Wallet */}
          <View className="">
            <Text className={cn('mb-1 font-semibold', errors.fromWalletId?.message && 'text-rose-500')}>
              {t('From Wallet')}
            </Text>
            <Pressable onFocus={() => clearErrors('fromWalletId')}>
              <WalletPicker
                className={cn(
                  'w-full justify-normal',
                  errors.fromWalletId?.message && 'border-rose-500'
                )}
                onChange={(wallet: IWallet | null) => wallet && setValue('fromWalletId', wallet._id)}
                wallet={wallets.find(w => w._id === form.fromWalletId) || initToWallet}
              />
            </Pressable>
            {errors.fromWalletId?.message && (
              <Text className="ml-1 mt-0.5 block italic text-rose-400">
                {errors.fromWalletId?.message?.toString()}
              </Text>
            )}
          </View>

          {/* MARK: To Wallet */}
          <View className="">
            <Text className={cn('mb-1 font-semibold', errors.toWalletId?.message && 'text-rose-500')}>
              {t('To Wallet')}
            </Text>
            <View>
              <WalletPicker
                className={cn('w-full justify-normal', errors.toWalletId?.message && 'border-rose-500')}
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
              label={t('Amount')}
              disabled={saving}
              register={register}
              errors={errors}
              type="currency"
              control={control}
              onFocus={() => clearErrors('amount')}
              className="bg-white text-black"
              icon={<Text className="text-lg font-semibold text-black">{formatSymbol(currency)}</Text>}
            />
          )}

          {/* MARK: Date */}
          {Platform.OS === 'ios' ? (
            <View className={cn('flex flex-1 flex-col', openDate ? '-mt-6' : 'mb-6')}>
              {!openDate && (
                <Text className={cn('mb-1 font-semibold', errors.walletId?.message && 'text-rose-500')}>
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
              <Text className={cn('mb-1 font-semibold', errors.walletId?.message && 'text-rose-500')}>
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
                variant="default"
                className="h-10 rounded-md px-21/2"
                onPress={() => {
                  reset()
                  closeDrawer()
                }}
              >
                <Text className="font-semibold text-secondary">{t('Cancel')}</Text>
              </Button>
            </View>
            <Button
              variant="secondary"
              className="h-10 min-w-[60px] rounded-md px-21/2"
              onPress={handleSubmit(handleTransferFund)}
            >
              {saving ? <ActivityIndicator /> : <Text className="font-semibold">{t('Save')}</Text>}
            </Button>
          </View>
        </View>

        <Separator className="my-8 h-0" />
      </View>
    </View>
  )
}

interface NodeProps extends TransferFundDrawerProps {
  disabled?: boolean
  trigger: ReactNode
  open?: boolean
  onClose?: () => void
  reach?: number
  className?: string
}

function Node({ open, onClose, reach, disabled, trigger, className, ...props }: NodeProps) {
  const { openDrawer, open: openState, reach: defaultReach } = useDrawer()
  const r = reach || defaultReach

  useEffect(() => {
    if (open === true) openDrawer(<TransferFundDrawer {...props} />, r)
  }, [openDrawer, open, props, r])

  useEffect(() => {
    if (onClose && openState) onClose()
  }, [openState, onClose])

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      className={cn(className, disabled && 'opacity-50')}
      disabled={disabled}
      onPress={() => openDrawer(<TransferFundDrawer {...props} />, r)}
    >
      {trigger}
    </TouchableOpacity>
  )
}

export default Node
