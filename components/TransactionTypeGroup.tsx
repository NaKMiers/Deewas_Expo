import { useAppSelector } from '@/hooks/reduxHook'
import { checkTranType, formatCurrency } from '@/lib/string'
import { cn } from '@/lib/utils'
import { router } from 'expo-router'
import { LucideEllipsisVertical, LucidePlusCircle } from 'lucide-react-native'
import { memo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import Collapsible from 'react-native-collapsible'
import Icon from './Icon'
import Text from './Text'
import TransactionCategoryGroup from './TransactionCategoryGroup'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu'
import { BlurView } from 'expo-blur'

interface ITransactionTypeGroupProps {
  type: TransactionType
  categoryGroups: any[]
  className?: string
}

function TransactionTypeGroup({ type, categoryGroups, className }: ITransactionTypeGroupProps) {
  // hooks
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('transactionTypeGroup.' + key)

  // store
  const currency = useAppSelector(state => state.settings.settings?.currency)

  // states
  const [collapsed, setCollapse] = useState<boolean>(false)
  useEffect(() => setCollapse(true), [])

  // values
  const { Icon: renderIcon, background, border } = checkTranType(type)
  const total = categoryGroups.reduce(
    (total, group) =>
      total +
      (group.transactions as IFullTransaction[])
        .filter(t => !t.exclude)
        .reduce((totalTx, tx) => totalTx + tx.amount, 0),
    0
  )

  return (
    <View className={cn('flex-col gap-21/2', className)}>
      <View>
        {/* MARK: Type Header */}
        <TouchableWithoutFeedback onPress={() => setCollapse(!collapsed)}>
          <View
            className={cn(
              'flex-row items-center gap-21/2 border border-l-[3px] bg-secondary/30 py-1 pl-21/2 pr-2',
              border
            )}
          >
            <View
              className={cn(
                'h-8 w-8 flex-row items-center justify-center rounded-md border-2 text-white',
                background,
                border
              )}
            >
              <Icon
                render={renderIcon}
                size={18}
                color="white"
              />
            </View>

            <View className="flex-1 flex-col">
              <Text className="font-semibold capitalize md:text-2xl">{t(type + 's')}</Text>
              <Text className="text-sm font-semibold text-muted-foreground">Sorted by date</Text>
            </View>

            {currency && (
              <Text className={cn('font-semibold tracking-tight', checkTranType(type).color)}>
                {formatCurrency(currency, total)}
              </Text>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8"
                >
                  <Icon
                    render={LucideEllipsisVertical}
                    size={20}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="max-w-max rounded-xl bg-transparent px-0 py-0">
                <BlurView
                  className="px-1 py-2"
                  tint="prominent"
                  intensity={90}
                >
                  {/* MARK: Create Transaction */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => router.push(`/create-transaction?type=${type}`)}
                    className="h-10 w-full flex-row items-center justify-start gap-2 px-4 font-normal"
                  >
                    <Icon
                      render={LucidePlusCircle}
                      size={18}
                    />
                    <Text className="font-semibold">{t('Add Transaction')}</Text>
                  </TouchableOpacity>
                </BlurView>
              </DropdownMenuContent>
            </DropdownMenu>
          </View>
        </TouchableWithoutFeedback>

        {/* MARK: Type Body */}
        <Collapsible
          collapsed={!collapsed}
          align="top"
          duration={200}
        >
          <View className="mt-1.5 flex-col gap-2">
            {categoryGroups.map((catGroup, index) => (
              <TransactionCategoryGroup
                category={catGroup.category}
                transactions={catGroup.transactions}
                key={index}
              />
            ))}
          </View>
        </Collapsible>
      </View>
    </View>
  )
}

export default memo(TransactionTypeGroup)
