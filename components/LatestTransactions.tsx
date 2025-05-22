import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { refresh, setRefreshing } from '@/lib/reducers/loadReducer'
import { cn } from '@/lib/utils'
import { getMyTransactionsApi } from '@/requests'
import { memo, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import Toast from 'react-native-toast-message'
import BlurView from './BlurView'
import NoItemsFound from './NoItemsFound'
import { useAuth } from './providers/AuthProvider'
import Text from './Text'
import Transaction from './Transaction'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Skeleton } from './ui/skeleton'

interface LatestTransactionsProps {
  className?: string
}

function LatestTransactions({ className }: LatestTransactionsProps) {
  // hooks
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('latestTransactions.' + key)
  const tError = useCallback((key: string) => translate('error.' + key), [translate])

  // store
  const { refreshPoint } = useAppSelector(state => state.load)

  // states
  const [transactions, setTransactions] = useState<IFullTransaction[]>([])
  const [limit, setLimit] = useState<string>('10')
  const [loading, setLoading] = useState<boolean>(false)

  const getLatestTransactions = useCallback(async () => {
    if (!user) return

    // start loading
    setLoading(true)

    try {
      const { transactions } = await getMyTransactionsApi(
        `?sort=date|-1&sort=createdAt|-1&limit=${limit}`
      )
      setTransactions(transactions)
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: tError('Failed to fetch transactions'),
      })
      console.log(err)
    } finally {
      // stop loading
      setLoading(false)
      dispatch(setRefreshing(false))
    }
  }, [dispatch, tError, user, limit])

  // get latest transactions
  useEffect(() => {
    getLatestTransactions()
  }, [getLatestTransactions, refreshPoint])

  return (
    <View className={cn(className)}>
      {/* Top */}
      <View className="flex-row items-center justify-between gap-1">
        <View className="flex-row items-center gap-2">
          <Text className="pl-1 text-xl font-bold">{t('Latest')}</Text>

          <Select
            onValueChange={option => option?.value && setLimit(option.value)}
            defaultValue={{ value: '10', label: '10' }}
          >
            <SelectTrigger
              className="h-10 max-w-max flex-row items-center justify-center gap-1.5 rounded-md bg-secondary text-sm shadow-md"
              style={{
                height: 36,
              }}
            >
              <SelectValue
                className="font-semibold text-primary"
                placeholder={limit}
              />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 30, 50, 100].map(value => (
                <SelectItem
                  value={value.toString()}
                  label={value.toString()}
                  key={value}
                />
              ))}
            </SelectContent>
          </Select>
        </View>
      </View>

      {/* MARK: Transaction List */}
      {!loading ? (
        <View className="shadow-md">
          <BlurView
            intensity={90}
            className="mt-21/2 flex-col gap-2 overflow-hidden rounded-xl border border-primary/10 p-21/2 shadow-md"
          >
            {transactions.slice(0, +limit).length > 0 ? (
              transactions.slice(0, +limit).map(tx => (
                <View key={tx._id}>
                  <Transaction
                    transaction={tx}
                    refresh={() => dispatch(refresh())}
                  />
                </View>
              ))
            ) : (
              <NoItemsFound text={t('No transactions found')} />
            )}
          </BlurView>
        </View>
      ) : (
        <Skeleton className="mt-21/2 h-[468px]" />
      )}
    </View>
  )
}

export default memo(LatestTransactions)
