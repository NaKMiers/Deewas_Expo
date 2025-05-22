import CustomInput from '@/components/CustomInput'
import CommonFooter from '@/components/dialogs/CommonFooter'
import CommonHeader from '@/components/dialogs/CommonHeader'
import DrawerWrapper from '@/components/DrawerWrapper'
import Icon from '@/components/Icon'
import { useAuth } from '@/components/providers/AuthProvider'
import Text from '@/components/Text'
import { Separator } from '@/components/ui/separator'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { refresh } from '@/lib/reducers/loadReducer'
import {
  resetDateRange,
  setFromDate,
  setSelectedCategory,
  setToDate,
} from '@/lib/reducers/screenReducer'
import { setStep } from '@/lib/reducers/tutorialReducer'
import { capitalize, formatSymbol, getLocale } from '@/lib/string'
import { toUTC } from '@/lib/time'
import { cn } from '@/lib/utils'
import { createBudgetApi } from '@/requests/budgetRequests'
import { format, isSameDay } from 'date-fns'
import { router, useLocalSearchParams } from 'expo-router'
import { LucideChevronsUpDown } from 'lucide-react-native'
import moment from 'moment'
import { useCallback, useEffect, useRef, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Alert, TouchableOpacity, View } from 'react-native'
import Toast from 'react-native-toast-message'

function CreateBudgetPage() {
  // hooks
  const { isPremium } = useAuth()
  const { t: translate, i18n } = useTranslation()
  const t = useCallback((key: string) => translate('createBudgetPage.' + key), [translate])
  const tSuccess = useCallback((key: string) => translate('success.' + key), [translate])
  const tError = useCallback((key: string) => translate('error.' + key), [translate])
  const dispatch = useAppDispatch()
  const locale = i18n.language
  const { initTotal, initBegin, initEnd } = useLocalSearchParams()

  // store
  const currency = useAppSelector(state => state.settings.settings?.currency)
  const categories = useAppSelector(state => state.category.categories)
  const budgets = useAppSelector(state => state.budget.budgets)
  const { selectedCategory, dateRange } = useAppSelector(state => state.screen)
  const { inProgress, step } = useAppSelector(state => state.tutorial)

  // form
  const {
    handleSubmit,
    setError,
    setValue,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      categoryId: selectedCategory?._id || '',
      total: initTotal?.toString() || '',
      begin: moment(initBegin || dateRange.from || undefined)
        .startOf('month')
        .toDate(),
      end: moment(initEnd || dateRange.to || undefined)
        .endOf('month')
        .toDate(),
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
      if (initBegin) dispatch(setFromDate(initBegin as string))
      if (initBegin) dispatch(setToDate(initEnd as string))
    }
  }, [dispatch, setValue, selectedCategory, dateRange, initBegin, initEnd])

  // leave screen
  useEffect(
    () => () => {
      dispatch(setSelectedCategory(null))
      dispatch(resetDateRange())
    },
    [dispatch]
  )

  useEffect(() => {
    if (inProgress && step === 8) {
      const expenseCates = categories.filter(c => c.type === 'expense')
      if (expenseCates.length === 0) {
        Alert.alert('Error', 'No category found')
        dispatch(setStep(9))
        return
      }
      const randomCate = expenseCates[Math.floor(Math.random() * expenseCates.length)]
      dispatch(setSelectedCategory(randomCate))
    }
  }, [dispatch, inProgress, step, categories])

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

      // show paywall if not premium
      if (!isPremium && budgets.length >= 4 && isValid) {
        router.push('/premium')
        return false
      }

      return isValid
    },
    [setError, t, budgets, isPremium]
  )

  // create budget
  const handleCreateBudget: SubmitHandler<FieldValues> = useCallback(
    async data => {
      // validate form
      if (!validate(data)) return

      // start loading
      setSaving(true)

      try {
        await createBudgetApi({
          ...data,
          begin: toUTC(moment(data.begin).startOf('day').toDate()),
          end: toUTC(moment(data.end).endOf('day').toDate()),
          total: data.total,
        })

        Toast.show({
          type: 'success',
          text1: tSuccess('Budget created'),
        })

        if (inProgress && step === 8) dispatch(setStep(9))

        dispatch(refresh())
        router.back()
      } catch (err: any) {
        Toast.show({
          type: 'error',
          text1: tError('Failed to create budget'),
        })

        console.log(err)
      } finally {
        // stop loading
        setSaving(false)
      }
    },
    [dispatch, validate, tError, tSuccess, inProgress, step]
  )

  return (
    <DrawerWrapper>
      {/* MARK: Header */}
      <CommonHeader
        title={t('Create Budget')}
        desc={t('Budget helps you manage money wisely')}
      />

      {/* MARK: Total */}
      <View className="relative mt-6 flex-col gap-6">
        {inProgress && step === 8 && (
          <>
            <View
              className="absolute z-10 w-full rounded-lg border-2 border-sky-500 bg-sky-500/10"
              style={{ height: 80, top: -8 }}
              pointerEvents="none"
            />
          </>
        )}
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
              if (inProgress && step === 8) return
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
              if (inProgress && step === 8) return
              router.push('/date-range-picker?isFuture=true')
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

      {/* MARK: Drawer Footer */}
      <CommonFooter
        className="mb-21 mt-6 px-0"
        cancelLabel={t('Cancel')}
        acceptLabel={t('Save')}
        onCancel={router.back}
        onAccept={handleSubmit(handleCreateBudget)}
        loading={saving}
        inTutorial={inProgress && step === 8}
      />

      <Separator className="my-8 h-0" />
      {inProgress && step === 8 && <Separator className="my-32 h-0" />}
    </DrawerWrapper>
  )
}

export default CreateBudgetPage
