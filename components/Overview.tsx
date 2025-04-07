import { useAppSelector } from '@/hooks/reduxHook'
import { checkTranType, formatCurrency } from '@/lib/string'
import { cn } from '@/lib/utils'
import { LucideChevronDown, LucideEye } from 'lucide-react-native'
import { Dispatch, memo, SetStateAction, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TouchableWithoutFeedback, View } from 'react-native'
import Collapsible from 'react-native-collapsible'
import Icon from './Icon'
import Text from './Text'
import { Button } from './ui/button'

interface OverviewProps {
  className?: string
}

// MARK: Overview
function Overview({ className }: OverviewProps) {
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
    <View className={cn('rounded-lg bg-secondary shadow-md', className)}>
      <TouchableWithoutFeedback onPress={() => setCollapsed(!collapsed)}>
        <View className="flex flex-row justify-between p-21/2">
          <View>
            <OverviewItem
              title={t('Total Balance')}
              value={totalBalance}
              type="balance"
              isEye
              isShow={showValue}
              toggle={setShowValue}
            />

            <Collapsible collapsed={!collapsed}>
              <View className="flex flex-col">
                <OverviewItem
                  title={t('Income')}
                  value={totalIncome}
                  type="income"
                  isShow={showValue}
                />
                <OverviewItem
                  title={t('Expense')}
                  value={totalExpense}
                  type="expense"
                  isShow={showValue}
                />
                <OverviewItem
                  title={t('Saving')}
                  value={totalSaving}
                  type="saving"
                  isShow={showValue}
                />
                <OverviewItem
                  title={t('Invest')}
                  value={totalInvest}
                  type="invest"
                  isShow={showValue}
                />
                <OverviewItem
                  title={t('Transfer')}
                  value={totalTransfer}
                  type="transfer"
                  isShow={showValue}
                />
              </View>
            </Collapsible>
          </View>

          <View className="flex h-12 flex-row items-center justify-center px-21/2">
            <Icon
              render={LucideChevronDown}
              size={22}
              className={`trans-200 ${collapsed ? 'rotate-180' : ''}`}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </View>
  )
}

export default memo(Overview)

// MARK: Overview Item
interface OverviewItemProps {
  title: string
  value: number
  type: TransactionType | 'balance'
  isEye?: boolean
  isShow?: boolean
  toggle?: Dispatch<SetStateAction<boolean>>
  className?: string
}
function OverviewItem({ title, type, value, isEye, isShow, toggle, className }: OverviewItemProps) {
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
            <Text className="text-2xl font-bold leading-7 tracking-widest">*******</Text>
          )}

          {isEye && (
            <Button
              variant="ghost"
              size="icon"
              onPress={() => toggle && toggle(prev => !prev)}
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
