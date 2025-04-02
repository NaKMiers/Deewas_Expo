import { Button } from '@/components/ui/button'
import { currencies } from '@/constants/settings'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { refetching } from '@/lib/reducers/loadReducer'
import { checkTranType, formatCurrency } from '@/lib/string'
import { formatDate, toUTC } from '@/lib/time'
import { cn } from '@/lib/utils'
import { createTransactionApi, deleteTransactionApi } from '@/requests'
import { ICategory, IFullTransaction } from '@/types/type'
import {
  LucideChevronDown,
  LucideChevronUp,
  LucideEllipsisVertical,
  LucideLoaderCircle,
} from 'lucide-react-native'
import moment from 'moment-timezone'
import { memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import Toast from 'react-native-toast-message'
import Icon from './Icon'
import Text from './Text'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu'

interface ITransactionCategoryGroupProps {
  category: ICategory
  transactions: IFullTransaction[]
  className?: string
}

function TransactionCategoryGroup({
  category,
  transactions,
  className = '',
}: ITransactionCategoryGroupProps) {
  // hooks
  const dispatch = useAppDispatch()
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('transactionCategoryGroup.' + key)

  // store
  const currency = useAppSelector(state => state.settings.settings?.currency)

  return (
    <View className={cn('flex flex-col', className)}>
      <View className="flex flex-row items-center justify-between gap-2 py-0.5">
        <View className="flex flex-row items-start gap-2">
          <Text>{category.icon}</Text>
          {currency && (
            <View className="flex flex-col">
              <Text className="text-sm font-semibold">{category.name}</Text>
              <Text
                className={cn('-mb-1 -mt-0.5 ml-0.5 tracking-tight', checkTranType(category.type).color)}
              >
                {formatCurrency(currency, category.amount)}
              </Text>
            </View>
          )}
        </View>

        {/* MARK: New Transaction for category */}
        {/* <CreateTransactionDrawer
          initCategory={category}
          update={(transaction: IFullTransaction) => dispatch(addTransaction(transaction))}
          trigger={
            <Button
              variant="outline"
              className="flex flex-row h-7 items-center gap-1.5 rounded-md px-2 "
            >
              <LucidePlusSquare />
              {t('Add Transaction')}
            </Button>
          }
        /> */}
      </View>

      {/*  MARK: Transactions of category */}
      <View className="my-1.5 pl-2">
        <View className="flex flex-col gap-0 border-l">
          {transactions.map((tx, index) => (
            <View key={tx._id}>
              <TransactionItem transaction={tx} />
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}

export default memo(TransactionCategoryGroup)

interface ITransactionProps {
  transaction: IFullTransaction
  className?: string
}

function TransactionItem({ transaction, className = '' }: ITransactionProps) {
  // hooks
  const dispatch = useAppDispatch()
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('transactionItem.' + key)
  const tSuccess = (key: string) => translate('success.' + key)
  const tError = (key: string) => translate('error.' + key)

  // store
  const currency = useAppSelector(state => state.settings.settings?.currency)

  // states
  const [deleting, setDeleting] = useState<boolean>(false)
  const [duplicating, setDuplicating] = useState<boolean>(false)

  // delete transaction
  const handleDeleteTransaction = useCallback(async () => {
    // start loading
    setDeleting(true)

    try {
      const { transaction: tx, message } = await deleteTransactionApi(transaction._id)

      Toast.show({
        type: 'success',
        text1: tSuccess('Transaction deleted'),
      })

      dispatch(refetching())
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: tError('Failed to delete transaction'),
      })

      console.log(err)
    } finally {
      // stop loading
      setDeleting(false)
    }
  }, [dispatch, transaction._id, t])

  // duplicate transaction
  const handleDuplicateTransaction = useCallback(async () => {
    // start loading
    setDuplicating(true)

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

      dispatch(refetching())
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: tError('Failed to duplicate transaction'),
      })
      console.log(err)
    } finally {
      // stop loading
      setDuplicating(false)
    }
  }, [dispatch, transaction, t])

  return (
    <View className={cn('flex w-full flex-row items-center justify-between gap-2 pl-2', className)}>
      <Text className="text-sm font-semibold">{transaction.name}</Text>

      <View className="flex flex-row items-center gap-1">
        {currency && (
          <View className="flex flex-col items-end">
            <Text className="text-muted-foreground">
              {formatDate(
                moment(transaction.date).toDate(),
                currencies.find(c => c.value === currency)?.locale
              )}
            </Text>
            <View
              className={cn('flex flex-row items-center gap-1', checkTranType(transaction.type).color)}
            >
              {transaction.type === 'expense' ? (
                <Icon
                  render={LucideChevronDown}
                  size={16}
                />
              ) : (
                <Icon
                  render={LucideChevronUp}
                  size={16}
                />
              )}
              <Text className="text-sm font-semibold">
                {formatCurrency(currency, transaction.amount)}
              </Text>
            </View>
          </View>
        )}

        {!deleting && !duplicating ? (
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
              {/* <ConfirmDialog
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
                update={(transaction: IFullTransaction) => dispatch(updateTransaction(transaction))}
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
                confirmLabel={t('Delete')}
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
              /> */}
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
        )}
      </View>
    </View>
  )
}
