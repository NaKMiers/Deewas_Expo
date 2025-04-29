import CustomInput from '@/components/CustomInput'
import DateRangePicker from '@/components/DateRangePicker'
import Icon from '@/components/Icon'
import { useAuth } from '@/components/providers/AuthProvider'
import Text from '@/components/Text'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { refresh, setOpenPremiumModal } from '@/lib/reducers/loadReducer'
import { setInitCategory, setSelectedCategory } from '@/lib/reducers/screenReducer'
import { formatSymbol } from '@/lib/string'
import { toUTC } from '@/lib/time'
import { cn } from '@/lib/utils'
import { createBudgetApi } from '@/requests/budgetRequests'
import { BlurView } from 'expo-blur'
import { router, useLocalSearchParams } from 'expo-router'
import { LucideChevronsUpDown } from 'lucide-react-native'
import moment from 'moment'
import { useCallback, useMemo, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

function CreateBudgetPage() {
  // hooks
  const { isPremium } = useAuth()
  const { t: translate } = useTranslation()
  const t = useCallback((key: string) => translate('createBudgetPage.' + key), [translate])
  const tSuccess = useCallback((key: string) => translate('success.' + key), [translate])
  const tError = useCallback((key: string) => translate('error.' + key), [translate])
  const dispatch = useAppDispatch()
  const { initTotal, initBegin, initEnd } = useLocalSearchParams()

  // store
  const currency = useAppSelector(state => state.settings.settings?.currency)
  const budgets = useAppSelector(state => state.budget.budgets)
  const initCategory = useAppSelector(state => state.screen.initCategory)
  const selectedCategory = useAppSelector(state => state.screen.selectedCategory)

  const defaultValues = useMemo(
    () => ({
      categoryId: initCategory?._id || '',
      total: initTotal?.toString() || '',
      begin: initBegin
        ? moment(initBegin).startOf('month').toDate()
        : moment().startOf('month').toDate(),
      end: initEnd ? moment(initEnd).endOf('month').toDate() : moment().endOf('month').toDate(),
    }),
    [initCategory, initBegin, initEnd, initTotal]
  )

  // form
  const {
    handleSubmit,
    setError,
    setValue,
    getValues,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues,
  })
  const form = watch()

  // states
  const [saving, setSaving] = useState<boolean>(false)
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: moment(getValues('begin')).startOf('month').toDate(),
    to: moment(getValues('end')).endOf('month').toDate(),
  })

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

      return isValid
    },
    [setError, t]
  )

  // create budget
  const handleCreateBudget: SubmitHandler<FieldValues> = useCallback(
    async data => {
      // validate form
      if (!validate(data)) return

      // show paywall if not premium
      if (!isPremium && budgets.length >= 4) {
        dispatch(setInitCategory(null))
        router.back()
        setTimeout(() => {
          dispatch(setOpenPremiumModal(true))
        }, 0)
        return
      }

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

        dispatch(refresh())
        dispatch(setInitCategory(null))
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
    [dispatch, validate, tError, tSuccess, budgets, isPremium]
  )

  return (
    <SafeAreaView className="flex-1">
      <BlurView
        className="flex-1"
        intensity={80}
        tint="prominent"
      >
        <ScrollView className="flex-1">
          <View className="mx-auto w-full max-w-[500px] flex-1 p-21">
            {/* MARK: Header */}
            <View>
              <Text className="text-center text-xl font-semibold text-primary">
                {t('Create Budget')}
              </Text>
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
                  clearErrors={clearErrors}
                  onChange={setValue}
                  icon={
                    <Text className="text-lg font-semibold text-black">{formatSymbol(currency)}</Text>
                  }
                  errors={errors}
                  containerClassName="bg-white"
                  inputClassName="text-black"
                />
              )}

              {/* MARK: Category */}
              <View className="flex-1 flex-col">
                <Text
                  className={cn('mb-1.5 font-semibold', errors.categoryId?.message && 'text-rose-500')}
                >
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
                    <Text className="text-base font-semibold text-black">{t('Select Category')}</Text>
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
                <DateRangePicker
                  values={dateRange}
                  update={({ from, to }: any) => {
                    setDateRange({ from, to })
                    setValue('begin', from)
                    setValue('end', to)
                    clearErrors('begin')
                    clearErrors('begin')
                  }}
                  className="mt-1 h-12 justify-center bg-white"
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
              <View className="mt-3 flex-row items-center justify-end gap-21/2">
                <View>
                  <Button
                    variant="secondary"
                    className="h-10 rounded-md px-21/2"
                    onPress={() => {
                      dispatch(setInitCategory(null))
                      dispatch(setSelectedCategory(null))
                      router.back()
                    }}
                  >
                    <Text className="font-semibold text-primary">{t('Cancel')}</Text>
                  </Button>
                </View>
                <Button
                  variant="default"
                  className="h-10 min-w-[60px] rounded-md px-21/2"
                  onPress={handleSubmit(handleCreateBudget)}
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
          </View>
        </ScrollView>
      </BlurView>
    </SafeAreaView>
  )
}

export default CreateBudgetPage
