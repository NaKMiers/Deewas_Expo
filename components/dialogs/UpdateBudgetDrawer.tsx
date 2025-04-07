import DateRangePicker from '@/components/DateRangePicker'
import { currencies } from '@/constants/settings'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { formatSymbol, revertAdjustedCurrency } from '@/lib/string'
import { toUTC } from '@/lib/time'
import { cn } from '@/lib/utils'
import { updateBudgetApi } from '@/requests/budgetRequests'
import moment from 'moment'
import { ReactNode, useCallback, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, TouchableOpacity, View } from 'react-native'
import Toast from 'react-native-toast-message'
import CategoryPicker from '../CategoryPicker'
import CustomInput from '../CustomInput'
import { useDrawer } from '../providers/DrawerProvider'
import Text from '../Text'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'

interface UpdateBudgetDrawerProps {
  budget: IFullBudget
  update?: (budget: IFullBudget) => void
  className?: string
}

function UpdateBudgetDrawer({ budget, update, className }: UpdateBudgetDrawerProps) {
  // hooks
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('updateBudgetDrawer.' + key)
  const tSuccess = (key: string) => translate('success.' + key)
  const tError = (key: string) => translate('error.' + key)
  const { closeDrawer } = useDrawer()
  const dispatch = useAppDispatch()

  // store
  const currency = useAppSelector(state => state.settings.settings?.currency)
  const locale = currencies.find(c => c.value === currency)?.locale || 'en-US'

  // form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    control,
    clearErrors,
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      categoryId: budget.category._id || '',
      total: budget.total.toString() || '',
      begin: moment(budget.begin).toDate(),
      end: moment(budget.end).toDate(),
    },
  })

  const [saving, setSaving] = useState<boolean>(false)
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: moment(budget.begin).startOf('month').toDate(),
    to: moment(budget.end).endOf('month').toDate(),
  })

  // validate form
  const handleValidate: SubmitHandler<FieldValues> = useCallback(
    data => {
      let isValid = true

      // total is required
      if (!data.total) {
        setError('total', {
          type: 'manual',
          message: t('Amount is required'),
        })
        isValid = false
      }

      // total must be > 0
      if (data.total <= 0) {
        setError('total', {
          type: 'manual',
          message: t('Amount must be greater than 0'),
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

      // begin must be selected
      if (!data.begin) {
        setError('begin', {
          type: 'manual',
          message: t('From and To date is required'),
        })
        isValid = false
      }

      // to must be selected
      if (!data.end) {
        setError('end', {
          type: 'manual',
          message: t('From and To date is required'),
        })
        isValid = false
      }

      return isValid
    },
    [setError, t]
  )

  // update transaction
  const handleUpdateBudget: SubmitHandler<FieldValues> = useCallback(
    async data => {
      // validate form
      if (!handleValidate(data)) return

      // start loading
      setSaving(true)

      try {
        const { budget: b, message } = await updateBudgetApi(budget._id, {
          ...data,
          begin: toUTC(moment(data.begin).startOf('day').toDate()),
          end: toUTC(moment(data.end).endOf('day').toDate()),
          total: revertAdjustedCurrency(data.total, locale),
        })

        if (update) update(b)

        Toast.show({
          type: 'success',
          text1: tSuccess('Budget updated'),
        })

        closeDrawer()
        reset()
      } catch (err: any) {
        Toast.show({
          type: 'error',
          text1: tError('Failed to update budget'),
        })

        console.log(err)
      } finally {
        // stop loading
        setSaving(false)
      }
    },
    [handleValidate, reset, update, budget._id, locale, t]
  )

  return (
    <View className={cn('mx-auto mt-21 w-full max-w-sm', className)}>
      <View>
        <Text className="text-center text-xl font-semibold text-primary">{t('Update Budget')}</Text>
        <Text className="text-center text-muted-foreground">
          {t('Budget helps you manage money wisely')}
        </Text>
      </View>

      <View className="mt-6 flex flex-col gap-6">
        {currency && (
          <CustomInput
            id="total"
            label={t('Total')}
            errors={errors}
            type="currency"
            className="bg-white text-black"
            control={control}
            onFocus={() => clearErrors('total')}
            iconClassName="bg-white"
            icon={<Text className="text-lg font-semibold text-black">{formatSymbol(currency)}</Text>}
          />
        )}

        {/* Category */}
        <View className="flex flex-1 flex-col">
          <Text className={cn('mb-2 font-semibold', errors.categoryId?.message && 'text-rose-500')}>
            {t('Category')}
          </Text>
          <CategoryPicker
            category={budget.category}
            onChange={(categoryId: string) => {
              setValue('categoryId', categoryId)
              clearErrors('categoryId')
            }}
            type="expense"
          />
          {errors.categoryId?.message && (
            <Text className="ml-1 mt-0.5 italic text-rose-400">
              {errors.categoryId?.message?.toString()}
            </Text>
          )}
        </View>

        {/* MARK: Date Range */}
        <View className="flex flex-1 flex-col">
          <Text
            className={cn(
              'mb-1 font-semibold',
              (errors.begin || errors.end)?.message && 'text-rose-500'
            )}
          >
            {t('From - To')}
          </Text>
          <DateRangePicker
            values={dateRange}
            update={({ from, to }: any) => {
              setDateRange({ from, to })
              setValue('begin', from)
              setValue('end', to)
              clearErrors('begin')
              clearErrors('begin')
            }}
            className="h-12 justify-center bg-white"
            textClassName="text-black"
          />
          {(errors.begin || errors.end)?.message && (
            <Text className="ml-1 mt-0.5 italic text-rose-400">
              {(errors.begin || errors.end)?.message?.toString()}
            </Text>
          )}
        </View>
      </View>

      {/* MARK: Drawer Footer */}
      <View className="mb-21 mt-6 px-0">
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
            onPress={handleSubmit(handleUpdateBudget)}
          >
            {saving ? <ActivityIndicator /> : <Text className="font-semibold">{t('Save')}</Text>}
          </Button>
        </View>
      </View>

      <Separator className="my-8 h-0" />
    </View>
  )
}

interface NodeProps extends UpdateBudgetDrawerProps {
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
      onPress={() => openDrawer(<UpdateBudgetDrawer {...props} />)}
    >
      {trigger}
    </TouchableOpacity>
  )
}

export default Node
