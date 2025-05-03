import { useAppSelector } from '@/hooks/reduxHook'
import { checkTranType, formatCurrency } from '@/lib/string'
import { cn } from '@/lib/utils'
import { BlurView } from 'expo-blur'
import { LucideAsterisk, LucideChevronDown, LucideEye } from 'lucide-react-native'
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
  const wallets = useAppSelector(state => state.wallet.wallets).filter(wallet => !wallet.exclude)

  // states
  const [collapsed, setCollapsed] = useState<boolean>(false)
  const [showValue, setShowValue] = useState<boolean>(false)

  // values
  const totalIncome = wallets.reduce((acc, wallet) => acc + wallet.income, 0)
  const totalExpense = wallets.reduce((acc, wallet) => acc + wallet.expense, 0)
  const totalSaving = wallets.reduce((acc, wallet) => acc + wallet.saving, 0)
  const totalInvest = wallets.reduce((acc, wallet) => acc + wallet.invest, 0)
  const totalBalance = totalIncome + totalSaving + totalInvest - totalExpense

  return (
    <View className="shadow-md">
      <BlurView
        intensity={80}
        className={cn('overflow-hidden rounded-xl border border-primary/10', className)}
      >
        <TouchableWithoutFeedback onPress={() => setCollapsed(!collapsed)}>
          <View className="flex flex-row justify-between p-21/2">
            <View className="flex-1">
              <OverviewItem
                title={t('Total Balance')}
                value={totalBalance}
                type="balance"
                isEye
                isShow={showValue}
                toggle={setShowValue}
              />

              <Collapsible
                collapsed={!collapsed}
                easing="linear"
                duration={50}
              >
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
                </View>
              </Collapsible>
            </View>

            <View className="flex h-12 flex-row items-center justify-center px-21/2">
              <Icon
                render={LucideChevronDown}
                size={22}
                className={cn('trans-200', collapsed && 'rotate-180')}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </BlurView>
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
            <View className="flex flex-row items-center">
              {Array.from({ length: 6 }).map((_, i) => (
                <Icon
                  render={LucideAsterisk}
                  size={18}
                  key={i}
                />
              ))}
            </View>
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
