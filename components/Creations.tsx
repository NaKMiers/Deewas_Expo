import { useAppDispatch } from '@/hooks/reduxHook'
import { addBudget } from '@/lib/reducers/budgetReducer'
import { addCategory } from '@/lib/reducers/categoryReduce'
import { refresh } from '@/lib/reducers/loadReducer'
import { addTransaction } from '@/lib/reducers/transactionReducer'
import { addWallet } from '@/lib/reducers/walletReducer'
import { cn } from '@/lib/utils'
import {
  LucideArrowLeftRight,
  LucideBookCopy,
  LucidePieChart,
  LucideWalletCards,
} from 'lucide-react-native'
import { ReactNode, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { TouchableOpacity, View } from 'react-native'
import CreateBudgetDrawer from './dialogs/CreateBudgetDrawer'
import CreateCategoryDrawer from './dialogs/CreateCategoryDrawer'
import CreateTransactionDrawer from './dialogs/CreateTransactionDrawer'
import CreateWalletDrawer from './dialogs/CreateWalletDrawer'
import Icon from './Icon'
import { useDrawer } from './providers/DrawerProvider'
import Text from './Text'
import { Button } from './ui/button'
import { Separator } from './ui/separator'

interface ICreationsProps {
  className?: string
}

function Creations({ className }: ICreationsProps) {
  // hooks
  // hooks
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('navbar.' + key)
  const tSuccess = (key: string) => translate('success.' + key)
  const tError = (key: string) => translate('error.' + key)
  const { closeDrawer0: closeDrawer } = useDrawer()
  const dispatch = useAppDispatch()

  return (
    <View className={cn('mx-auto mt-21 w-full max-w-sm', className)}>
      <View>
        <Text className="text-center text-xl font-semibold text-primary">{t('Welcome to Deewas')}</Text>
        <Text className="text-center text-muted-foreground">
          {t('Take control of your daily finances')}
        </Text>
      </View>

      <View className="mt-6 flex flex-col gap-6">
        <CreateTransactionDrawer
          update={(transaction: IFullTransaction) => dispatch(addTransaction(transaction))}
          refresh={() => dispatch(refresh())}
          trigger={
            <View className="flex flex-row items-center justify-center gap-2 rounded-md bg-secondary px-21 py-21/2 shadow-md">
              <Icon
                render={LucideArrowLeftRight}
                size={20}
              />
              <Text className="font-semibold">{t('Create Transaction')}</Text>
            </View>
          }
          reach={3}
        />

        <CreateBudgetDrawer
          update={(budget: IFullBudget) => dispatch(addBudget(budget))}
          refresh={() => dispatch(refresh())}
          trigger={
            <View className="flex flex-row items-center justify-center gap-2 rounded-md bg-secondary px-21 py-21/2 shadow-md">
              <Icon
                render={LucidePieChart}
                size={20}
              />
              <Text className="font-semibold">{t('Create Budget')}</Text>
            </View>
          }
          reach={1}
        />

        <CreateWalletDrawer
          update={(wallet: IWallet) => dispatch(addWallet(wallet))}
          refresh={() => dispatch(refresh())}
          trigger={
            <View className="flex flex-row items-center justify-center gap-2 rounded-md bg-secondary px-21 py-21/2 shadow-md">
              <Icon
                render={LucideWalletCards}
                size={20}
              />
              <Text className="font-semibold">{t('Create Wallet')}</Text>
            </View>
          }
        />

        <CreateCategoryDrawer
          update={(category: ICategory) => dispatch(addCategory(category))}
          refresh={() => dispatch(refresh())}
          trigger={
            <View className="flex flex-row items-center justify-center gap-2 rounded-md bg-secondary px-21 py-21/2 shadow-md">
              <Icon
                render={LucideBookCopy}
                size={20}
              />
              <Text className="font-semibold">{t('Create Category')}</Text>
            </View>
          }
        />
      </View>

      <View className="mb-21 mt-6 px-0">
        <View className="mt-3 flex flex-row items-center justify-end gap-21/2">
          <View>
            <Button
              variant="default"
              className="h-10 rounded-md px-21/2"
              onPress={closeDrawer}
            >
              <Text className="font-semibold text-secondary">{t('Cancel')}</Text>
            </Button>
          </View>
        </View>
      </View>

      <Separator className="my-8 h-0" />
    </View>
  )
}

interface NodeProps extends ICreationsProps {
  disabled?: boolean
  trigger: ReactNode
  open?: boolean
  onClose?: () => void
  reach?: number
  className?: string
}

function Node({ open, onClose, reach, disabled, trigger, className, ...props }: NodeProps) {
  const { openDrawer0: openDrawer, open0: openState, reach0: defaultReach } = useDrawer()
  const r = reach || defaultReach

  useEffect(() => {
    if (open === true) openDrawer(<Creations {...props} />, r)
  }, [open])

  useEffect(() => {
    if (onClose && openState) onClose()
  }, [openState, onClose])

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      className={cn(className, disabled && 'opacity-50')}
      disabled={disabled}
      onPress={() => openDrawer(<Creations {...props} />, r)}
    >
      {trigger}
    </TouchableOpacity>
  )
}

export default Node
