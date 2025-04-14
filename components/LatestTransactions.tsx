import UpdateTransactionDrawer from '@/components/dialogs/UpdateTransactionDrawer'
import { currencies } from '@/constants/settings'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { refresh, setRefreshing } from '@/lib/reducers/loadReducer'
import { checkTranType, formatCurrency } from '@/lib/string'
import { formatDate, toUTC } from '@/lib/time'
import { cn } from '@/lib/utils'
import { createTransactionApi, deleteTransactionApi, getMyTransactionsApi } from '@/requests'
import { router } from 'expo-router'
import {
  LucideChevronDown,
  LucideChevronUp,
  LucideEllipsisVertical,
  LucideLayers2,
  LucidePencil,
  LucideTrash,
} from 'lucide-react-native'
import moment from 'moment-timezone'
import { memo, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, TouchableOpacity, View } from 'react-native'
import Toast from 'react-native-toast-message'
import ConfirmDialog from './dialogs/ConfirmDialog'
import Icon from './Icon'
import NoItemsFound from './NoItemsFound'
import { useAuth } from './providers/AuthProvider'
import Text from './Text'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Skeleton } from './ui/skeleton'

interface LatestTransactionsProps {
  className?: string
}

function LatestTransactions({ className }: LatestTransactionsProps) {
  // hooks
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const { t: translate, i18n } = useTranslation()
  const t = (key: string) => translate('latestTransactions.' + key)
  const tSuccess = (key: string) => translate('success.' + key)
  const tError = (key: string) => translate('error.' + key)

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
  }, [user, limit])

  // get latest transactions
  useEffect(() => {
    getLatestTransactions()
  }, [getLatestTransactions, refreshPoint])

  return (
    <View className={cn(className)}>
      {/* Top */}
      <View className='flex flex-row items-center justify-between gap-1'>
        <View className='flex flex-row items-center gap-2'>
          <Text className='pl-1 text-xl font-bold'>{t('Latest')}</Text>

          <Select
            onValueChange={option => option?.value && setLimit(option.value)}
            defaultValue={{ value: '10', label: '10' }}
          >
            <SelectTrigger
              className='flex h-10 max-w-max flex-row items-center justify-center gap-1.5 rounded-md bg-secondary text-sm shadow-md'
              style={{
                height: 36,
              }}
            >
              <SelectValue className='font-semibold text-primary' placeholder={limit} />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 30, 50, 100].map(value => (
                <SelectItem value={value.toString()} label={value.toString()} key={value} />
              ))}
            </SelectContent>
          </Select>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          className='flex h-8 flex-row items-center justify-center rounded-md border border-border bg-secondary px-4 font-semibold shadow-md'
          // onPress={() => router.push('/transactions')}
          style={{ height: 36 }}
        >
          <Text className='font-semibold'>{t('All')}</Text>
        </TouchableOpacity>
      </View>

      {/* MARK: Transaction List */}
      {!loading ? (
        <View className='mt-21/2 flex flex-col gap-2 rounded-lg bg-secondary p-21/2 shadow-md'>
          {transactions.slice(0, +limit).length > 0 ? (
            transactions.slice(0, +limit).map((tx, index) => (
              <View key={tx._id}>
                <Transaction
                  transaction={tx}
                  update={(transaction: IFullTransaction) => {
                    setTransactions(transactions.map(t => (t._id === transaction._id ? transaction : t)))
                    dispatch(refresh())
                  }}
                  refresh={() => dispatch(refresh())}
                />
              </View>
            ))
          ) : (
            <NoItemsFound text={t('No transactions found')} />
          )}
        </View>
      ) : (
        <Skeleton className='mt-21/2 h-[468px]' />
      )}
    </View>
  )
}

export default memo(LatestTransactions)

interface TransactionProps {
  transaction: IFullTransaction
  update?: (transaction: IFullTransaction) => void
  remove?: (transaction: IFullTransaction) => void
  refresh?: () => void
  className?: string
}

