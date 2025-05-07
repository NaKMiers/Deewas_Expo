import CustomInput from '@/components/CustomInput'
import CommonFooter from '@/components/dialogs/CommonFooter'
import DrawerWrapper from '@/components/DrawerWrapper'
import Icon from '@/components/Icon'
import Text from '@/components/Text'
import { Separator } from '@/components/ui/separator'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { refresh } from '@/lib/reducers/loadReducer'
import {
  resetDateRange,
  setBudgetToEdit,
  setFromDate,
  setSelectedCategory,
  setToDate,
} from '@/lib/reducers/screenReducer'
import { capitalize, formatSymbol, getLocale } from '@/lib/string'
import { toUTC } from '@/lib/time'
import { cn } from '@/lib/utils'
import { updateBudgetApi } from '@/requests/budgetRequests'
import { format, isSameDay } from 'date-fns'
import { router } from 'expo-router'
import { LucideChevronsUpDown } from 'lucide-react-native'
import moment from 'moment'
import { useCallback, useEffect, useRef, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { TouchableOpacity, View } from 'react-native'
import Toast from 'react-native-toast-message'

function UpdateBudgetPage() {
  // hooks
  const { t: translate, i18n } = useTranslation()
  const t = useCallback((key: string) => translate('updateBudgetPage.' + key), [translate])
  const tSuccess = useCallback((key: string) => translate('success.' + key), [translate])
  const tError = useCallback((key: string) => translate('error.' + key), [translate])
  const dispatch = useAppDispatch()
  const locale = i18n.language

  // store
  const currency = useAppSelector(state => state.settings.settings?.currency)
  const { budgetToEdit: budget, selectedCategory, dateRange } = useAppSelector(state => state.screen)

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
      categoryId: budget?.category._id || '',
      total: budget?.total.toString() || '',
      begin: moment(budget?.begin).toDate(),
      end: moment(budget?.end).toDate(),
    },
  })
  const form = watch()

  // states
  const [saving, setSaving] = useState<boolean>(false)

  // refs
  const didSetInitialDate = useRef<boolean>(false)

  useEffect(() => {
    if (selectedCategory) setValue('categoryId', selectedCategory._id)
    if (didSetInitialDate.current) {
      if (dateRange.from) setValue('begin', dateRange.from)
      if (dateRange.to) setValue('end', dateRange.to)
    } else {
      didSetInitialDate.current = true
      if (budget?.begin) dispatch(setFromDate(moment(budget.begin).toISOString()))
      if (budget?.begin) dispatch(setToDate(moment(budget.end).toISOString()))
    }
  }, [dispatch, setValue, selectedCategory, budget, dateRange])

  useEffect(() => {
    if (!budget) return
    dispatch(setSelectedCategory(budget.category))
  }, [dispatch, budget])

  // leave screen
  useEffect(
    () => () => {
      dispatch(setBudgetToEdit(null))
      dispatch(setSelectedCategory(null))
      dispatch(resetDateRange())
    },
    [dispatch]
  )

  // check change
  const checkChanged = useCallback(
    (newValues: any) => {
      if (!budget || !newValues) return

      if (budget.category._id !== newValues.categoryId) return true
      if (budget.total.toString() !== newValues.total) return true
      if (moment(budget.begin).valueOf() !== moment(newValues.begin).valueOf()) return true
      if (moment(budget.end).valueOf() !== moment(newValues.end).valueOf()) return true

      return false
    },
    [budget]
  )

  // validate form
  const validate: SubmitHandler<FieldValues> = useCallback(
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

      if (!checkChanged(data)) {
        router.back()
        return false
      }

      return isValid
    },
    [setError, checkChanged, t]
  )

  // update transaction
  const handleUpdateBudget: SubmitHandler<FieldValues> = useCallback(
    async data => {
      // validate form
      if (!budget) return
      if (!validate(data)) return

      // start loading
      setSaving(true)

      try {
        await updateBudgetApi(budget._id, {
          ...data,
          begin: toUTC(moment(data.begin).startOf('day').toDate()),
          end: toUTC(moment(data.end).endOf('day').toDate()),
          total: data.total,
        })

        Toast.show({
          type: 'success',
          text1: tSuccess('Budget updated'),
        })

        dispatch(refresh())
        router.back()
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
    [dispatch, validate, tError, tSuccess, budget]
  )

  return (
    <DrawerWrapper>
      <View>
        <Text className="text-center text-xl font-semibold text-primary">{t('Update Budget')}</Text>
        <Text className="text-center tracking-wider text-muted-foreground">
          {t('Budget helps you manage money wisely')}
        </Text>
      </View>

      {/* MARK: Total */}
      <View className="mt-6 flex-col gap-6">
        {currency && (
          <CustomInput
            id="total"
            type="number"
            value={form.total}
            label={t('Total')}
            placeholder="..."
            onChange={setValue}
            onFocus={() => clearErrors('total')}
            icon={<Text className="text-lg font-semibold text-black">{formatSymbol(currency)}</Text>}
            errors={errors}
            containerClassName="bg-white"
            inputClassName="text-black"
          />
        )}

        {/* MARK: Category */}
        <View className="flex-1 flex-col">
          <Text className={cn('mb-1.5 font-semibold', errors.categoryId?.message && 'text-rose-500')}>
            {t('Category')}
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            className="h-12 flex-row items-center justify-between gap-2 rounded-lg border border-primary bg-white px-21/2"
            onPress={() => {
              router.push('/category-picker?type=expense')
              clearErrors('categoryId')
            }}
          >
            {selectedCategory ? (
              <View className="flex-row items-center gap-2">
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

        {/* MARK: Date Range */}
        <View className="flex-1 flex-col">
          <Text
            className={cn(
              'mb-1.5 font-semibold',
              (errors.begin || errors.end)?.message && 'text-rose-500'
            )}
          >
            {t('From - To')}
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            className={cn(
              'h-12 flex-row items-center justify-center gap-2 rounded-md border border-primary px-3'
            )}
            onPress={() => {
              router.push('/date-range-picker?isFuture=true')
              clearErrors('begin')
              clearErrors('end')
            }}
          >
            <Text className="font-semibold">
              {capitalize(
                format(form.begin, isSameDay(form.begin, form.end) ? 'MMM dd' : 'MMM dd, yyyy', {
                  locale: getLocale(locale),
                })
              )}
            </Text>
            <Text className="font-semibold">-</Text>
            <Text className="font-semibold">
              {capitalize(format(form.end, 'MMM dd, yyyy', { locale: getLocale(locale) }))}
            </Text>
          </TouchableOpacity>
          {(errors.begin || errors.end)?.message && (
            <Text className="ml-1 mt-0.5 italic text-rose-400">
              {(errors.begin || errors.end)?.message?.toString()}
            </Text>
          )}
        </View>
      </View>

      <CommonFooter
        className="mb-21 mt-6 px-0"
        cancelLabel={t('Cancel')}
        acceptLabel={t('Save')}
        onCancel={router.back}
        onAccept={handleSubmit(handleUpdateBudget)}
        loading={saving}
      />

      <Separator className="my-8 h-0" />
    </DrawerWrapper>
  )
}

export default UpdateBudgetPage
