import { currencies } from '@/constants/settings'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { setRefreshing } from '@/lib/reducers/loadReducer'
import { checkTranType, formatSymbol, revertAdjustedCurrency } from '@/lib/string'
import { toUTC } from '@/lib/time'
import { cn } from '@/lib/utils'
import { updateTransactionApi } from '@/requests'
import moment from 'moment'
import { ReactNode, useCallback, useEffect, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import {
  ActivityIndicator,
  Pressable,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import Toast from 'react-native-toast-message'
import CategoryPicker from '../CategoryPicker'
import CustomInput from '../CustomInput'
import DateTimePicker from '../DateTimePicker'
import { useDrawer } from '../providers/DrawerProvider'
import Text from '../Text'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import WalletPicker from '../WalletPicker'

interface UpdateTransactionDrawerProps {
  transaction: IFullTransaction
  update?: (transaction: IFullTransaction) => void
  refresh?: () => void
  className?: string
}

function UpdateTransactionDrawer({
  transaction,
  update,
  refresh,
  className,
}: UpdateTransactionDrawerProps) {
  // hooks
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('updateTransactionDrawer.' + key)
  const tSuccess = (key: string) => translate('success.' + key)
  const tError = (key: string) => translate('error.' + key)
  const { closeDrawer } = useDrawer()
  const dispatch = useAppDispatch()

  // store
  const currency = useAppSelector(state => state.settings.settings?.currency)

  // values
  const locale = currencies.find(c => c.value === currency)?.locale || 'en-US'

  // states
  const [saving, setSaving] = useState<boolean>(false)

  // MARK: form
  const {
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
      walletId: transaction.wallet._id || '',
      name: transaction.name || '',
      categoryId: transaction.category._id || '',
      amount: transaction.amount.toString() || '',
      date: moment(transaction.date).format('YYYY-MM-DD'),
    },
  })

  const form = watch()
  // validate form
  const handleValidate: SubmitHandler<FieldValues> = useCallback(
    data => {
      let isValid = true

      // wallet is required
      if (!data.walletId) {
        setError('walletId', {
          type: 'manual',
          message: t('Wallet is required'),
        })
        isValid = false
      }

      // name is required
      if (!data.name) {
        setError('name', {
          type: 'manual',
          message: t('Name is required'),
        })
        isValid = false
      }

      // amount is required
      if (!+data.amount) {
        setError('amount', {
          type: 'manual',
          message: t('Amount is required'),
        })
        isValid = false
      }

      // category must be selected
      if (!data.categoryId) {
        setError('categoryId', {
          type: 'manual',
          message: t('Category is required'),
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

  // update transaction
  const handleUpdateTransaction: SubmitHandler<FieldValues> = useCallback(
    async data => {
      // validate form
      if (!handleValidate(data)) return

      // start loading
      setSaving(true)

      try {
        const { transaction: tx, message } = await updateTransactionApi(transaction._id, {
          ...data,
          date: toUTC(data.date),
          amount: revertAdjustedCurrency(data.amount, locale),
        })

        if (update) update(tx)
        if (refresh) refresh()

        Toast.show({
          type: 'success',
          text1: tSuccess('Transaction updated'),
        })

        reset()
        closeDrawer()
      } catch (err: any) {
        Toast.show({
          type: 'error',
          text1: tError('Failed to update transaction'),
        })

        console.log(err)
      } finally {
        // stop loading
        setSaving(false)
        dispatch(setRefreshing(false))
      }
    },
    [handleValidate, reset, update, refresh, dispatch, , transaction._id, locale, t]
  )

  return (
    <View className={cn('mx-auto mt-21 w-full max-w-sm', className)}>
      <View className="mx-auto w-full max-w-sm px-21/2">
        <View>
          <Text className="text-center text-xl font-semibold text-primary">
            {t('Update') + ' '}
            {transaction.type && (
              <Text className={cn(checkTranType(transaction.type).color)}>{t(transaction.type)}</Text>
            )}
            {' ' + t('transaction')}
          </Text>
          <Text className="text-center text-muted-foreground">
            {t('Transactions keep track of your finances effectively')}
          </Text>
        </View>

        <View className="mt-6 flex flex-col gap-6">
          {/* MARK: Name */}
          <CustomInput
            id="name"
            label={t('Name')}
            errors={errors}
            type="text"
            control={control}
            className="bg-white text-black"
            onFocus={() => clearErrors('name')}
          />

          {/* MARK: Amount */}
          {currency && (
            <CustomInput
              id="amount"
              label={t('Amount')}
              errors={errors}
              type="currency"
              control={control}
              className="bg-white text-black"
              onFocus={() => clearErrors('amount')}
              iconClassName="bg-white"
              icon={<Text className="text-lg font-semibold text-black">{formatSymbol(currency)}</Text>}
            />
          )}

          {/* MARK: Category */}
          <View className="flex flex-1 flex-col">
            <Text className={cn('mb-1 font-semibold', errors.categoryId?.message && 'text-rose-500')}>
              {t('Category')}
            </Text>
            <CategoryPicker
              category={transaction.category}
              onChange={(categoryId: string) => {
                setValue('categoryId', categoryId)
                clearErrors('categoryId')
              }}
              type={transaction.type}
            />
            {errors.categoryId?.message && (
              <Text className="ml-1 mt-0.5 italic text-rose-400">
                {errors.categoryId?.message?.toString()}
              </Text>
            )}
          </View>

          {/* MARK: Wallet */}
          <View>
            <Text className="mb-1 font-semibold">{t('Wallet')}</Text>
            <Pressable onFocus={() => clearErrors('walletId')}>
              <WalletPicker
                className={cn('w-full justify-normal', errors.walletId?.message && 'border-rose-500')}
                wallet={transaction.wallet}
                onChange={(wallet: IWallet | null) => wallet && setValue('walletId', wallet._id)}
              />
            </Pressable>
            {errors.walletId?.message && (
              <Text className="ml-1 mt-0.5 block italic text-rose-400">
                {errors.walletId?.message?.toString()}
              </Text>
            )}
          </View>

          {/* MARK: Date */}
          <View className="-mt-6 flex flex-1 flex-col">
            <TouchableWithoutFeedback
              onFocus={() => clearErrors('date')}
              style={{ marginTop: -30 }}
            >
              <View className="mx-auto flex w-full max-w-sm flex-col items-center px-21/2">
                <DateTimePicker
                  display="inline"
                  currentDate={moment(form.date).toDate()}
                  onChange={date => setValue('date', date)}
                />
              </View>
            </TouchableWithoutFeedback>
            {errors.date?.message && (
              <Text className="ml-1 mt-0.5 italic text-rose-400">
                {errors.date?.message?.toString()}
              </Text>
            )}
          </View>
        </View>

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
              onPress={handleSubmit(handleUpdateTransaction)}
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

interface NodeProps extends UpdateTransactionDrawerProps {
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
    if (open === true) openDrawer(<UpdateTransactionDrawer {...props} />, r)
  }, [open])

  useEffect(() => {
    if (onClose && openState) onClose()
  }, [openState, onClose])

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      className={cn(className, disabled && 'opacity-50')}
      disabled={disabled}
      onPress={() => openDrawer(<UpdateTransactionDrawer {...props} />, r)}
    >
      {trigger}
    </TouchableOpacity>
  )
}

export default Node
