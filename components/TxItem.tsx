import { Button } from '@/components/ui/button'
import { currencies } from '@/constants/settings'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { refresh, setRefreshing } from '@/lib/reducers/loadReducer'
import { setTransactionToEdit } from '@/lib/reducers/screenReducer'
import { checkTranType, formatCurrency } from '@/lib/string'
import { formatDate, toUTC } from '@/lib/time'
import { cn } from '@/lib/utils'
import { createTransactionApi, deleteTransactionApi } from '@/requests'
import { router } from 'expo-router'
import {
  LucideChevronDown,
  LucideChevronUp,
  LucideEllipsisVertical,
  LucideLayers2,
  LucideMinusCircle,
  LucidePencil,
  LucideTrash,
} from 'lucide-react-native'
import moment from 'moment'
import { memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Platform, TouchableOpacity, View } from 'react-native'
import Toast from 'react-native-toast-message'
import BlurView from './BlurView'
import ConfirmDialog from './dialogs/ConfirmDialog'
import Icon from './Icon'
import Text from './Text'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu'

interface ITxProps {
  transaction: IFullTransaction
  className?: string
}

function TxItem({ transaction, className }: ITxProps) {
  // hooks
  const dispatch = useAppDispatch()
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('txItem.' + key)
  const tSuccess = useCallback((key: string) => translate('success.' + key), [translate])
  const tError = useCallback((key: string) => translate('error.' + key), [translate])

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
      await deleteTransactionApi(transaction._id)

      Toast.show({
        type: 'success',
        text1: tSuccess('Transaction deleted'),
      })

      dispatch(refresh())
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: tError('Failed to delete transaction'),
      })

      console.log(err)
    } finally {
      // stop loading
      setDeleting(false)
      dispatch(setRefreshing(false))
    }
  }, [dispatch, tSuccess, tError, transaction._id])

  // duplicate transaction
  const handleDuplicateTransaction = useCallback(async () => {
    // start loading
    setDuplicating(true)

    try {
      await createTransactionApi({
        ...transaction,
        walletId: transaction.wallet._id,
        categoryId: transaction.category._id,
        date: toUTC(moment().toDate()),
      })

      Toast.show({
        type: 'success',
        text1: tSuccess('Transaction duplicated'),
      })

      dispatch(refresh())
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
  }, [dispatch, tSuccess, tError, transaction])

  const { color, hex } = checkTranType(transaction.type)

  return (
    <View className={cn('w-full flex-row items-center justify-between gap-2 pl-21/2', className)}>
      <Text className="line-clamp-1 max-w-[200px] text-ellipsis font-semibold">{transaction.name}</Text>

      <View className="flex-row items-center gap-1">
        {transaction.exclude && (
          <Icon
            render={LucideMinusCircle}
            size={16}
            color="#f97316"
            style={{ opacity: 0.8 }}
          />
        )}

        {currency && (
          <View className="flex-col items-end">
            <Text className="text-muted-foreground">
              {formatDate(
                moment(transaction.date).toDate(),
                currencies.find(c => c.value === currency)?.locale
              )}
            </Text>
            <View className={cn('flex-row items-center gap-1', checkTranType(transaction.type).color)}>
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
              <Text className={cn('font-semibold', color)}>
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
                <Icon
                  render={LucideEllipsisVertical}
                  size={20}
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="rounded-xl bg-transparent px-0 py-0">
              <BlurView
                className="px-1 py-2"
                tint="prominent"
                intensity={90}
                noBlur
              >
                <ConfirmDialog
                  label={t('Duplicate Transaction')}
                  desc={t('Are you sure you want to duplicate this transaction?')}
                  confirmLabel={t('Duplicate')}
                  cancelLabel={t('Cancel')}
                  onConfirm={handleDuplicateTransaction}
                  trigger={
                    <Button
                      variant="ghost"
                      className="h-8 w-full flex-row items-center justify-start gap-2 px-2"
                    >
                      <Icon
                        render={LucideLayers2}
                        size={16}
                        color="#8b5cf6"
                      />
                      <Text className="font-semibold text-violet-500">{t('Duplicate')}</Text>
                    </Button>
                  }
                />

                {/* MARK: Update Transaction */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    dispatch(setTransactionToEdit(transaction))
                    router.push('/update-transaction')
                  }}
                  className="h-10 w-full flex-row items-center justify-start gap-2 px-5"
                >
                  <Icon
                    render={LucidePencil}
                    size={16}
                    color="#0ea5e9"
                  />
                  <Text className="font-semibold text-sky-500">{t('Edit')}</Text>
                </TouchableOpacity>

                {/* MARK: Delete Transaction */}
                <ConfirmDialog
                  label={t('Delete Transaction')}
                  desc={t('Are you sure you want to delete this transaction?')}
                  confirmLabel={t('Delete')}
                  onConfirm={handleDeleteTransaction}
                  trigger={
                    <Button
                      variant="ghost"
                      className="h-8 w-full flex-row items-center justify-start gap-2 px-2"
                    >
                      <Icon
                        render={LucideTrash}
                        size={16}
                        color="#f43f5e"
                      />
                      <Text className="font-semibold text-rose-500">{t('Delete')}</Text>
                    </Button>
                  }
                />
              </BlurView>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <ActivityIndicator />
        )}
      </View>
    </View>
  )
}

export default memo(TxItem)
