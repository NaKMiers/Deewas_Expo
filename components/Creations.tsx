import { cn } from '@/lib/utils'
import { BlurView } from 'expo-blur'
import { router } from 'expo-router'
import {
  LucideArrowLeftRight,
  LucideBookCopy,
  LucidePieChart,
  LucideWalletCards,
} from 'lucide-react-native'
import { ReactNode, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { TouchableOpacity, View } from 'react-native'
import Icon from './Icon'
import Text from './Text'
import { Button } from './ui/button'

import { useColorScheme } from '@/lib/useColorScheme'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import React, { useMemo, useRef } from 'react'

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

  // hooks
  const { isDarkColorScheme } = useColorScheme()
  const snapPoints = useMemo(() => ['70%', '100%'], [])

  // refs
  const drawerRef = useRef<BottomSheet>(null)

  const openDrawer = useCallback(() => {
    drawerRef.current?.snapToIndex(0)
  }, [])

  const closeDrawer = useCallback(() => {
    drawerRef.current?.close()
  }, [])

  return (
    <>
      {trigger && (
        <TouchableOpacity
          activeOpacity={0.7}
          className={cn(className, disabled && 'opacity-50')}
          disabled={disabled}
          onPress={openDrawer}
        >
          {trigger}
        </TouchableOpacity>
      )}
      <BottomSheet
        ref={drawerRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backgroundStyle={{
          backgroundColor: 'transparent',
        }}
        handleIndicatorStyle={{
          backgroundColor: isDarkColorScheme ? '#fff' : '#161616',
        }}
        handleStyle={{
          alignItems: 'center',
          justifyContent: 'center',
          height: 32,
          borderTopStartRadius: 16,
          borderTopEndRadius: 16,
          backgroundColor: isDarkColorScheme ? '#161616' : '#fff',
        }}
      >
        <BlurView
          className="flex-1"
          intensity={90}
          tint="prominent"
        >
          <BottomSheetView className="flex-1">
            <View className={cn('mx-auto mt-21 w-full max-w-sm', className)}>
              <View>
                <Text className="text-center text-xl font-semibold text-primary">
                  {t('Welcome to Deewas')}
                </Text>
                <Text className="text-center text-muted-foreground">
                  {t('Take control of your daily finances')}
                </Text>
              </View>

              <View className="mt-6 flex-col gap-6">
                {list.map((item, index) => (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      closeDrawer()
                      router.push(item.route as any)
                    }}
                    className="flex-row items-center justify-center gap-2 rounded-md bg-white px-21 py-21/2 shadow-md"
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
                <View className="mt-3 flex-row items-center justify-end gap-21/2">
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
            </View>
          </BottomSheetView>
        </BlurView>
      </BottomSheet>
    </>
  )
}

export default Creations
