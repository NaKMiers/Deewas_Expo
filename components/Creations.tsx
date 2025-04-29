import { cn } from '@/lib/utils'
import { router } from 'expo-router'
import {
  LucideArrowLeftRight,
  LucideBookCopy,
  LucidePieChart,
  LucideWalletCards,
} from 'lucide-react-native'
import { ReactNode, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { TouchableOpacity, View } from 'react-native'
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
  const { closeDrawer } = useDrawer()

  return (
    <View className={cn('mx-auto mt-21 w-full max-w-sm', className)}>
      <View>
        <Text className="text-center text-xl font-semibold text-primary">{t('Welcome to Deewas')}</Text>
        <Text className="text-center text-muted-foreground">
          {t('Take control of your daily finances')}
        </Text>
      </View>

      <View className="mt-6 flex flex-col gap-6">
        {/* MARK: Create Transaction */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/create-transaction')}
          className="flex flex-row items-center justify-center gap-2 rounded-md bg-white px-21 py-21/2 shadow-md"
        >
          <Icon
            render={LucideArrowLeftRight}
            size={20}
            color="#262626"
          />
          <Text className="font-semibold text-neutral-800">{t('Create Transaction')}</Text>
        </TouchableOpacity>

        {/* MARK: Create Budget */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/create-budget')}
          className="flex flex-row items-center justify-center gap-2 rounded-md bg-white px-21 py-21/2 shadow-md"
        >
          <Icon
            render={LucidePieChart}
            size={20}
            color="#262626"
          />
          <Text className="font-semibold text-neutral-800">{t('Create Budget')}</Text>
        </TouchableOpacity>

        {/* MARK: Create Wallet */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/create-wallet')}
          className="flex flex-row items-center justify-center gap-2 rounded-md bg-white px-21 py-21/2 shadow-md"
        >
          <Icon
            render={LucideWalletCards}
            size={20}
            color="#262626"
          />
          <Text className="font-semibold text-neutral-800">{t('Create Wallet')}</Text>
        </TouchableOpacity>

        {/* MARK: Create Category */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/create-category')}
          className="flex flex-row items-center justify-center gap-2 rounded-md bg-white px-21 py-21/2 shadow-md"
        >
          <Icon
            render={LucideBookCopy}
            size={20}
            color="#262626"
          />
          <Text className="font-semibold text-neutral-800">{t('Create Category')}</Text>
        </TouchableOpacity>
      </View>

      {/* MARK: Cancel */}
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
  const { openDrawer, open: openState, reach: defaultReach } = useDrawer()
  const r = reach || defaultReach

  useEffect(() => {
    if (open === true) openDrawer(<Creations {...props} />, r)
  }, [openDrawer, open, props, r])

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
