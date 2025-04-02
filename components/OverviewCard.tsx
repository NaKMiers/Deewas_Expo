import { useAppSelector } from '@/hooks/reduxHook'
import { checkTranType, formatCurrency } from '@/lib/string'
import { cn } from '@/lib/utils'
import { TransactionType } from '@/types/type'
import { LucideChevronDown, LucideEye } from 'lucide-react-native'
import { Dispatch, memo, SetStateAction, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, TouchableOpacity, View } from 'react-native'
import Icon from './Icon'
import Text from './Text'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'

interface OverviewCardProps {
  className?: string
}

function OverviewCard({ className = '' }: OverviewCardProps) {
  // hooks
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('overviewCard.' + key)

  // store
  const wallets = useAppSelector(state => state.wallet.wallets).filter(wallet => !wallet.hide)

  // states
  const [collapsed, setCollapsed] = useState<boolean>(false)
  const [showValue, setShowValue] = useState<boolean>(false)

  // values
  const totalIncome = wallets.reduce((acc, wallet) => acc + wallet.income, 0)
  const totalExpense = wallets.reduce((acc, wallet) => acc + wallet.expense, 0)
  const totalSaving = wallets.reduce((acc, wallet) => acc + wallet.saving, 0)
  const totalInvest = wallets.reduce((acc, wallet) => acc + wallet.invest, 0)
  const totalTransfer = wallets.reduce((acc, wallet) => acc + wallet.transfer, 0)
  const totalBalance = totalIncome + totalSaving + totalInvest + totalTransfer - totalExpense

  return (
    <Card
      className={cn(
        'cursor-pointer overflow-hidden rounded-b-lg rounded-t-none border px-21/2 py-1 shadow-sm md:px-21',
        className
      )}
    >
      <Pressable onPress={() => setCollapsed(prev => !prev)}>
        <CardContent className="flex flex-row justify-between px-0 pb-2">
          <View>
            <Item
              title={t('Total Balance')}
              value={totalBalance}
              type="balance"
              isEye
              isShow={showValue}
              toggle={setShowValue}
            />
            <View
              className={cn('trans-300 flex flex-col overflow-hidden')}
              style={{ maxHeight: collapsed ? 300 : 0 }}
            >
              <Item
                title={t('Income')}
                value={totalIncome}
                type="income"
                isShow={showValue}
              />
              <Item
                title={t('Expense')}
                value={totalExpense}
                type="expense"
                isShow={showValue}
              />
              <Item
                title={t('Saving')}
                value={totalSaving}
                type="saving"
                isShow={showValue}
              />
              <Item
                title={t('Invest')}
                value={totalInvest}
                type="invest"
                isShow={showValue}
              />
              <Item
                title={t('Transfer')}
                value={totalTransfer}
                type="transfer"
                isShow={showValue}
              />
            </View>
          </View>

          <View className="fle h-12 flex-row items-center justify-center px-21/2 text-muted-foreground">
            <Icon
              render={LucideChevronDown}
              size={18}
              className={`trans-200 ${collapsed ? 'rotate-180' : ''}`}
            />
          </View>
        </CardContent>
      </Pressable>
    </Card>
  )
}

export default memo(OverviewCard)

interface CardProps {
  title: string
  value: number
  type: TransactionType | 'balance'
  isEye?: boolean
  isShow?: boolean
  toggle?: Dispatch<SetStateAction<boolean>>
  className?: string
}
function Item({ title, type, value, isEye, isShow, toggle, className = '' }: CardProps) {
  // store
  const currency = useAppSelector(state => state.settings.settings?.currency)

  // values
  const { Icon: renderIcon, color, hex } = checkTranType(type)

  return (
    currency && (
      <View className={cn('flex w-full flex-col px-21/2 py-1', className)}>
        <View className="flex flex-row items-center gap-2">
          <Icon
            render={renderIcon}
            size={24}
            className={cn(color)}
            color={hex}
          />
          {isShow ? (
            <Text className="text-xl font-semibold">{formatCurrency(currency, value)}</Text>
          ) : (
            <Text className="text-xl font-bold tracking-widest">*******</Text>
          )}

          {isEye && (
            <Button
              variant="ghost"
              size="icon"
              onPress={e => {
                if (toggle) toggle(prev => !prev)
              }}
            >
              <Icon
                render={LucideEye}
                size={20}
              />
            </Button>
          )}
        </View>
        <Text className={cn('text-sm font-semibold tracking-wide text-muted-foreground')}>{title}</Text>
      </View>
    )
  )
}
