import DateRangePicker from '@/components/DateRangePicker'
import Icon from '@/components/Icon'
import Text from '@/components/Text'
import TransactionTypeGroup from '@/components/TransactionTypeGroup'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import WalletPicker from '@/components/WalletPicker'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { refetching } from '@/lib/reducers/loadReducer'
import { setTransactions } from '@/lib/reducers/transactionReducer'
import { toUTC } from '@/lib/time'
import { getMyTransactionsApi } from '@/requests'
import { IFullTransaction, IWallet } from '@/types/type'
import { useRouter } from 'expo-router'
import { LucideCalendarDays, LucideRefreshCw, LucideSearch, LucideX } from 'lucide-react-native'
import moment from 'moment-timezone'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SafeAreaView, ScrollView, View } from 'react-native'
import Toast from 'react-native-toast-message'

function TransactionsPage() {
  // hooks
  const dispatch = useAppDispatch()
  const { t: translate, i18n } = useTranslation()
  const t = (key: string) => translate('transactionPage.' + key)
  const tSuccess = (key: string) => translate('success.' + key)
  const tError = (key: string) => translate('error.' + key)
  const locale = i18n.language
  const router = useRouter()

  // store
  const { curWallet } = useAppSelector(state => state.wallet)
  const { transactions } = useAppSelector(state => state.transaction)
  const { refetching: rfc } = useAppSelector(state => state.load)

  // states
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: moment().startOf('month').toDate(),
    to: moment().endOf('month').toDate(),
  })
  const [wallet, setWallet] = useState<IWallet | null>(curWallet)
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState<string>('')

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
    }
  }, [dispatch, dateRange, wallet])

  // initial fetch
  useEffect(() => {
    getMyTransactions()
  }, [getMyTransactions, rfc])

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

  return (
    <SafeAreaView>
      <ScrollView>
        <View className="container pb-32">
          {/* MARK: Top */}
          <View className="flex flex-row flex-wrap items-center gap-x-2 gap-y-1 px-21/2 py-4 md:px-21">
            <Text className="text-lg font-bold">
              {t('Transactions')} <Text className="text-muted-foreground/50">{t('of wallet')}</Text>
            </Text>

            <WalletPicker
              wallet={wallet as IWallet}
              isAllowedAll
              onChange={(wallet: IWallet | null) => {
                setWallet(wallet)
                console.log('ssss', wallet)
              }}
            />
          </View>

          {/* MARK: Date Range */}
          <View className="mb-21/2 flex flex-row items-center justify-end gap-2 px-21/2 md:px-21">
            {/* Mark: Refresh */}
            <Button
              variant="outline"
              size="icon"
              className="group h-10 w-10"
              onPress={() => dispatch(refetching())}
            >
              <Icon
                render={LucideRefreshCw}
                size={18}
                className="trans-300 group-hover:rotate-180"
              />
            </Button>
            <DateRangePicker
              values={dateRange}
              update={({ from, to }) => setDateRange({ from, to })}
            />
          </View>

          {/* MARK: Search & Calendar */}
          <View className="mb-21/2 flex flex-row items-center justify-end gap-2 px-21/2 md:px-21">
            {/* Search */}
            <View
              className="relative flex w-full flex-1 flex-row overflow-hidden rounded-md shadow-sm"
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
              // onPress={() => router.push('/calendar', { locale })}
            >
              <Icon
                render={LucideCalendarDays}
                size={20}
              />
            </Button>
          </View>

          {/* MARK: Groups */}
          {!loading ? (
            <View className="flex flex-col gap-2 px-21/2 md:px-21">
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
          ) : (
            <View className="flex flex-col gap-2 px-21/2 md:px-21">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton
                  className="h-[300px]"
                  key={i}
                />
              ))}
            </View>
          )}

          {/* MARK: Create Transaction */}
          {/* <CreateTransactionDrawer
            initWallet={wallet || curWallet}
            trigger={
              <Button
                variant="default"
                className="fixed bottom-[calc(78px)] right-2 z-20 h-10 rounded-full xl:right-[calc(50%-640px+21px)]"
              >
                <LucidePlus size={24} />
                {t('Add Transaction')}
              </Button>
            }
          /> */}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default TransactionsPage
