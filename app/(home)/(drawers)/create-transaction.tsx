import CustomInput from '@/components/CustomInput'
import DateTimePicker from '@/components/DateTimePicker'
import DrawerWrapper from '@/components/DrawerWrapper'
import Icon from '@/components/Icon'
import Text from '@/components/Text'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { refresh } from '@/lib/reducers/loadReducer'
import { setSelectedCategory, setSelectedWallet } from '@/lib/reducers/screenReducer'
import { checkTranType, formatSymbol } from '@/lib/string'
import { toUTC } from '@/lib/time'
import { cn } from '@/lib/utils'
import { createTransactionApi } from '@/requests'
import { router, useLocalSearchParams } from 'expo-router'
import { LucideChevronsUpDown, LucideCircle } from 'lucide-react-native'
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
import Collapsible from 'react-native-collapsible'
import Toast from 'react-native-toast-message'

function CreateTransactionPage() {
  // hooks
  const { t: translate } = useTranslation()
  const t = useCallback((key: string) => translate('createTransactionPage.' + key), [translate])
  const tSuccess = useCallback((key: string) => translate('success.' + key), [translate])
  const tError = useCallback((key: string) => translate('error.' + key), [translate])
  const dispatch = useAppDispatch()
  const { initDate, type } = useLocalSearchParams()

  // store
  const currency = useAppSelector(state => state.settings.settings?.currency)
  const wallets = useAppSelector(state => state.wallet.wallets)
  const categories = useAppSelector(state => state.category.categories)
  const { selectedWallet, selectedCategory } = useAppSelector(state => state.screen)

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
      walletId: selectedWallet?._id || '',
      name: '',
      categoryId: selectedCategory?._id || '',
      amount: '',
      date: initDate ? moment(initDate).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
      type: selectedCategory?.type || type || 'expense',
    },
  })
  const form = watch()

  // states
  const [openType, setOpenType] = useState<boolean>(false)
  const [saving, setSaving] = useState<boolean>(false)
  const [openDate, setOpenDate] = useState<boolean>(false)

  // set default category when select type
  useEffect(() => {
    if (selectedCategory) return
    const dfCat = categories.find(cat => cat.type === form.type && !cat.deletable)
    if (dfCat) dispatch(setSelectedCategory(dfCat))
  }, [dispatch, categories, selectedCategory, wallets, form.type])

  useEffect(() => {
    if (selectedWallet) setValue('walletId', selectedWallet._id)
    if (selectedCategory) setValue('categoryId', selectedCategory._id)
  }, [setValue, selectedWallet, selectedCategory])

  useEffect(
    () => () => {
      dispatch(setSelectedWallet(null))
      dispatch(setSelectedCategory(null))
    },
    [dispatch]
  )

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

      // type is required
      if (!data.type) {
        setError('type', {
          type: 'manual',
          message: t('Type is required'),
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

  // create transaction
  const handleCreateTransaction: SubmitHandler<FieldValues> = useCallback(
    async data => {
      // validate form
      if (!handleValidate(data)) return

      // start loading
      setSaving(true)

      try {
        await createTransactionApi({
          ...data,
          date: toUTC(data.date),
          amount: data.amount,
        })

        Toast.show({
          type: 'success',
          text1: tSuccess('Transaction created'),
        })

        dispatch(refresh())
        router.back()
      } catch (err: any) {
        Toast.show({
          type: 'error',
          text1: tError('Failed to create transaction'),
        })

        console.log(err)
      } finally {
        // stop loading
        setSaving(false)
      }
    },
    [dispatch, handleValidate, tError, tSuccess]
  )

  return (
    <DrawerWrapper>
      <View>
        <Text className="text-center text-xl font-semibold text-primary">
          {t('Create') + ' '}
          {form.type && <Text className={cn(checkTranType(form.type).color)}>{t(form.type)}</Text>}
          {' ' + t('transaction')}
        </Text>
        <Text className="text-center tracking-wider text-muted-foreground">
          {t('Transactions keep track of your finances effectively')}
        </Text>
      </View>

      <View className="mt-6 flex-col gap-6">
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

        {/* MARK: Type */}
        {!type && (
          <View className="flex-col gap-1.5">
            <View className="">
              <Text className="px-1 font-semibold text-primary">{t('Type')}</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                className="mt-1.5 h-12 w-full flex-row items-center gap-2 rounded-lg border border-primary bg-white px-3"
                onPress={() => setOpenType(!openType)}
              >
                <Icon
                  render={LucideCircle}
                  size={18}
                  color={checkTranType(form.type).hex}
                />
                <Text
                  className={cn('font-semibold capitalize text-black', checkTranType(form.type).color)}
                >
                  {form.type}
                </Text>
              </TouchableOpacity>
            </View>
            <Collapsible
              collapsed={!openType}
              duration={200}
            >
              <View className="flex-col overflow-hidden rounded-lg">
                {['expense', 'income', 'saving', 'invest'].map((tranType, index) => (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    className={cn(
                      'h-12 flex-row items-center gap-2 bg-white px-21/2',
                      index > 0 && 'border-t'
                    )}
                    onPress={() => {
                      setValue('type', tranType as TransactionType)
                      dispatch(setSelectedCategory(null))
                      setOpenType(false)
                    }}
                    key={tranType}
                  >
                    <Icon
                      render={LucideCircle}
                      size={18}
                      color={checkTranType(tranType as any).hex}
                    />
                    <Text
                      className={cn('font-semibold capitalize', checkTranType(tranType as any).color)}
                    >
                      {t(tranType)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Collapsible>
          </View>
        )}

        {/* MARK: Category */}
        <View className={cn('flex-1 flex-col', !openType && '-mt-1')}>
          <Text className={cn('mb-1.5 font-semibold', errors.categoryId?.message && 'text-rose-500')}>
            {t('Category')}
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            className="flex h-12 flex-row items-center justify-between gap-2 rounded-lg border border-primary bg-white px-21/2"
            onPress={() => router.push(`/category-picker?type=${form.type}`)}
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
            <Text className="ml-1 mt-0.5 italic text-rose-500">
              {errors.categoryId?.message?.toString()}
            </Text>
          )}
        </View>

        {/* MARK: Wallet */}
        <View>
          <Text className={cn('mb-1.5 font-semibold', errors.walletId?.message && 'text-rose-500')}>
            {t('Wallet')}
          </Text>
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
          <View className={cn('flex-1 flex-col', openDate ? '-mt-6' : 'mb-6')}>
            {!openDate && (
              <Text className={cn('mb-1.5 font-semibold', errors.walletId?.message && 'text-rose-500')}>
                {t('Date')}
              </Text>
            )}
            <TouchableWithoutFeedback onPress={() => setOpenDate(!openDate)}>
              {openDate ? (
                <View className="mx-auto w-full max-w-sm flex-col items-center px-21/2">
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
          <View className="mb-6 flex-1 flex-col">
            <Text className={cn('mb-1 font-semibold', errors.walletId?.message && 'text-rose-500')}>
              {t('Date')}
            </Text>
            <TouchableWithoutFeedback onPress={() => setOpenDate(!openDate)}>
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
        <View className="mt-3 flex-row items-center justify-end gap-21/2">
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
            onPress={handleSubmit(handleCreateTransaction)}
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

export default CreateTransactionPage
