import DateRangeSegments from '@/components/DateRangeSegments'
import CreateTransactionDrawer from '@/components/dialogs/CreateTransactionDrawer'
import Icon from '@/components/Icon'
import { useAuth } from '@/components/providers/AuthProvider'
import Text from '@/components/Text'
import TransactionTypeGroup from '@/components/TransactionTypeGroup'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import WalletPicker from '@/components/WalletPicker'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { refresh, setRefreshing } from '@/lib/reducers/loadReducer'
import { setTransactions } from '@/lib/reducers/transactionReducer'
import { toUTC } from '@/lib/time'
import { getMyTransactionsApi } from '@/requests'
import { router } from 'expo-router'
import { LucideCalendarDays, LucidePlus, LucideSearch, LucideX } from 'lucide-react-native'
import moment from 'moment-timezone'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RefreshControl, SafeAreaView, ScrollView, View } from 'react-native'
import Toast from 'react-native-toast-message'

function TransactionsPage() {
  // hooks
  const { user } = useAuth()
  const dispatch = useAppDispatch()
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('transactionPage.' + key)
  const tError = (key: string) => translate('error.' + key)

  // store
  const { curWallet } = useAppSelector(state => state.wallet)
  const { transactions } = useAppSelector(state => state.transaction)
  const { refreshing, refreshPoint } = useAppSelector(state => state.load)

  // states
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: moment().startOf('month').toDate(),
    to: moment().endOf('month').toDate(),
  })
  const [wallet, setWallet] = useState<IWallet | null>(curWallet)
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState<string>('')
  const [timeSegment, setTimeSegment] = useState<TimeUnit>('month')
  const [isFirstRender, setIsFirstRender] = useState<boolean>(true)

  useEffect(() => {
    if (curWallet) setWallet(curWallet)
  }, [curWallet])

  // get my transactions of selected wallet
  const getMyTransactions = useCallback(async () => {
    let query = `?from=${toUTC(dateRange.from)}&to=${toUTC(dateRange.to)}`
    if (wallet) query += `&wallet=${wallet._id}`

    // start loading
    setLoading(true)

    try {
      const { transactions } = await getMyTransactionsApi(query)
      dispatch(setTransactions(transactions))
    } catch (err: any) {
      console.log(err)
      Toast.show({
        type: 'error',
        text1: tError('Failed to fetch transactions'),
      })
    } finally {
      // stop loading
      setLoading(false)
      dispatch(setRefreshing(false))
      setIsFirstRender(false)
    }
  }, [dispatch, dateRange, wallet])

  // initial fetch
  useEffect(() => {
    getMyTransactions()
  }, [getMyTransactions, refreshPoint])

  // auto group categories by type
  useEffect(() => {
    const groups: any = {}

    const filteredTransactions = transactions.filter((transaction: IFullTransaction) => {
      const { category, name, type, amount } = transaction
      const key = (category.name + category.icon + name + type + amount).toLowerCase()

      return key.includes(search.toLowerCase())
    })

    filteredTransactions.forEach((transaction: IFullTransaction) => {
      const type = transaction.type

      if (!groups[type]) {
        groups[type] = []
      }

      groups[type].push(transaction)
    })

    for (const type in groups) {
      const categoryGroups: any = {}

      groups[type].forEach((transaction: IFullTransaction) => {
        const category = transaction.category._id

        if (!categoryGroups[category]) {
          categoryGroups[category] = {
            category: transaction.category,
            transactions: [],
          }
        }

        categoryGroups[category].transactions.push(transaction)
      })

      groups[type] = categoryGroups
    }

    setGroups(Object.entries(groups))
  }, [transactions, search])

  // previous time unit
  const handlePrevTimeUnit = useCallback(() => {
    const newDateRange = { ...dateRange }
    switch (timeSegment) {
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
  }, [timeSegment, dateRange, setDateRange])

  // next time unit
  const handleNextTimeUnit = useCallback(() => {
    const newDateRange = { ...dateRange }
    switch (timeSegment) {
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
  }, [timeSegment, dateRange, setDateRange])

  // reset time unit
  const handleResetTimeUnit = useCallback(() => {
    setDateRange({
      from: moment().startOf(timeSegment).toDate(),
      to: moment().endOf(timeSegment).toDate(),
    })
  }, [timeSegment])

  return (
    <SafeAreaView className="flex-1">
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => dispatch(refresh())}
          />
        }
      >
        <View className="p-21/2 md:p-21">
          {/* MARK: Top */}
          <View className="flex flex-row flex-wrap items-center gap-x-2.5 gap-y-1">
            <Text className="pl-1 text-xl font-bold">
              {t('Transactions')} <Text className="text-muted-foreground/50">{t('of')}</Text>
            </Text>

            <WalletPicker
              wallet={wallet as IWallet}
              isAllowedAll
              onChange={(wallet: IWallet | null) => setWallet(wallet)}
            />
          </View>

          {/* MARK: Date Range */}
          <View className="mt-21/2 flex flex-row items-center justify-end gap-2">
            <DateRangeSegments
              segments={['week', 'month', 'year']}
              segment={timeSegment}
              onChangeSegment={(segment: string) => {
                setTimeSegment(segment as TimeUnit)
                setDateRange({
                  from: moment()
                    .startOf(segment as TimeUnit)
                    .toDate(),
                  to: moment()
                    .endOf(segment as TimeUnit)
                    .toDate(),
                })
              }}
              dateRange={dateRange}
              indicatorLabel={timeSegment}
              reset={handleResetTimeUnit}
              next={handleNextTimeUnit}
              prev={handlePrevTimeUnit}
              disabledNext={moment(dateRange.from).add(1, timeSegment).isAfter(moment())}
              disabledPrev={moment(dateRange.from)
                .subtract(1, timeSegment)
                .isBefore(moment(user?.createdAt).subtract(1, timeSegment))}
            />
          </View>

          {/* MARK: Search & Calendar */}
          <View className="mt-21/2 flex flex-row items-center justify-end gap-2">
            {/* Search */}
            <View
              className="flex w-full flex-1 flex-row"
              style={{ height: 42 }}
            >
              <Button
                variant="outline"
                size="icon"
                className="flex-shrink-0 rounded-r-none"
                style={{ width: 42, height: 42 }}
              >
                <Icon
                  render={LucideSearch}
                  size={18}
                />
              </Button>

              <Input
                className="flex-1 rounded-l-none border border-l-0 pr-10 text-base !ring-0 md:text-sm"
                placeholder={t('Search') + '...'}
                value={search}
                onChangeText={value => setSearch(value)}
              />

              {search.trim() && (
                <Button
                  variant="ghost"
                  className="absolute right-0 top-1/2 -translate-y-1/2"
                  size="icon"
                  onPress={() => setSearch('')}
                >
                  <Icon render={LucideX} />
                </Button>
              )}
            </View>

            {/* Calendar */}
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 flex-shrink-0"
              onPress={() => router.push('/calendar')}
            >
              <Icon
                render={LucideCalendarDays}
                size={20}
              />
            </Button>
          </View>

          {isFirstRender ? (
            <View className="mt-21/2 flex flex-col gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton
                  className="h-[300px]"
                  key={i}
                />
              ))}
            </View>
          ) : (
            <View className="mt-21/2 flex flex-col gap-2">
              {groups.length > 0 ? (
                groups.map(([type, group]) => (
                  <TransactionTypeGroup
                    type={type}
                    categoryGroups={Object.entries(group).map(g => g[1])}
                    key={type}
                  />
                ))
              ) : (
                <View className="flex flex-row items-center justify-center rounded-md border border-muted-foreground/50 px-2 py-7">
                  <Text className="text-center text-lg font-semibold text-muted-foreground/50">
                    {t('No transactions found for this wallet, just add one now!')}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* MARK: Groups */}
        </View>

        <Separator className="my-16 h-0" />
      </ScrollView>

      {/* MARK: Create Transaction */}
      <CreateTransactionDrawer
        initWallet={wallet || curWallet}
        refresh={() => dispatch(refresh())}
        trigger={
          <View className="absolute bottom-2.5 right-21/2 z-20 flex h-11 flex-row items-center justify-center gap-1 rounded-full bg-primary px-4">
            <Icon
              render={LucidePlus}
              size={20}
              reverse
            />
            <Text className="font-semibold text-secondary">{t('Add Transaction')}</Text>
          </View>
        }
        reach={3}
      />
    </SafeAreaView>
  )
}

export default TransactionsPage
