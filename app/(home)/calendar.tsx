import Icon from '@/components/Icon'
import { Transaction } from '@/components/LatestTransactions'
import MonthYearPicker from '@/components/MonthYearPicker'
import Text from '@/components/Text'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { refresh, setRefreshing } from '@/lib/reducers/loadReducer'
import { formatCompactNumber, getLocale } from '@/lib/string'
import { cn } from '@/lib/utils'
import { getMyTransactionsApi } from '@/requests'
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  subMonths,
} from 'date-fns'
import { LucideChevronLeft, LucideChevronRight } from 'lucide-react-native'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, SafeAreaView, ScrollView, View } from 'react-native'
import { RefreshControl } from 'react-native-gesture-handler'

function CalendarPage() {
  // hooks
  const { t: translate, i18n } = useTranslation()
  const t = (key: string) => translate('calendarPage.' + key)
  const dispatch = useAppDispatch()
  const locale = i18n.language

  // store
  const { refreshPoint } = useAppSelector(state => state.load)
  const currency = useAppSelector(state => state.settings.settings?.currency)

  // states
  const [transactions, setTransactions] = useState<IFullTransaction[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [loading, setLoading] = useState(false)

  const getTransactions = useCallback(async () => {
    // start loading
    setLoading(true)

    try {
      const { transactions } = await getMyTransactionsApi()
      setTransactions(transactions)
    } catch (err: any) {
      console.error(err)
    } finally {
      // stop loading
      setLoading(false)
      dispatch(setRefreshing(false))
    }
  }, [])

  useEffect(() => {
    getTransactions()
  }, [getTransactions, refreshPoint])

  // Get all days in the current month
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Get transactions for a specific date
  const getTransactionsForDate = (date: Date) => {
    return transactions.filter(tx => isSameDay(new Date(tx.date), date))
  }

  // Get total amount for a specific date
  const getTotalForDate = (date: Date) => {
    const dateTransactions = getTransactionsForDate(date)
    return dateTransactions.reduce((total, tx) => {
      return tx.type === 'expense' ? total - tx.amount : total + tx.amount
    }, 0)
  }

  return (
    <SafeAreaView className="flex-1">
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => dispatch(refresh())}
          />
        }
      >
        <View className="p-21/2 md:px-21">
          {/* MARK: Top */}
          <View className="flex flex-row flex-wrap items-center gap-x-2 gap-y-1">
            <Text className="pl-1 text-xl font-bold">{t('Calendar')}</Text>
          </View>

          {!loading ? (
            <View className="mt-21/2 flex flex-col gap-21/2">
              {/* Calendar */}
              <View className="rounded-lg bg-secondary p-3 shadow-md">
                {/* MARK: Nav */}
                <View className="mb-4 flex flex-row flex-wrap items-center justify-between gap-1">
                  <MonthYearPicker
                    currentMonth={currentMonth}
                    setCurrentMonth={setCurrentMonth}
                  />

                  <View className="flex flex-row items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      onPress={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    >
                      <Icon render={LucideChevronLeft} />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    >
                      <Icon render={LucideChevronRight} />
                    </Button>
                  </View>
                </View>

                {/* MARK: Days of week */}
                <View className="mb-2 flex flex-row">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <View
                      className="flex flex-row items-center justify-center py-2 text-center text-sm font-medium text-muted-foreground"
                      key={i}
                      style={{ width: (SCREEN_WIDTH - 45) / 7 }}
                    >
                      <Text className="text-center font-semibold">
                        {format(new Date(2025, 0, 5 + i), 'EEE', { locale: getLocale(locale) })}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* MARK: Days of month */}
                <View className="flex flex-row flex-wrap">
                  {Array.from({ length: monthStart.getDay() }).map((_, index) => (
                    <View
                      key={`empty-end-${index}`}
                      style={{ width: (SCREEN_WIDTH - 45) / 7 }}
                    />
                  ))}

                  {monthDays.map(day => {
                    const total = getTotalForDate(day)
                    const isSelected = isSameDay(day, selectedDate)

                    return (
                      <Pressable
                        key={day.toString()}
                        className={cn(
                          'relative mt-3 flex h-[55px] flex-col items-center justify-start gap-2 rounded-md p-1 shadow-none',
                          isSelected && 'bg-primary',
                          !isSameMonth(day, currentMonth) && 'text-muted-foreground opacity-50'
                        )}
                        style={{ width: (SCREEN_WIDTH - 45) / 7 }}
                        onPress={() => setSelectedDate(day)}
                      >
                        <Text
                          className={cn(
                            'relative z-10 text-center font-medium',
                            isSelected && 'font-bold text-secondary'
                          )}
                        >
                          {format(day, 'd')}
                        </Text>

                        {/* <CreateTransactionDrawer
                          refetch={refetch}
                          initDate={day.toString()}
                          trigger={
                            <Button className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-row items-center justify-center bg-muted-foreground/10">
                              <Icon render={LucidePlus} />
                            </Button>
                          }
                        /> */}

                        {getTransactionsForDate(day).length > 0 && (
                          <View className="relative mt-auto w-full">
                            <View className={cn('flex w-full flex-row justify-center gap-0.5 px-0.5')}>
                              <Text
                                className={cn(
                                  'text-center',
                                  total < 0 ? 'text-rose-500' : 'text-emerald-500'
                                )}
                              >
                                {currency && `${total >= 0 ? '+' : '-'}`}
                              </Text>
                              <Text
                                className={cn(
                                  'text-center font-semibold',
                                  total < 0 ? 'text-rose-500' : 'text-emerald-500'
                                )}
                              >
                                {formatCompactNumber(Math.abs(total), true)}
                              </Text>
                            </View>
                            <View className="mt-1 h-0.5 w-full overflow-hidden rounded-full bg-muted-foreground/20">
                              <View
                                className={cn(
                                  'h-full rounded-full',
                                  total < 0 ? 'bg-rose-500' : 'bg-emerald-500'
                                )}
                                style={{
                                  width: `${Math.min((Math.abs(total) / 100) * 100, 100)}%`,
                                }}
                              />
                            </View>
                          </View>
                        )}
                      </Pressable>
                    )
                  })}

                  {Array.from({ length: 6 - monthEnd.getDay() }).map((_, index) => (
                    <View
                      key={`empty-end-${index}`}
                      style={{ width: (SCREEN_WIDTH - 45) / 7 }}
                    />
                  ))}
                </View>
              </View>

              {/* MARK: Transactions of day */}
              <View className="flex w-full rounded-lg bg-secondary p-3 shadow-md">
                <Text className="mb-4 flex-1 text-lg font-semibold">
                  {t('Transactions for') + ' '}
                  <Text className="text-muted-foreground/80">
                    {format(selectedDate, 'd MMMM, yyyy', { locale: getLocale(locale) })}
                  </Text>
                </Text>
                <ScrollView className="max-h-[500px] flex-1 gap-1">
                  {getTransactionsForDate(selectedDate).length > 0 ? (
                    getTransactionsForDate(selectedDate).map(tx => (
                      <View
                        className="mb-1"
                        key={tx._id}
                      >
                        <Transaction
                          transaction={tx}
                          refetch={getTransactions}
                          key={tx._id}
                        />
                      </View>
                    ))
                  ) : (
                    <View className="flex flex-row items-center justify-center rounded-md border border-muted-foreground/50 px-2 py-7">
                      <Text className="text-center text-lg font-semibold text-muted-foreground/50">
                        {t('No transactions for this day')}
                      </Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            </View>
          ) : (
            <View className="gap-21/2 px-21/2 md:gap-21 md:px-21">
              <Skeleton className="h-[500px] p-4" />
              <Skeleton className="h-[500px] p-4" />
            </View>
          )}
        </View>

        <Separator className="my-16 h-0" />
      </ScrollView>
    </SafeAreaView>
  )
}

export default CalendarPage
