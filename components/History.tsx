import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { setRefreshing } from '@/lib/reducers/loadReducer'
import { capitalize, checkTranType, formatCurrency, parseCurrency } from '@/lib/string'
import { toUTC } from '@/lib/time'
import { cn } from '@/lib/utils'
import { getHistoryApi } from '@/requests'
import SegmentedControl from '@react-native-segmented-control/segmented-control'
import { isSameDay } from 'date-fns'
import { LucideRotateCw } from 'lucide-react-native'
import moment from 'moment-timezone'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TouchableOpacity, View } from 'react-native'
import Chart from './Chart'
import HistoryFooter from './HistoryFooter'
import Icon from './Icon'
import { useAuth } from './providers/AuthProvider'
import Text from './Text'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Skeleton } from './ui/skeleton'

interface HistoryProps {
  className?: string
}

// chart types
const charts: ChartType[] = ['bar', 'line', 'pie', 'radar', 'pyramid']
const transactionTypes: TransactionType[] = ['balance', 'income', 'expense', 'saving', 'invest']
const timeUnits: TimeUnit[] = ['week', 'month', 'year']

export default function History({ className }: HistoryProps) {
  // hooks
  const { user } = useAuth()
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('history.' + key)
  const dispatch = useAppDispatch()

  // store
  const { refreshPoint } = useAppSelector(state => state.load)
  const currency = useAppSelector(state => state.settings.settings?.currency)

  // states
  const [transactions, setTransactions] = useState<IFullTransaction[]>([])
  const [data, setData] = useState<any[]>([])
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: moment().startOf('month').toDate(),
    to: moment().endOf('month').toDate(),
  })
  const [selectChartType, setSelectedChartType] = useState<ChartType>(charts[0])
  const [selectedTransactionType, setSelectedTransactionType] = useState<TransactionType>('expense')
  const [chartPeriod, setChartPeriod] = useState<TimeUnit>('month')
  const [loading, setLoading] = useState<boolean>(false)

  // get history
  const getHistory = useCallback(async () => {
    if (!user) return

    // start loading
    setLoading(true)

    try {
      const from = toUTC(dateRange.from)
      const to = toUTC(dateRange.to)

      const { transactions } = await getHistoryApi(`?from=${from}&to=${to}`)
      setTransactions(transactions)
    } catch (err: any) {
      console.log(err)
    } finally {
      // stop loading
      setLoading(false)
      dispatch(setRefreshing(false))
    }
  }, [user, dateRange])

  // initially get history
  useEffect(() => {
    getHistory()
  }, [getHistory, refreshPoint])

  // auto update chart data
  useEffect(() => {
    if (!transactions.length || !currency) return

    // filter by selected transaction type
    const filteredTransactions = transactions.filter(t => t.type === selectedTransactionType)

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
      const totalValue = chunkTransactions.reduce(
        (total: number, transaction: any) => total + transaction.amount,
        0
      )

      groupedData.push({
        label: colStart.format(dateFormat),
        value: parseCurrency(formatCurrency(currency, totalValue)),
      })

      iterator.add(1, stepUnit)
    }

    setData(groupedData)
  }, [transactions, dateRange, currency, selectedTransactionType, chartPeriod, setData, setTransactions])

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
    switch (chartPeriod) {
      case 'week':
        newDateRange.from = moment(dateRange.from).add(1, 'week').toDate()
        newDateRange.to = moment(dateRange.to).add(1, 'week').toDate()
        break
      case 'month':
        newDateRange.from = moment(dateRange.from).add(1, 'month').toDate()
        newDateRange.to = moment(dateRange.to).add(1, 'month').toDate()
        break
      case 'year':
        newDateRange.from = moment(dateRange.from).add(1, 'year').toDate()
        newDateRange.to = moment(dateRange.to).add(1, 'year').toDate()
        break
    }
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
      {/* Top */}
      <View className="flex flex-row items-center justify-between">
        <Text className="pl-1 text-xl font-bold">{t('History')}</Text>
      </View>

      {/* Main */}
      {!loading ? (
        <View className="mt-21/2 rounded-lg bg-secondary p-21/2 shadow-md">
          {/* Period - Time Unit */}
          <View className="flex flex-row items-center justify-between gap-21/2 md:gap-21">
            <SegmentedControl
              values={timeUnits.map(s => capitalize(s))}
              style={{ width: '100%', height: 34, flex: 1 }}
              selectedIndex={timeUnits.indexOf(chartPeriod)}
              onChange={event => {
                const index = event.nativeEvent.selectedSegmentIndex
                setChartPeriod(timeUnits[index])
                setDateRange({
                  from: moment().startOf(timeUnits[index]).toDate(),
                  to: moment().endOf(timeUnits[index]).toDate(),
                })
              }}
            />
            <Select
              value={{ label: selectChartType, value: selectChartType }}
              onValueChange={option =>
                setSelectedChartType((option?.value as ChartType) || selectChartType)
              }
            >
              <SelectTrigger
                className="flex h-10 flex-row items-center justify-center rounded-xl shadow-md"
                style={{ height: 36 }}
              >
                <SelectValue
                  placeholder="Select Chart"
                  className="font-semibold capitalize text-primary"
                />
              </SelectTrigger>
              <SelectContent className="mt-1 shadow-none">
                {charts.map(chart => (
                  <SelectItem
                    value={chart}
                    label={capitalize(t(chart))}
                    key={chart}
                  />
                ))}
              </SelectContent>
            </Select>
          </View>

          {/* Time Range */}
          <View className="my-2 flex flex-row items-center gap-21/2">
            <View className="flex flex-row items-center gap-21/2">
              <Text className="text-lg font-semibold">
                {moment(dateRange.from).format(
                  isSameDay(dateRange.from, dateRange.to) ? 'MMM DD' : 'MMM DD, YYYY'
                )}
              </Text>
              <Text className="text-lg font-semibold">-</Text>
              <Text className="text-lg font-semibold">
                {moment(dateRange.to).format('MMM DD, YYYY')}
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

          <Text className="font-semibold text-muted-foreground">
            {t('Total') + ' '}
            <Text className={cn('capitalize', checkTranType(selectedTransactionType).color)}>
              {t(selectedTransactionType)}
            </Text>
          </Text>

          {currency && (
            <Text className={cn('text-4xl font-bold', checkTranType(selectedTransactionType).color)}>
              {formatCurrency(
                currency,
                data.reduce((total: number, item: any) => total + item.value, 0)
              )}
            </Text>
          )}

          {/* Chart */}
          <Chart
            data={data}
            transactionType={selectedTransactionType}
            chartType={selectChartType}
            className="mt-21/2"
          />

          {/* Footer */}
          <HistoryFooter
            className="mt-21/2"
            segments={transactionTypes}
            segment={selectedTransactionType}
            indicatorLabel={t(chartPeriod)}
            next={handleNextTimeUnit}
            prev={handlePrevTimeUnit}
            onChange={(segment: string) => setSelectedTransactionType(segment as TransactionType)}
          />
        </View>
      ) : (
        <Skeleton className="mt-21/2 h-[400px]" />
      )}
    </View>
  )
}
