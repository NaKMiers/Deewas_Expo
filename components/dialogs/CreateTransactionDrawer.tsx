import { currencies } from '@/constants/settings'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { refresh } from '@/lib/reducers/loadReducer'
import { checkTranType, formatSymbol, revertAdjustedCurrency } from '@/lib/string'
import { toUTC } from '@/lib/time'
import { cn } from '@/lib/utils'
import { createTransactionApi } from '@/requests'
import { LucideCircle } from 'lucide-react-native'
import moment from 'moment'
import { ReactNode, useCallback, useEffect, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Pressable, TouchableOpacity, View } from 'react-native'
import Toast from 'react-native-toast-message'
import CategoryPicker from '../CategoryPicker'
import CustomInput from '../CustomInput'
import DateTimePicker from '../DateTimePicker'
import Icon from '../Icon'
import { useDrawer } from '../providers/DrawerProvider'
import Text from '../Text'
import { Button } from '../ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'
import { Separator } from '../ui/separator'
import WalletPicker from '../WalletPicker'

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
  className,
}: CreateTransactionDrawerProps) {
  // hooks
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('createTransactionDrawer.' + key)
  const tSuccess = (key: string) => translate('success.' + key)
  const tError = (key: string) => translate('error.' + key)
  const { closeDrawer } = useDrawer()
  const dispatch = useAppDispatch()

  // store
  const currency = useAppSelector(state => state.settings.settings?.currency)
  const { curWallet } = useAppSelector(state => state.wallet)

  // values
  const locale = currencies.find(c => c.value === currency)?.locale || 'en-US'

  // states
  const [openType, setOpenType] = useState<boolean>(false)
  const [saving, setSaving] = useState<boolean>(false)

  // form
  const {
    register,
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
        const { transaction } = await createTransactionApi({
          ...data,
          date: toUTC(data.date),
          amount: revertAdjustedCurrency(data.amount, locale),
        })

        dispatch(refresh())

        if (refetch) refetch()
        if (update) update(transaction)

        Toast.show({
          type: 'success',
          text1: tSuccess('Transaction created'),
        })

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
    [handleValidate, reset, refetch, update, dispatch, locale]
  )

  return (
    <View className={cn('mx-auto mt-21 w-full max-w-sm', className)}>
      <View className="mx-auto w-full max-w-sm px-21/2">
        <View>
          <Text className="text-center text-xl font-semibold text-primary">
            {t('Create') + ' '}
            {form.type && <Text className={cn(checkTranType(form.type).color)}>{t(form.type)}</Text>}
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
            placeholder={t('Transaction name') + '...'}
          />

          {/* MARK: Amount */}
          {currency && (
            <CustomInput
              id="amount"
              label={t('Amount')}
              disabled={saving}
              errors={errors}
              type="currency"
              control={control}
              className="bg-white text-black"
              onFocus={() => clearErrors('amount')}
              iconClassName="bg-white"
              icon={<Text className="text-lg font-semibold text-black">{formatSymbol(currency)}</Text>}
            />
          )}

          {/* MARK: Type */}
          {!initCategory && !type && (
            <Collapsible
              open={openType}
              onOpenChange={setOpenType}
            >
              <CollapsibleTrigger>
                <Text className="px-1 font-semibold text-primary">Type</Text>
                <View className="mt-2 flex h-11 w-full flex-row items-center gap-2 rounded-lg border border-primary bg-white px-3">
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
                </View>
              </CollapsibleTrigger>
              <CollapsibleContent className="overflow-hidden rounded-lg">
                {['expense', 'income', 'saving', 'invest'].map(tranType => (
                  <Button
                    variant="default"
                    className="flex flex-row items-center justify-start gap-2 rounded-none border border-b border-secondary bg-white"
                    onPress={() => {
                      setValue('type', tranType as TransactionType)
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
                  </Button>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* MARK: Category */}
          <View className="flex flex-1 flex-col">
            <Text className={cn('mb-2 font-semibold', errors.categoryId?.message && 'text-rose-500')}>
              {t('Category')}
            </Text>
            <CategoryPicker
              category={initCategory}
              onChange={(categoryId: string) => {
                setValue('categoryId', categoryId)
                clearErrors('categoryId')
              }}
              type={form.type}
            />
            {errors.categoryId?.message && (
              <Text className="ml-1 mt-0.5 italic text-rose-400">
                {errors.categoryId?.message?.toString()}
              </Text>
            )}
          </View>

          {/* MARK: Wallet */}
          <View>
            <Text className={cn('mb-1 font-semibold', errors.walletId?.message && 'text-rose-500')}>
              {t('Wallet')}
            </Text>
            <Pressable onFocus={() => clearErrors('walletId')}>
              <WalletPicker
                className={cn('w-full justify-normal', errors.walletId?.message && 'border-rose-500')}
                wallet={initWallet || curWallet}
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
          <View className="flex flex-1 flex-col">
            <Pressable
              onFocus={() => clearErrors('date')}
              style={{ marginTop: -30 }}
            >
              <View className="mx-auto flex w-full max-w-sm scale-90 flex-col items-center px-21/2">
                <DateTimePicker
                  display="inline"
                  currentDate={moment(form.date).toDate()}
                  onChange={date => setValue('date', date)}
                />
              </View>
            </Pressable>
            {errors.date?.message && (
              <Text className="ml-1 mt-0.5 italic text-rose-400">
                {errors.date?.message?.toString()}
              </Text>
            )}
          </View>
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
              onPress={handleSubmit(handleCreateTransaction)}
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

interface NodeProps extends CreateTransactionDrawerProps {
  disabled?: boolean
  trigger: ReactNode
  className?: string
}

function Node({ disabled, trigger, className, ...props }: NodeProps) {
  const { openDrawer } = useDrawer()

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      className={cn(className, disabled && 'opacity-50')}
      disabled={disabled}
      onPress={() => openDrawer(<CreateTransactionDrawer {...props} />)}
    >
      {trigger}
    </TouchableOpacity>
  )
}

export default Node
