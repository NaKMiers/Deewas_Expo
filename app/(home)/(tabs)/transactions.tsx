import DateRangeSegments from '@/components/DateRangeSegments'
import Icon from '@/components/Icon'
import { useAuth } from '@/components/providers/AuthProvider'
import Text from '@/components/Text'
import TransactionTypeGroup from '@/components/TransactionTypeGroup'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { refresh, setRefreshing } from '@/lib/reducers/loadReducer'
import { setSelectedWallet } from '@/lib/reducers/screenReducer'
import { setTransactions } from '@/lib/reducers/transactionReducer'
import { setStep } from '@/lib/reducers/tutorialReducer'
import { toUTC } from '@/lib/time'
import { cn, getAdmobId } from '@/lib/utils'
import { getMyTransactionsApi } from '@/requests'
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet'
import { router } from 'expo-router'
import {
  LucideCalendarDays,
  LucideChevronsUpDown,
  LucidePlus,
  LucideSearch,
  LucideX,
} from 'lucide-react-native'
import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RefreshControl, SafeAreaView, ScrollView, TouchableOpacity, View } from 'react-native'
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads'
import Toast from 'react-native-toast-message'

const adUnitId = getAdmobId('BANNER')

function TransactionsPage() {
  // hooks
  const { user, isPremium } = useAuth()
  const dispatch = useAppDispatch()
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('transactionsPage.' + key)
  const tError = useCallback((key: string) => translate('error.' + key), [translate])

  // store
  const { transactions } = useAppSelector(state => state.transaction)
  const { refreshing, refreshPoint } = useAppSelector(state => state.load)
  const { ofWallet, selectedWallet } = useAppSelector(state => state.screen)
  const { step, inProgress } = useAppSelector(state => state.tutorial)

  // states
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: moment().startOf('month').toDate(),
    to: moment().endOf('month').toDate(),
  })
  const [groups, setGroups] = useState<any[]>([])
  const [oldestDate, setOldestDate] = useState<Date | null>(null)
  const [search, setSearch] = useState<string>('')
  const [timeSegment, setTimeSegment] = useState<TimeUnit>('month')
  const [isFirstRender, setIsFirstRender] = useState<boolean>(true)
  const [isIncludeTransfer, setIsIncludeTransfer] = useState<boolean>(false)

  // ads states
  const [adLoaded, setAdLoaded] = useState<boolean>(false)

  // get my transactions of selected wallet
  const getMyTransactions = useCallback(async () => {
    let query = `?from=${toUTC(dateRange.from)}&to=${toUTC(dateRange.to)}&needOldestDate=true`
    if (ofWallet) query += `&wallet=${ofWallet._id}`

    try {
      const { transactions, oldestTransaction } = await getMyTransactionsApi(query)
      dispatch(setTransactions(transactions))

      if (oldestTransaction) {
        setOldestDate(moment(oldestTransaction.date).toDate())
      }
    } catch (err: any) {
      console.log(err)
      Toast.show({
        type: 'error',
        text1: tError('Failed to fetch transactions'),
      })
    } finally {
      // stop loading
      dispatch(setRefreshing(false))
      setIsFirstRender(false)
    }
  }, [dispatch, tError, dateRange, ofWallet])

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

      return key.includes(search.toLowerCase().trim())
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
          <View className="flex-row flex-wrap items-center gap-x-2.5 gap-y-1">
            <Text className="pl-1 text-xl font-bold">
              {t('Transactions')} <Text className="text-muted-foreground/50">{t('of')}</Text>
            </Text>

            <TouchableOpacity
              activeOpacity={0.7}
              className="h-12 flex-row items-center justify-between gap-2 rounded-lg border border-primary bg-white px-21/2"
              onPress={() => router.push('/wallet-picker?showAllOption=true')}
            >
              {ofWallet ? (
                <View className="flex-row items-center gap-2">
                  <Text className="text-base text-black">{ofWallet.icon}</Text>
                  <Text className="text-base font-semibold text-black">{ofWallet.name}</Text>
                </View>
              ) : (
                <Text className="text-base font-semibold text-black">{t('All wallets')}</Text>
              )}
              <Icon
                render={LucideChevronsUpDown}
                size={18}
                color="black"
              />
            </TouchableOpacity>
          </View>

          {/* MARK: Date Range */}
          <View className="mt-21/2 flex-row items-center justify-end gap-2">
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
                .isSameOrBefore(moment(oldestDate || user?.createdAt).subtract(1, timeSegment))}
            />
          </View>

          {/* MARK: Search & Calendar */}
          <View className="mt-21/2 flex-row items-center justify-end gap-2">
            {/* Search */}
            <View
              className="w-full flex-1 flex-row overflow-hidden rounded-lg border border-primary/10"
              style={{ height: 42 }}
            >
              <Button
                variant="outline"
                size="icon"
                className="border- flex-shrink-0 rounded-r-none border-0 border-r bg-secondary"
                style={{ width: 42, height: 42 }}
              >
                <Icon
                  render={LucideSearch}
                  size={18}
                />
              </Button>

              <Input
                className="flex-1 rounded-l-none bg-secondary pr-10 text-base !ring-0 md:text-sm"
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
              className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-primary/10 bg-secondary"
              onPress={() => router.push('/calendar')}
            >
              <Icon
                render={LucideCalendarDays}
                size={20}
              />
            </Button>
          </View>

          <View className="mt-2 flex-row items-center justify-end gap-2">
            <Text className="text-right font-semibold">{t('Include transfers')}</Text>
            <Switch
              checked={isIncludeTransfer}
              onCheckedChange={() => setIsIncludeTransfer(!isIncludeTransfer)}
              className={cn(isIncludeTransfer ? 'bg-primary' : 'bg-muted-foreground')}
              style={{ transform: [{ scale: 0.9 }] }}
            />
          </View>

          {isFirstRender ? (
            <View className="mt-21/2 flex-col gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton
                  className="h-[300px]"
                  key={i}
                />
              ))}
            </View>
          ) : (
            <View className="mt-21/2 flex-col gap-2">
              {groups.length > 0 ? (
                groups.map(([type, group]) => (
                  <TransactionTypeGroup
                    type={type}
                    categoryGroups={Object.entries(group).map(g => g[1])}
                    includeTransfers={isIncludeTransfer}
                    key={type}
                  />
                ))
              ) : (
                <View className="flex-row items-center justify-center rounded-md border border-muted-foreground/50 px-2 py-7">
                  <Text className="text-center text-lg font-semibold text-muted-foreground/50">
                    {t('No transactions found for this wallet, just add one now!')}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* MARK: Groups */}
        </View>

        <Separator className="my-24 h-0" />
      </ScrollView>

      {/* MARK: Create Transaction */}
      {inProgress && (step === 4 || step === 6) && <View className="absolute z-10 h-screen w-screen" />}
      <View
        className="absolute right-21/2 z-20 items-end"
        style={{ bottom: 10 }}
      >
        <View
          className={cn(
            inProgress && step === 4 && 'right-0 rounded-lg border-2 border-sky-500 bg-sky-500/10 p-21/2'
          )}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              dispatch(setSelectedWallet(selectedWallet))
              inProgress && step === 4 ? dispatch(setStep(5)) : router.push('/create-transaction')
            }}
            className="h-11 flex-row items-center justify-center gap-1 rounded-full bg-primary px-4"
          >
            <Icon
              render={LucidePlus}
              size={20}
              reverse
            />
            <Text className="font-semibold text-secondary">{t('Add Transaction')}</Text>
          </TouchableOpacity>
        </View>

        {/* MARK: Banner Ads */}
        {!isPremium && (
          <View
            className="max-h-[60px4 mt-4 flex-row items-center justify-center gap-1 overflow-hidden rounded-lg bg-primary"
            style={{ width: SCREEN_WIDTH - 21 }}
          >
            <BannerAd
              unitId={adUnitId}
              size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
              onAdLoaded={() => setAdLoaded(true)}
              onAdFailedToLoad={() => setAdLoaded(false)}
              onAdClosed={() => setAdLoaded(false)}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

export default TransactionsPage
