import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { setSelectedCategory } from '@/lib/reducers/screenReducer'
import { checkTranType, formatCurrency } from '@/lib/string'
import { cn } from '@/lib/utils'
import { router } from 'expo-router'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { TouchableOpacity, View } from 'react-native'
import Text from './Text'
import TxItem from './TxItem'

interface ITransactionCategoryGroupProps {
  category: ICategory
  transactions: IFullTransaction[]
  className?: string
}

function TransactionCategoryGroup({
  category,
  transactions,
  className,
}: ITransactionCategoryGroupProps) {
  // hooks
  const dispatch = useAppDispatch()
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('transactionCategoryGroup.' + key)

  // store
  const currency = useAppSelector(state => state.settings.settings?.currency)

  return (
    <View className={cn('flex-col', className)}>
      <View className="flex-row items-center justify-between gap-2 py-0.5">
        <View className="flex-row items-start gap-2">
          <Text>{category.icon}</Text>
          {currency && (
            <View className="flex-col">
              <Text className="font-semibold">{category.name}</Text>
              <Text className={cn('ml-0.5 mt-0.5 tracking-tight', checkTranType(category.type).color)}>
                {formatCurrency(
                  currency,
                  transactions.filter(t => !t.exclude).reduce((total, tx) => total + tx.amount, 0)
                )}
              </Text>
            </View>
          )}
        </View>

        {/* MARK: New Transaction for category */}
        <TouchableOpacity
          onPress={() => {
            dispatch(setSelectedCategory(category))
            router.push('/create-transaction')
          }}
          activeOpacity={0.7}
          className="h-8 flex-row items-center gap-2 rounded-md border border-primary/10 px-2"
        >
          <Text className="font-semibold">{t('Add Transaction')}</Text>
        </TouchableOpacity>
      </View>

      {/*  MARK: Transactions of category */}
      <View className="my-1.5 pl-2">
        <View className={cn('flex-col gap-1 border-l', checkTranType(category.type).border)}>
          {transactions.map(tx => (
            <View key={tx._id}>
              <TxItem transaction={tx} />
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}

export default memo(TransactionCategoryGroup)
