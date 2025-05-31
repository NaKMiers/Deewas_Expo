import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { setRefreshing } from '@/lib/reducers/loadReducer'
import { checkTranType, formatCurrency, getLocale } from '@/lib/string'
import { toUTC } from '@/lib/time'
import { cn } from '@/lib/utils'
import { getHistoryApi } from '@/requests'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { format, isSameDay } from 'date-fns'
import { LucideRotateCw } from 'lucide-react-native'
import moment from 'moment'
import { memo, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TouchableOpacity, View } from 'react-native'
import BlurView from './BlurView'
import Chart from './Chart'
import HistoryFooter from './HistoryFooter'
import HistoryHeader from './HistoryHeader'
import Icon from './Icon'
import { useAuth } from './providers/AuthProvider'
import Text from './Text'
import { Skeleton } from './ui/skeleton'
import { Switch } from './ui/switch'

interface HistoryProps {
  className?: string
}

// chart types
const charts: ChartType[] = ['bar', 'line', 'pie']
const transactionTypes: TransactionType[] = ['income', 'expense', 'saving', 'invest']
const timeUnits: TimeUnit[] = ['week', 'month', 'year']

function History({ className }: HistoryProps) {
  // hooks
  const { user, isRefreshedToken } = useAuth()
  const { t: translate, i18n } = useTranslation()
  const t = useCallback((key: string) => translate('history.' + key), [translate])
  const dispatch = useAppDispatch()
  const locale = i18n.language

  // store
  const { refreshPoint } = useAppSelector(state => state.load)
  const currency = useAppSelector(state => state.settings.settings?.currency)

  // states
  const [transactions, setTransactions] = useState<IFullTransaction[]>([])
  const [oldestDate, setOldestDate] = useState<Date | null>(null)
  const [data, setData] = useState<any[]>([])
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: moment().startOf('month').toDate(),
    to: moment().endOf('month').toDate(),
  })
  const [selectedChartType, setSelectedChartType] = useState<ChartType>(charts[0])
  const [selectedTransactionType, setSelectedTransactionType] = useState<TransactionType>('expense')
  const [chartPeriod, setChartPeriod] = useState<TimeUnit>('month')
  const [loading, setLoading] = useState<boolean>(false)
  const [isIncludeTransfer, setIsIncludeTransfer] = useState<boolean>(false)

  // get history
  const getHistory = useCallback(async () => {
    if (!user || !isRefreshedToken) return

    // start loading
    setLoading(true)

    try {
      const from = toUTC(dateRange.from)
      const to = toUTC(dateRange.to)
      const { transactions, oldestTransaction } = await getHistoryApi(`?from=${from}&to=${to}`)
      setTransactions(transactions)

      if (oldestTransaction) {
        setOldestDate(moment(oldestTransaction.date).toDate())
      }

      // check review status to show review popup
      const reviewStatus = await AsyncStorage.getItem('reviewStatus')
      if (
        reviewStatus !== 'done' &&
        oldestTransaction &&
        moment(oldestTransaction.createdAt).isBefore(moment().subtract(3, 'days')) &&
        transactions.length >= 10
      ) {
        await AsyncStorage.setItem('reviewStatus', 'ready')
      }
    } catch (err: any) {
      console.log(err)
    } finally {
      // stop loading
      setLoading(false)
      dispatch(setRefreshing(false))
    }
  }, [dateRange, dispatch, user])

  // initially get history
  useEffect(() => {
    getHistory()
  }, [getHistory, refreshPoint])

  // auto update chart data
  useEffect(() => {
    const tsx = isIncludeTransfer ? transactions : transactions.filter(t => !t.exclude)

    if (!tsx.length || !currency) {
      setData([])
      return
    }

    // filter by selected transaction type
    const filteredTransactions =
      selectedTransactionType === 'balance' || selectedChartType === 'pie'
        ? tsx
        : tsx.filter(t => t.type === selectedTransactionType)

    const start = toUTC(moment(dateRange.from).startOf('day').toDate())
    const end = toUTC(moment(dateRange.to).endOf('day').toDate())

    const groupedData: any[] = []
    let iterator = moment(start)
    let stepUnit: moment.unitOfTime.DurationConstructor
    let dateFormat: string
    let totalSteps: number

    // define step unit and date format based on chart period
    switch (chartPeriod) {
      case 'week':
        stepUnit = 'day'
        dateFormat = 'ddd'
        totalSteps = 7
        break
      case 'month':
        stepUnit = 'day'
        dateFormat = 'DD'
        totalSteps = moment(end).diff(start, 'days') + 1
        break
      case 'year':
        stepUnit = 'month'
        dateFormat = 'MMM'
        totalSteps = 12
        break
      default:
        return
    }

    if (selectedChartType === 'pie') {
      const totalIncome = filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((total: number, t: any) => total + +t.amount, 0)
      const totalExpense = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((total: number, t: any) => total + +t.amount, 0)
      const totalSaving = filteredTransactions
        .filter(t => t.type === 'saving')
        .reduce((total: number, t: any) => total + +t.amount, 0)
      const totalInvest = filteredTransactions
        .filter(t => t.type === 'invest')
        .reduce((total: number, t: any) => total + +t.amount, 0)

      setData([
        { label: t('income'), value: totalIncome, type: 'income' },
        { label: t('expense'), value: -totalExpense, type: 'expense' },
        { label: t('saving'), value: totalSaving, type: 'saving' },
        { label: t('invest'), value: totalInvest, type: 'invest' },
      ])
    } else {
      // build the data
      while (iterator.isBefore(end) && groupedData.length < totalSteps) {
        const colStart = iterator.clone()
        const colEnd = colStart.clone().endOf(stepUnit)

        // filter transactions in the current chunk
        const chunkTransactions = filteredTransactions.filter((transaction: ITransaction) => {
          const transactionDate = moment(transaction.date).utc()
          return transactionDate.isBetween(colStart, colEnd, undefined, '[]')
        })

        // calculate total value for the chunk
        if (selectedTransactionType === 'balance') {
          const totalIncome = chunkTransactions
            .filter(t => t.type === 'income')
            .reduce((total: number, t: any) => total + +t.amount, 0)
          const totalExpense = chunkTransactions
            .filter(t => t.type === 'expense')
            .reduce((total: number, t: any) => total + +t.amount, 0)

          const totalValue = totalIncome - totalExpense
          groupedData.push({
            label: colStart.format(dateFormat),
            value: totalValue,
          })
        } else {
          const totalValue = chunkTransactions.reduce((total: number, t: any) => total + +t.amount, 0)
          groupedData.push({
            label: colStart.format(dateFormat),
            value: totalValue,
            type: selectedTransactionType,
          })
        }

        iterator.add(1, stepUnit)
      }

      setData(groupedData)
    }
  }, [
    chartPeriod,
    currency,
    dateRange,
    selectedChartType,
    selectedTransactionType,
    transactions,
    isIncludeTransfer,
    t,
  ])

  // previous time unit
  const handlePrevTimeUnit = useCallback(() => {
    const newDateRange = { ...dateRange }
    switch (chartPeriod) {
      case 'week':
        newDateRange.from = moment(dateRange.from).subtract(1, 'week').toDate()
        newDateRange.to = moment(dateRange.to).subtract(1, 'week').toDate()
        break
      case 'month':
        newDateRange.from = moment(dateRange.from).subtract(1, 'month').toDate()
        newDateRange.to = moment(dateRange.to).subtract(1, 'month').toDate()
        break
      case 'year':
        newDateRange.from = moment(dateRange.from).subtract(1, 'year').toDate()
        newDateRange.to = moment(dateRange.to).subtract(1, 'year').toDate()
        break
    }
    setDateRange(newDateRange)
  }, [chartPeriod, dateRange, setDateRange])

  // next time unit
  const handleNextTimeUnit = useCallback(() => {
    const newDateRange = { ...dateRange }
    // prevent going to the future
    if (moment(dateRange.from).add(1, chartPeriod).isAfter(moment())) {
      return
    }

    newDateRange.from = moment(dateRange.from).add(1, chartPeriod).toDate()
    newDateRange.to = moment(dateRange.to).add(1, chartPeriod).toDate()

    setDateRange(newDateRange)
  }, [chartPeriod, dateRange, setDateRange])

  // reset time unit
  const handleResetTimeUnit = useCallback(() => {
    setDateRange({
      from: moment().startOf(chartPeriod).toDate(),
      to: moment().endOf(chartPeriod).toDate(),
    })
  }, [chartPeriod])

  return (
    <View className={cn(className)}>
      {/* MARK: Top */}
      <View className="flex-row items-center justify-between">
        <Text className="pl-1 text-xl font-bold">{t('History')}</Text>
      </View>

      {/* MARK: Main */}
      <View className="shadow-md">
        <BlurView
          intensity={100}
          className="mt-21/2 overflow-hidden rounded-xl border border-primary/10 p-21/2"
        >
          {/* Period - Time Unit */}
          <HistoryHeader
            charts={charts}
            segment={chartPeriod}
            segments={timeUnits}
            onChangeSegment={(segment: string) => {
              setChartPeriod(segment as TimeUnit)
              setDateRange({
                from: moment()
                  .startOf(segment as TimeUnit)
                  .toDate(),
                to: moment()
                  .endOf(segment as TimeUnit)
                  .toDate(),
              })
            }}
            selected={selectedChartType}
            onSelect={(value: string) => setSelectedChartType(value as ChartType)}
          />

          {/* MARK: Time Range */}
          <View className="my-2 flex-row gap-21/2">
            <View className="flex-1 flex-row items-center gap-21/2 overflow-hidden">
              <Text className="text-lg font-semibold capitalize">
                {format(
                  new Date(dateRange.from),
                  isSameDay(dateRange.from, dateRange.to) ? 'MMM dd' : 'MMM dd, yyyy',
                  { locale: getLocale(locale) }
                )}
              </Text>
              <Text className="text-lg font-semibold">-</Text>
              <Text className="text-lg font-semibold capitalize">
                {format(new Date(dateRange.to), 'MMM dd, yyyy', { locale: getLocale(locale) })}
              </Text>
            </View>

            <TouchableOpacity
              className="rounded-full bg-primary/10 p-2"
              onPress={handleResetTimeUnit}
            >
              <Icon
                render={LucideRotateCw}
                size={18}
              />
            </TouchableOpacity>
          </View>

          {/* MARK: Total & Include Transfer */}
          <View className="flex-1 flex-shrink-0 flex-row items-start justify-between">
            <View className="flex-1">
              <Text className="font-semibold text-muted-foreground">
                {t('Total') + ' '}
                {selectedChartType !== 'pie' && (
                  <Text className={cn('capitalize', checkTranType(selectedTransactionType).color)}>
                    {t(selectedTransactionType)}
                  </Text>
                )}
              </Text>

              {currency && (
                <Text
                  className={cn(
                    'text-4xl font-bold',
                    selectedChartType !== 'pie' && checkTranType(selectedTransactionType).color
                  )}
                >
                  {formatCurrency(
                    currency,
                    data.reduce((total: number, item: any) => total + +item.value, 0)
                  )}
                </Text>
              )}
            </View>

            <View className="flex-row items-center gap-2">
              <Text
                className="text-right font-semibold"
                style={{ maxWidth: 120 }}
              >
                {t('Include transfers')}
              </Text>
              <Switch
                checked={isIncludeTransfer}
                onCheckedChange={() => setIsIncludeTransfer(!isIncludeTransfer)}
                className={cn(isIncludeTransfer ? 'bg-primary' : 'bg-muted-foreground')}
                style={{ transform: [{ scale: 0.9 }] }}
              />
            </View>
          </View>

          {/* MARK: Chart */}
          {!loading ? (
            <Chart
              data={data}
              transactionType={selectedTransactionType}
              chartType={selectedChartType}
              className="mt-21/2"
            />
          ) : (
            <Skeleton className="mt-21/2 h-[282px] w-full" />
          )}

          {/* MARK: Transaction Type */}
          <HistoryFooter
            className="mt-21"
            segments={transactionTypes}
            segment={selectedTransactionType}
            indicatorLabel={chartPeriod}
            next={handleNextTimeUnit}
            prev={handlePrevTimeUnit}
            onChange={(segment: string) => setSelectedTransactionType(segment as TransactionType)}
            hideSegments={selectedChartType == 'pie'}
            disabledNext={moment(dateRange.from).add(1, chartPeriod).isAfter(moment())}
            disabledPrev={moment(dateRange.from)
              .subtract(1, chartPeriod)
              .isSameOrBefore(moment(oldestDate || user?.createdAt).subtract(1, chartPeriod))}
          />
        </BlurView>
      </View>
    </View>
  )
}

export default memo(History)
