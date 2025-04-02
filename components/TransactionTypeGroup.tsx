import { useAppSelector } from '@/hooks/reduxHook'
import { checkTranType, formatCurrency } from '@/lib/string'
import { cn } from '@/lib/utils'
import { TransactionType } from '@/types/type'
import { memo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TouchableWithoutFeedback, View } from 'react-native'
import Icon from './Icon'
import Text from './Text'
import TransactionCategoryGroup from './TransactionCategoryGroup'

interface ITransactionTypeGroupProps {
  type: TransactionType
  categoryGroups: any[]
  className?: string
}

function TransactionTypeGroup({ type, categoryGroups, className = '' }: ITransactionTypeGroupProps) {
  // hooks
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('transactionTypeGroup.' + key)

  // store
  const currency = useAppSelector(state => state.settings.settings?.currency)

  // states
  const [open, setOpen] = useState<boolean>(true)
  const [hasMounted, setHasMounted] = useState(false)

  // values
  const { Icon: renderIcon, background, border, hex } = checkTranType(type)
  const total = categoryGroups.reduce((total, group) => total + group.category.amount, 0)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  return (
    <View className={cn('flex flex-col gap-21/2 md:mt-21', className)}>
      <View>
        {/* MARK: Type Header */}
        <TouchableWithoutFeedback onPress={() => setOpen(!open)}>
          <View
            className={cn(
              'flex cursor-pointer flex-row items-center gap-21/2 border border-l-[3px] bg-secondary/30 py-1 pl-21/2 pr-2',
              border
            )}
          >
            <View
              className={cn(
                'flex h-8 w-8 flex-row items-center justify-center rounded-md border-2 text-white',
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

            <View className="flex flex-1 flex-col">
              <Text className="text-sm font-semibold capitalize md:text-2xl">{t(type + 's')}</Text>
              <Text className="font-semibold text-muted-foreground">Sorted by date</Text>
            </View>

            <View>
              {currency && (
                <Text className="text-sm font-semibold tracking-tight">
                  {formatCurrency(currency, total)}
                </Text>
              )}
            </View>

            {/* <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6"
                    >
                      <LucideEllipsisVertical />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="max-w-max p-0">
                    <CreateTransactionDrawer
                      type={type}
                      trigger={
                        <Button
                          variant="ghost"
                          className="flex flex-row h-8 w-full items-center justify-start gap-2 px-2 font-normal"
                        >
                          <LucidePlusCircle size={16} />
                          {t('Add Transaction')}
                        </Button>
                      }
                    />
                  </DropdownMenuContent>
                </DropdownMenu> */}
          </View>
        </TouchableWithoutFeedback>

        {/* MARK: Type Body */}
        {open && (
          <View className="mt-1.5 flex flex-col gap-2">
            {categoryGroups.map((catGroup, index) => (
              <TransactionCategoryGroup
                category={catGroup.category}
                transactions={catGroup.transactions}
                key={index}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  )
}

export default memo(TransactionTypeGroup)
