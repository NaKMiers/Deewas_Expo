import { cn } from '@/lib/utils'
import { BlurView } from 'expo-blur'
import { router } from 'expo-router'
import {
  LucideArrowLeftRight,
  LucideBookCopy,
  LucidePieChart,
  LucideWalletCards,
} from 'lucide-react-native'
import { ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, TouchableOpacity, View } from 'react-native'
import Icon from './Icon'
import Text from './Text'
import { Button } from './ui/button'
import { Separator } from './ui/separator'

interface ICreationsProps {
  disabled?: boolean
  trigger: ReactNode
  open?: boolean
  onClose?: () => void
  className?: string
}

const list = [
  {
    name: 'Create Transaction',
    icon: LucideArrowLeftRight,
    route: '/create-transaction',
  },
  {
    name: 'Create Budget',
    icon: LucidePieChart,
    route: '/create-budget',
  },
  {
    name: 'Create Wallet',
    icon: LucideWalletCards,
    route: '/create-wallet',
  },
  {
    name: 'Create Category',
    icon: LucideBookCopy,
    route: '/create-category',
  },
]

function Creations({ disabled, trigger, className }: ICreationsProps) {
  // hooks
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('navbar.' + key)

  // states
  const [visible, setVisible] = useState<boolean>(false)

  return (
    <>
      {trigger && (
        <TouchableOpacity
          activeOpacity={0.7}
          className={cn(className, disabled && 'opacity-50')}
          disabled={disabled}
          onPress={() => setVisible(true)}
        >
          {trigger}
        </TouchableOpacity>
      )}
      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={() => {
          console.log('Modal has been closed.')
          setVisible(false)
        }}
      >
        <View className="flex-1">
          <TouchableOpacity
            className="h-full flex-1"
            activeOpacity={1}
            onPress={() => setVisible(false)}
          />
          <BlurView
            intensity={90}
            tint="prominent"
            className="overflow-hidden rounded-t-xl"
          >
            <View className="items-center justify-center bg-primary py-21/2">
              <View className="h-1.5 w-12 rounded-lg bg-secondary" />
            </View>
            <View className={cn('mx-auto mt-21 w-full max-w-sm', className)}>
              <View>
                <Text className="text-center text-xl font-semibold text-primary">
                  {t('Welcome to Deewas')}
                </Text>
                <Text className="text-center text-muted-foreground">
                  {t('Take control of your daily finances')}
                </Text>
              </View>

              <View className="mt-6 flex flex-col gap-6">
                {list.map((item, index) => (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      setVisible(false)
                      router.push(item.route as any)
                    }}
                    className="flex flex-row items-center justify-center gap-2 rounded-md bg-white px-21 py-21/2 shadow-md"
                    key={index}
                  >
                    <Icon
                      render={item.icon}
                      size={20}
                      color="#262626"
                    />
                    <Text className="font-semibold text-neutral-800">{t(item.name)}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* MARK: Cancel */}
              <View className="mb-21 mt-6 px-0">
                <View className="mt-3 flex flex-row items-center justify-end gap-21/2">
                  <View>
                    <Button
                      variant="default"
                      className="h-10 rounded-md px-21/2"
                      onPress={() => setVisible(false)}
                    >
                      <Text className="font-semibold text-secondary">{t('Cancel')}</Text>
                    </Button>
                  </View>
                </View>
              </View>

              <Separator className="my-8 h-0" />
            </View>
          </BlurView>
        </View>
      </Modal>
    </>
  )
}

export default Creations
