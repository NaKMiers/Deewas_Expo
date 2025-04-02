'use client'

import { currencies } from '@/constants/settings'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { refetching } from '@/lib/reducers/loadReducer'
import { checkTranType, formatCurrency } from '@/lib/string'
import { formatDate, toUTC } from '@/lib/time'
import { cn } from '@/lib/utils'
import { createTransactionApi, deleteTransactionApi, getMyTransactionsApi } from '@/requests'
import { IFullTransaction } from '@/types/type'
import { useRouter } from 'expo-router'
import { LucideChevronDown, LucideChevronUp } from 'lucide-react-native'
import moment from 'moment-timezone'
import { memo, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import Toast from 'react-native-toast-message'
import Icon from './Icon'
import NoItemsFound from './NoItemsFound'
import { useAuth } from './providers/AuthProvider'
import Text from './Text'
import { Button } from './ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

interface LatestTransactionsProps {
  className?: string
}

function LatestTransactions({ className = '' }: LatestTransactionsProps) {
  // hooks
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const { t: translate, i18n } = useTranslation()
  const t = (key: string) => translate('latestTransactions.' + key)
  const tSuccess = (key: string) => translate('success.' + key)
  const tError = (key: string) => translate('error.' + key)

  // store
  const { refetching: rfc } = useAppSelector(state => state.load)

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
    }
  }, [user, limit])

  // get latest transactions
  useEffect(() => {
    getLatestTransactions()
  }, [getLatestTransactions, rfc])

  return (
    <View className={cn('px-21/2 md:px-21', className)}>
      {/* Top */}
      <View className="flex flex-row items-center justify-between gap-1">
        <View className="flex flex-row items-center gap-2">
          <Text className="text-lg font-bold">{t('Latest')}</Text>

          <Select
            onValueChange={option => {
              if (option?.value) {
                setLimit(option.value)
              }
            }}
            defaultValue={{
              value: '10',
              label: '10',
            }}
          >
            <SelectTrigger className="h-8 max-w-max gap-1.5 text-sm">
              <SelectValue
                className="text-primary"
                placeholder="Select..."
              />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 30, 50, 100].map(value => (
                <SelectItem
                  value={value.toString()}
                  label={value.toString()}
                  className="cursor-pointer"
                  key={value}
                />
              ))}
            </SelectContent>
          </Select>
        </View>

        <Button
          variant="link"
          className="h-8"
          onPress={() => router.push('/transactions')}
        >
          <Text>{t('All')}</Text>
        </Button>
      </View>

      {/* MARK: Transaction List */}
      <View className="mt-2 flex flex-col gap-2 rounded-lg border border-secondary p-21/2">
        {transactions.slice(0, +limit).length > 0 ? (
          transactions.slice(0, +limit).map((tx, index) => (
            <View key={tx._id}>
              <Transaction
                transaction={tx}
                update={(transaction: IFullTransaction) => {
                  setTransactions(transactions.map(t => (t._id === transaction._id ? transaction : t)))
                  dispatch(refetching())
                }}
                refetch={() => getLatestTransactions()}
              />
            </View>
          ))
        ) : (
          <NoItemsFound text={t('No transactions found')} />
        )}
      </View>
    </View>
  )
}

export default memo(LatestTransactions)

interface TransactionProps {
  transaction: IFullTransaction
  update?: (transaction: IFullTransaction) => void
  remove?: (transaction: IFullTransaction) => void
  refetch?: () => void
  className?: string
}

export function Transaction({ transaction, update, remove, refetch, className = '' }: TransactionProps) {
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
      const { transaction: tx, message } = await deleteTransactionApi(transaction._id)
      Toast.show({
        type: 'success',
        text1: tSuccess('Transaction deleted'),
      })

      if (remove) remove(tx)
      if (refetch) refetch()
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
  }, [remove, refetch, transaction._id, t])

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
      if (refetch) refetch()
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
  }, [refetch, transaction, t])

  return (
    <View className={cn('flex w-full flex-row items-start justify-between gap-2', className)}>
      {/* Icon */}
      <Text className="text-2xl">{transaction.category.icon}</Text>

      {/* Content */}
      <View className="flex flex-1 flex-row items-center justify-between gap-2">
        {/* MARK: Left */}
        <View className="flex flex-col">
          <Text className="text-sm font-semibold tracking-wide text-muted-foreground">
            {transaction.category.name}
          </Text>

          <View className="flex flex-row flex-wrap items-center gap-x-2">
            <Text className="font-semibold">{transaction.name}</Text>
          </View>
        </View>

        {/* MARK: Right */}
        <View className="flex flex-row items-center gap-1">
          {currency && (
            <View className="flex flex-col items-end">
              <Text className="text-xs text-muted-foreground">
                {formatDate(
                  moment(transaction.date).toDate(),
                  currencies.find(c => c.value === currency)?.locale
                )}
              </Text>
              <View className={cn('flex flex-row items-center gap-1')}>
                {transaction.type === 'expense' ? (
                  <Icon
                    render={LucideChevronDown}
                    size={16}
                    color={hex}
                  />
                ) : (
                  <Icon
                    render={LucideChevronUp}
                    size={16}
                    color={hex}
                  />
                )}
                <Text className={cn('text-sm font-semibold', color)}>
                  {formatCurrency(currency, transaction.amount)}
                </Text>
              </View>
            </View>
          )}

          {/* {!deleting && !duplicating ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                >
                  <Icon render={LucideEllipsisVertical} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <ConfirmDialog
                  label={t('Duplicate Transaction')}
                  desc={t('Are you sure you want to duplicate this transaction?')}
                  confirmLabel={t('Duplicate')}
                  cancelLabel={t('Cancel')}
                  onConfirm={handleDuplicateTransaction}
                  trigger={
                    <Button
                      variant="ghost"
                      className="flex flex-row h-8 w-full items-center justify-start gap-2 px-2 text-violet-500"
                    >
                      <LucideLayers2 size={16} />
                      {t('Duplicate')}
                    </Button>
                  }
                />

                <UpdateTransactionDrawer
                  transaction={transaction}
                  update={update}
                  refetch={refetch}
                  trigger={
                    <Button
                      variant="ghost"
                      className="flex flex-row h-8 w-full items-center justify-start gap-2 px-2 text-sky-500"
                    >
                      <LucidePencil size={16} />
                      {t('Edit')}
                    </Button>
                  }
                />

                <ConfirmDialog
                  label={t('Delete Transaction')}
                  desc={t('Are you sure you want to delete this transaction?')}
                  confirmLabel="Delete"
                  onConfirm={handleDeleteTransaction}
                  trigger={
                    <Button
                      variant="ghost"
                      className="flex flex-row h-8 w-full items-center justify-start gap-2 px-2 text-rose-500"
                    >
                      <LucideTrash size={16} />
                      {t('Delete')}
                    </Button>
                  }
                />
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              disabled
              variant="ghost"
              size="icon"
            >
              <Icon
                render={LucideLoaderCircle}
                className="animate-spin"
              />
            </Button>
          )} */}
        </View>
      </View>
    </View>
  )
}
