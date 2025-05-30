import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { deleteBudget } from '@/lib/reducers/budgetReducer'
import { setBudgetToEdit, setSelectedCategory } from '@/lib/reducers/screenReducer'
import { checkLevel, formatCurrency } from '@/lib/string'
import { cn } from '@/lib/utils'
import { deleteBudgetApi } from '@/requests/budgetRequests'
import { differenceInDays } from 'date-fns'
import { router } from 'expo-router'
import { LucideEllipsis, LucideLayers2, LucidePencil, LucideTrash } from 'lucide-react-native'
import moment from 'moment'
import { memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, TouchableOpacity, View } from 'react-native'
import Toast from 'react-native-toast-message'
import BlurView from './BlurView'
import ConfirmDialog from './dialogs/ConfirmDialog'
import Icon from './Icon'
import Text from './Text'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu'

interface IBudgetCardProps {
  begin: Date | string
  end: Date | string
  budget: IFullBudget
  hideMenu?: boolean
  className?: string
}

function BudgetCard({ begin, end, budget, hideMenu, className }: IBudgetCardProps) {
  // hooks
  const dispatch = useAppDispatch()
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('budgetCard.' + key)
  const tSuccess = useCallback((key: string) => translate('success.' + key), [translate])
  const tError = useCallback((key: string) => translate('error.' + key), [translate])

  // store
  const currency = useAppSelector(state => state.settings.settings?.currency)

  // states
  const [deleting, setDeleting] = useState<boolean>(false)

  // values
  const progress = (budget.amount / budget.total) * 100
  const length = differenceInDays(end, begin)
  const spent = differenceInDays(new Date(), begin)

  // delete budget
  const handleDeleteBudget = useCallback(async () => {
    // start deleting
    setDeleting(true)

    try {
      const { budget: b } = await deleteBudgetApi(budget._id)
      Toast.show({
        type: 'success',
        text1: tSuccess('Budget deleted'),
      })

      dispatch(deleteBudget(b))
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: tError('Failed to delete budget'),
      })
      console.log(err)
    } finally {
      // stop deleting
      setDeleting(false)
    }
  }, [dispatch, tSuccess, tError, setDeleting, budget._id])

  return (
    <View className="shadow-md">
      <BlurView
        intensity={90}
        className={cn(
          'overflow-hidden rounded-xl border border-primary/10 px-3 pb-10 pt-21/2',
          className
        )}
      >
        <View className="flex-row items-center justify-between gap-1">
          {/* MARK: Category & Amount */}
          <View className="flex-row items-center gap-2 text-sm font-semibold">
            <Text>{budget.category.icon}</Text>
            <Text>{budget.category.name}</Text>
            <View className="h-5 w-0.5 bg-muted-foreground/50" />
            {currency && (
              <Text className="text-sm font-semibold tracking-tight">
                {formatCurrency(currency, budget.total)}
              </Text>
            )}
          </View>

          {!hideMenu &&
            (!deleting ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                  >
                    <Icon render={LucideEllipsis} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="rounded-xl bg-transparent px-0 py-0">
                  <BlurView
                    className="px-1 py-2"
                    tint="prominent"
                    intensity={90}
                    noBlur
                  >
                    {/* MARK: Duplicate */}
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => {
                        dispatch(setSelectedCategory(budget.category))
                        router.push(
                          `/create-budget?initTotal=${budget.total}&initBegin=${moment(budget.begin).add(1, 'month').toISOString()}&initEnd=${moment(budget.end).add(1, 'month').toISOString()}`
                        )
                      }}
                      className="h-10 w-full flex-row items-center justify-start gap-2 px-5"
                    >
                      <Icon
                        render={LucideLayers2}
                        size={16}
                        color="#8b5cf6"
                      />
                      <Text className="font-semibold text-violet-500">{t('Create Similar')}</Text>
                    </TouchableOpacity>

                    {/* MARK: Update */}
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => {
                        dispatch(setBudgetToEdit(budget))
                        router.push('/update-budget')
                      }}
                      className="h-10 w-full flex-row items-center justify-start gap-2 px-5"
                    >
                      <Icon
                        render={LucidePencil}
                        size={16}
                        color="#0ea5e9"
                      />
                      <Text className="font-semibold text-sky-500">{t('Edit')}</Text>
                    </TouchableOpacity>

                    {/* MARK: Delete */}
                    <ConfirmDialog
                      label={t('Delete Budget')}
                      desc={t('Are you sure you want to delete this budget?')}
                      confirmLabel={t('Delete')}
                      onConfirm={handleDeleteBudget}
                      trigger={
                        <Button
                          variant="ghost"
                          className="h-8 w-full flex-row items-center justify-start gap-2 px-2"
                        >
                          <Icon
                            render={LucideTrash}
                            size={16}
                            color="#f43f5e"
                          />
                          <Text className="font-semibold text-rose-500">{t('Delete')}</Text>
                        </Button>
                      }
                    />
                  </BlurView>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <ActivityIndicator />
            ))}
        </View>

        {/* MARK: Left */}
        <View className="mt-1 px-1">
          <View className="relative h-6 w-full rounded-full bg-primary/10">
            <View
              className={cn('h-full rounded-full', checkLevel(progress).background)}
              style={{ width: `${progress > 100 ? 100 : progress}%` }}
            />
            {currency && (
              <Text className="text-nowrap absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 font-body text-sm font-semibold tracking-wider">
                {t('Left')} {formatCurrency(currency, budget.total - budget.amount)}
              </Text>
            )}
            {moment(begin).isSameOrBefore(moment()) && (
              <View
                className="absolute top-0 h-full w-0.5 -translate-x-1/2 bg-white/50"
                style={{ left: `${(spent / length) * 100}%` }}
              >
                <View
                  className="absolute left-1/2 top-7 -translate-x-1/2 rounded-sm bg-primary/10 px-0.5 py-0.5 text-[10px]"
                  style={{ width: 50 }}
                >
                  <Text className="text-center text-sm">{t('Today')}</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </BlurView>
    </View>
  )
}

export default memo(BudgetCard)
