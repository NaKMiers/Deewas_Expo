import { currencies } from '@/constants/settings'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { checkTranType, revertAdjustedCurrency } from '@/lib/string'
import { cn } from '@/lib/utils'
import { ICategory, IFullTransaction, IWallet, TransactionType } from '@/types/type'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import { LucideLoaderCircle, TouchpadOff } from 'lucide-react'
import moment from 'moment'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { SafeAreaView, TouchableOpacity, View } from 'react-native'
import CustomInput from '../CustomInput'
import Icon from '../Icon'
import { Button } from '../ui/button'
import { Text } from '../ui/text'
import { createTransactionApi } from '@/requests'
import { toUTC } from '@/lib/time'
import { refetching } from '@/lib/reducers/loadReducer'
import Toast from 'react-native-toast-message'
import CategoryPicker from '../CategoryPicker'

interface CreateTransactionDrawerProps {
  type?: TransactionType
  initWallet?: IWallet
  initCategory?: ICategory
  initDate?: string
  refetch?: () => void
  update?: (transaction: IFullTransaction) => void
  className?: string
}

function CreateTransactionDrawer({
  type,
  initWallet,
  initCategory,
  initDate,
  update,
  refetch,
  className = '',
}: CreateTransactionDrawerProps) {
  // hooks
  let { t: translate, i18n } = useTranslation()
  const t = (key: string) => translate('createTransactionDrawer.' + key)
  const tSuccess = (key: string) => translate('success.' + key)
  const tError = (key: string) => translate('error.' + key)
  const dispatch = useAppDispatch()

  // // store
  const currency = useAppSelector(state => state.settings.settings?.currency)
  const { curWallet } = useAppSelector(state => state.wallet)

  // // values
  const locale = currencies.find(c => c.value === currency)?.locale || 'en-US'

  // states
  const [open, setOpen] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)

  // ref
  const bottomSheetRef = useRef<BottomSheet>(null)

  // values
  const snapPoints = useMemo(() => ['25%', '50%', '75%'], [])

  // form
  const {
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    watch,
    getValues,
    control,
    clearErrors,
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      walletId: initWallet?._id || curWallet?._id || '',
      name: '',
      categoryId: initCategory?._id || '',
      amount: '',
      date: initDate ? moment(initDate).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
      type: initCategory?.type || type || 'expense',
    },
  })
  const form = watch()

  useEffect(() => {
    if (!getValues('walletId')) {
      setValue('walletId', initWallet?._id || curWallet?._id)
    }
  }, [getValues, setValue, initWallet, curWallet])

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
        const { transaction, message } = await createTransactionApi({
          ...data,
          date: toUTC(data.date),
          amount: revertAdjustedCurrency(data.amount, locale),
        })

        dispatch(refetching())

        if (refetch) refetch()
        if (update) update(transaction)

        // show success message
        Toast.show({
          type: 'success',
          text1: tSuccess('Transaction created'),
        })

        setOpen(false)
        reset()
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
    [handleValidate, reset, refetch, update, dispatch, locale, t]
  )

  return (
    <BottomSheet
      snapPoints={snapPoints}
      ref={bottomSheetRef}
      index={3}
    >
      <BottomSheetView>
        <SafeAreaView>
          <View className="mx-auto flex w-full max-w-[500px] items-center px-21/2 pb-21">
            <View>
              <Text className="text-center text-xl font-semibold text-secondary">
                {t('Create')}{' '}
                {form.type && (
                  <Text className={cn('text-xl', checkTranType(form.type).color)}>{t(form.type)}</Text>
                )}{' '}
                {t('transaction')}
              </Text>
              <Text className="text-center text-muted-foreground">
                {t('Transactions keep track of your finances effectively')}
              </Text>
            </View>

            <View
              className="flex w-full gap-8"
              style={{ marginTop: 20 }}
            >
              {/* MARK: Name */}
              <CustomInput
                id="name"
                label={t('Name')}
                type="text"
                control={control}
                errors={errors}
                labelClassName="text-black"
                className="bg-white text-black"
                onFocus={() => clearErrors('name')}
              />

              {/* MARK: Amount */}
              {/* {currency && ( */}
              <CustomInput
                id="amount"
                label={t('Amount')}
                type="currency"
                control={control}
                errors={errors}
                labelClassName="text-black"
                className="bg-white text-black"
                onFocus={() => clearErrors('amount')}
              />
              {/* )} */}

              {/* MARK: Type */}
              {!initCategory && !type && (
                <CustomInput
                  id="type"
                  label={t('Type')}
                  disabled={saving}
                  errors={errors}
                  type="select"
                  control={control}
                  labelClassName="text-black"
                  className="bg-white text-black"
                  options={[
                    {
                      label: t('Expense'),
                      value: 'expense',
                    },
                    {
                      label: t('Income'),
                      value: 'income',
                    },
                    {
                      label: t('Saving'),
                      value: 'saving',
                    },
                    {
                      label: t('Invest'),
                      value: 'invest',
                    },
                  ]}
                  onFocus={() => clearErrors('type')}
                />
              )}

              {/* MARK: Category */}
              <View className="mt-1.5 flex flex-1 flex-col">
                <Text
                  className={cn(
                    'mb-1 text-xs font-semibold',
                    errors.categoryId?.message && 'text-rose-500'
                  )}
                >
                  {t('Category')}
                </Text>
                <TouchableOpacity onFocus={() => clearErrors('categoryId')}>
                  <CategoryPicker
                    category={initCategory}
                    onChange={(categoryId: string) => setValue('categoryId', categoryId)}
                    type={form.type}
                  />
                </TouchableOpacity>
                {errors.categoryId?.message && (
                  <Text className="ml-1 mt-0.5 text-xs italic text-rose-400">
                    {errors.categoryId?.message?.toString()}
                  </Text>
                )}
              </View>

              {/* MARK: Wallet */}
              <View className="mt-1.5">
                <Text
                  className={cn(
                    'mb-1 text-xs font-semibold',
                    errors.walletId?.message && 'text-rose-500'
                  )}
                >
                  {t('Wallet')}
                </Text>
                {/* <Presss onFocus={() => clearErrors('walletId')}>
                    <WalletPicker
                      className={cn('w-full justify-normal', errors.walletId?.message && 'border-rose-500')}
                      wallet={initWallet || curWallet}
                      onChange={(wallet: IWallet | null) => wallet && setValue('walletId', wallet._id)}
                    />
                  </Presss> */}
                {errors.walletId?.message && (
                  <Text className="ml-1 mt-0.5 block text-xs italic text-rose-400">
                    {errors.walletId?.message?.toString()}
                  </Text>
                )}
              </View>

              {/* MARK: Date */}
              {/* <View className="mt-1.5 flex flex-1 flex-col">
                  <p className="mb-1 text-xs font-semibold">{t('Date')}</p>
                  <View onFocus={() => clearErrors('date')}>
                    <Drawer>
                      <DrawerTrigger className="w-full">
                        <button className="flex h-9 w-full items-center justify-between gap-2 rounded-md border px-21/2 text-start text-sm font-semibold">
                          {moment(form.date).format('MMM DD, YYYY')}
                          <LucideCalendar size={18} />
                        </button>
                      </DrawerTrigger>
    
                      <DrawerContent className="w-full overflow-hidden rounded-md p-0 outline-none">
                        <DrawerHeader>
                          <DrawerTitle className="text-center">{t('Select Date')}</DrawerTitle>
                          <DrawerDescription className="text-center">
                            {t('When did this transaction happen?')}
                          </DrawerDescription>
                        </DrawerHeader>
    
                        <View className="mx-auto flex w-full max-w-sm flex-col items-center px-21/2">
                          <Calendar
                            mode="single"
                            selected={form.date}
                            onSelect={date => {
                              setValue('date', date)
                              clearErrors('date')
                            }}
                            initialFocus
                          />
                        </View>
    
                        <View className="pt-8" />
                      </DrawerContent>
                    </Drawer>
                  </View>
                  {errors.date?.message && (
                    <Text className="ml-1 mt-0.5 text-xs italic text-rose-400">
                      {errors.date?.message?.toString()}
                    </Text>
                  )}
                </View> */}
            </View>

            <View className="mt-3 flex w-full flex-row items-center justify-end gap-21/2">
              <View>
                <Button
                  variant="default"
                  className="h-10 rounded-md px-21/2 text-[13px] font-semibold"
                  onPress={() => {
                    setOpen(false)
                    reset()
                  }}
                >
                  <Text>{t('Cancel')}</Text>
                </Button>
              </View>
              <Button
                variant="secondary"
                disabled={saving}
                className="h-10 min-w-[60px] rounded-md px-21/2 text-[13px] font-semibold"
                // onClick={handleSubmit(handleCreateTransaction)}
              >
                {saving ? (
                  <Icon
                    render={LucideLoaderCircle}
                    size={20}
                    className="animate-spin text-muted-foreground"
                  />
                ) : (
                  <Text>{t('Save')}</Text>
                )}
              </Button>
            </View>
          </View>
        </SafeAreaView>
      </BottomSheetView>
    </BottomSheet>
  )
}

export default CreateTransactionDrawer