export function Transaction({ transaction, update, remove, refresh, className }: TransactionProps) {
  // hooks
  const { t: translate } = useTranslation()
  const t = (value: string) => translate('transaction.' + value)
  const tSuccess = (value: string) => translate('success.' + value)
  const tError = (value: string) => translate('error.' + value)

  // store
  const currency = useAppSelector(state => state.settings.settings?.currency)

  // states
  const [deleting, setDeleting] = useState<boolean>(false)
  const [duplicating, setDuplicating] = useState<boolean>(false)

  // values
  const { color, hex } = checkTranType(transaction.type)

  // delete transaction
  const handleDeleteTransaction = useCallback(async () => {
    // start loading
    setDuplicating(true)

    try {
      const { transaction: tx } = await deleteTransactionApi(transaction._id)
      Toast.show({
        type: 'success',
        text1: tSuccess('Transaction deleted'),
      })

      if (remove) remove(tx)
      if (refresh) refresh()
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: tError('Failed to delete transaction'),
      })
      console.log(err)
    } finally {
      // stop loading
      setDuplicating(false)
    }
  }, [remove, refresh, transaction._id, t])

  // duplicate transaction
  const handleDuplicateTransaction = useCallback(async () => {
    // start loading
    setDeleting(true)

    try {
      const { transaction: tx, message } = await createTransactionApi({
        ...transaction,
        walletId: transaction.wallet._id,
        categoryId: transaction.category._id,
        date: toUTC(moment().toDate()),
      })

      Toast.show({
        type: 'success',
        text1: tSuccess('Transaction duplicated'),
      })
      if (refresh) refresh()
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: tError('Failed to duplicate transaction'),
      })
      console.log(err)
    } finally {
      // stop loading
      setDeleting(false)
    }
  }, [refresh, transaction, t])

  return (
    <View className={cn('flex w-full flex-row items-start justify-between gap-2', className)}>
      {/* Icon */}
      <Text className='text-2xl'>{transaction.category.icon}</Text>

      {/* Content */}
      <View className='flex flex-1 flex-row items-center justify-between gap-2'>
        {/* MARK: Left */}
        <View className='flex flex-1 flex-col'>
          <Text className='text-sm font-semibold tracking-wide text-muted-foreground'>
            {transaction.category.name}
          </Text>

          <View className='flex flex-row flex-wrap items-center gap-x-2'>
            <Text className='line-clamp-1 max-w-[200px] text-ellipsis text-base font-semibold'>
              {transaction.name}
            </Text>
          </View>
        </View>

        {/* MARK: Right */}
        <View className='flex flex-row items-center gap-1'>
          {currency && (
            <View className='flex flex-col items-end'>
              <Text className='text-sm text-muted-foreground'>
                {formatDate(
                  moment(transaction.date).toDate(),
                  currencies.find(c => c.value === currency)?.locale
                )}
              </Text>
              <View className={cn('flex flex-row items-center gap-1')}>
                {transaction.type === 'expense' ? (
                  <Icon render={LucideChevronDown} size={16} color={hex} />
                ) : (
                  <Icon render={LucideChevronUp} size={16} color={hex} />
                )}
                <Text className={cn('text-base font-semibold', color)}>
                  {formatCurrency(currency, transaction.amount)}
                </Text>
              </View>
            </View>
          )}

          {/* Dropdown */}
          {!deleting && !duplicating ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='icon' className='w-9'>
                  <Icon render={LucideEllipsisVertical} size={20} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {/* MARK: Duplicate */}
                <ConfirmDialog
                  label={t('Duplicate Transaction')}
                  desc={t('Are you sure you want to duplicate this transaction?')}
                  confirmLabel={t('Duplicate')}
                  cancelLabel={t('Cancel')}
                  onConfirm={handleDuplicateTransaction}
                  trigger={
                    <Button
                      variant='ghost'
                      className='flex w-full flex-row items-center justify-start gap-2 px-2'
                    >
                      <Icon render={LucideLayers2} size={16} color='#8b5cf6' />
                      <Text className='font-semibold text-violet-500'>{t('Duplicate')}</Text>
                    </Button>
                  }
                />

                {/* MARK: Update */}
                <UpdateTransactionDrawer
                  transaction={transaction}
                  update={update}
                  refresh={refresh}
                  trigger={
                    <View className='flex h-10 w-full flex-row items-center justify-start gap-2 px-4'>
                      <Icon render={LucidePencil} size={16} color='#0ea5e9' />
                      <Text className='font-semibold text-sky-500'>{t('Edit')}</Text>
                    </View>
                  }
                  reach={3}
                />

                {/* MARK: Delete */}
                <ConfirmDialog
                  label={t('Delete Transaction')}
                  desc={t('Are you sure you want to delete this transaction?')}
                  confirmLabel='Delete'
                  onConfirm={handleDeleteTransaction}
                  trigger={
                    <Button
                      variant='ghost'
                      className='flex w-full flex-row items-center justify-start gap-2 px-2'
                    >
                      <Icon render={LucideTrash} size={16} color='#f43f5e' />
                      <Text className='font-semibold text-rose-500'>{t('Delete')}</Text>
                    </Button>
                  }
                />
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <View className='flex h-9 w-9 flex-row items-center justify-center'>
              <ActivityIndicator />
            </View>
          )}
        </View>
      </View>
    </View>
  )
}
