import CustomInput from '@/components/CustomInput'
import DateTimePicker from '@/components/DateTimePicker'
import DrawerWrapper from '@/components/DrawerWrapper'
import Icon from '@/components/Icon'
import Text from '@/components/Text'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { refresh, setRefreshing } from '@/lib/reducers/loadReducer'
import {
  setSelectedCategory,
  setSelectedWallet,
  setTransactionToEdit,
} from '@/lib/reducers/screenReducer'
import { checkTranType, formatSymbol } from '@/lib/string'
import { toUTC } from '@/lib/time'
import { cn } from '@/lib/utils'
import { updateTransactionApi } from '@/requests'
import { router } from 'expo-router'
import { LucideChevronsUpDown } from 'lucide-react-native'
import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import {
  ActivityIndicator,
  Platform,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import Toast from 'react-native-toast-message'

function UpdateTransactionPage() {
  // hooks
  const { t: translate } = useTranslation()
  const t = useCallback((key: string) => translate('updateTransactionPage.' + key), [translate])
  const tSuccess = useCallback((key: string) => translate('success.' + key), [translate])
  const tError = useCallback((key: string) => translate('error.' + key), [translate])
  const dispatch = useAppDispatch()

  // store
  const currency = useAppSelector(state => state.settings.settings?.currency)
  const {
    transactionToEdit: transaction,
    selectedCategory,
    selectedWallet,
  } = useAppSelector(state => state.screen)

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
      name: transaction?.name || '',
      walletId: transaction?.wallet._id || '',
      categoryId: transaction?.category._id || '',
      amount: transaction?.amount.toString() || '',
      date: moment(transaction?.date).format('YYYY-MM-DD'),
    },
  })
  const form = watch()

  // states
  const [saving, setSaving] = useState<boolean>(false)
  const [openDate, setOpenDate] = useState<boolean>(false)

  useEffect(() => {
    if (!transaction) return
    dispatch(setSelectedCategory(transaction.category))
    dispatch(setSelectedWallet(transaction.wallet))
  }, [dispatch, transaction])

  useEffect(() => {
    if (selectedCategory) setValue('categoryId', selectedCategory._id)
    if (selectedWallet) setValue('walletId', selectedWallet._id)
  }, [setValue, selectedWallet, selectedCategory])

  // leave screen
  useEffect(
    () => () => {
      dispatch(setTransactionToEdit(null))
      dispatch(setSelectedCategory(null))
      dispatch(setSelectedWallet(null))
    },
    [dispatch]
  )

  // check change
  const checkChanged = useCallback(
    (newValues: any) => {
      if (!transaction || !newValues) return

      if (transaction.wallet._id !== newValues.walletId) return true
      if (transaction.name !== newValues.name) return true
      if (transaction.category._id !== newValues.categoryId) return true
      if (transaction.amount.toString() !== newValues.amount) return true
      if (moment(transaction.date).format('YYYY-MM-DD').valueOf() !== newValues.date.valueOf())
        return true

      return false
    },
    [transaction]
  )

  // validate form
  const validate: SubmitHandler<FieldValues> = useCallback(
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
      if (!data.name.trim()) {
        setError('name', {
          type: 'manual',
          message: t('Name is required'),
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

      if (!checkChanged(data)) {
        router.back()
        return false
      }

      return isValid
    },
    [setError, checkChanged, t]
  )

  // update transaction
  const handleUpdateTransaction: SubmitHandler<FieldValues> = useCallback(
    async data => {
      // validate form
      if (!transaction) return
      if (!validate(data)) return

      // start loading
      setSaving(true)

      try {
        await updateTransactionApi(transaction._id, {
          ...data,
          date: toUTC(data.date),
          amount: data.amount,
        })

        Toast.show({
          type: 'success',
          text1: tSuccess('Transaction updated'),
        })

        dispatch(refresh())
        router.back()
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
    [dispatch, validate, tError, tSuccess, transaction]
  )

  return (
    <DrawerWrapper>
      <View>
        <Text className="text-center text-xl font-semibold text-primary">
          {t('Update') + ' '}
          {transaction?.type && (
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
          value={form.name}
          placeholder="..."
          clearErrors={clearErrors}
          onChange={setValue}
          errors={errors}
          containerClassName="bg-white"
          inputClassName="text-black"
        />

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
            icon={<Text className="text-lg font-semibold text-black">{formatSymbol(currency)}</Text>}
            errors={errors}
            containerClassName="bg-white"
            inputClassName="text-black"
          />
        )}

        {/* MARK: Category */}
        <View className="flex flex-1 flex-col">
          <Text className={cn('mb-1 font-semibold', errors.categoryId?.message && 'text-rose-500')}>
            {t('Category')}
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            className="flex h-12 flex-row items-center justify-between gap-2 rounded-lg border border-primary bg-white px-21/2"
            onPress={() => router.push('/category-picker?type=expense')}
          >
            {selectedCategory ? (
              <View className="flex flex-row items-center gap-2">
                <Text className="text-base text-black">{selectedCategory.icon}</Text>
                <Text className="text-base font-semibold text-black">{selectedCategory.name}</Text>
              </View>
            ) : (
              <Text className="text-base font-semibold text-black">{t('Select category')}</Text>
            )}
            <Icon
              render={LucideChevronsUpDown}
              size={18}
              color="black"
            />
          </TouchableOpacity>
          {errors.categoryId?.message && (
            <Text className="ml-1 mt-0.5 italic text-rose-400">
              {errors.categoryId?.message?.toString()}
            </Text>
          )}
        </View>

        {/* MARK: Wallet */}
        <View>
          <Text className="mb-1 font-semibold">{t('Wallet')}</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            className="flex h-12 flex-row items-center justify-between gap-2 rounded-lg border border-primary bg-white px-21/2"
            onPress={() => router.push('/wallet-picker')}
          >
            {selectedWallet ? (
              <View className="flex flex-row items-center gap-2">
                <Text className="text-base text-black">{selectedWallet.icon}</Text>
                <Text className="text-base font-semibold text-black">{selectedWallet.name}</Text>
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
          {errors.walletId?.message && (
            <Text className="ml-1 mt-0.5 block italic text-rose-400">
              {errors.walletId?.message?.toString()}
            </Text>
          )}
        </View>

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
            onPress={handleSubmit(handleUpdateTransaction)}
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
    </DrawerWrapper>
  )
}

export default UpdateTransactionPage
