import { IPAD_THRESHOLD } from '@/constants'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { setStep } from '@/lib/reducers/tutorialReducer'
import { cn } from '@/lib/utils'
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet'
import { router } from 'expo-router'
import { LucidePlusSquare } from 'lucide-react-native'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, TouchableOpacity, View } from 'react-native'
import Icon from './Icon'
import NoItemsFound from './NoItemsFound'
import Text from './Text'
import { Skeleton } from './ui/skeleton'
import WalletCard from './WalletCard'

interface WalletProps {
  className?: string
}

function Wallets({ className }: WalletProps) {
  // hooks
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('wallets.' + key)
  const dispatch = useAppDispatch()

  // store
  const { wallets, loading } = useAppSelector(state => state.wallet)
  const { inProgress, step } = useAppSelector(state => state.tutorial)

  // values
  const isLarge = SCREEN_WIDTH > IPAD_THRESHOLD

  return (
    <>
      {inProgress && step === 1 && <View className="absolute left-0 top-0 z-10 h-screen w-screen" />}

      <View className={cn('flex-shrink-0', className)}>
        {/* Top */}
        <View className="mb-21/2 flex-row flex-wrap items-center justify-between gap-2">
          <Text className="pl-1 text-xl font-bold">{t('Wallets')}</Text>

          <View className="flex-row items-center justify-end gap-2">
            {/* MARK: Create Wallet */}
            <View className={cn('z-10', inProgress && step === 1 && 'border-2 border-sky-500 p-1')}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  router.push('/create-wallet')
                  inProgress && step === 1 && dispatch(setStep(2))
                }}
                className="h-10 flex-row items-center gap-2 rounded-md border border-primary bg-primary px-3"
              >
                <Text className="font-semibold text-secondary">{t('New Wallet')}</Text>
                <Icon
                  render={LucidePlusSquare}
                  size={18}
                  reverse
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* MARK: Wallets */}
        {!loading ? (
          wallets.length > 0 ? (
            <View className="flex-1 flex-shrink-0">
              <FlatList
                horizontal
                data={wallets}
                keyExtractor={item => item._id}
                showsHorizontalScrollIndicator={false}
                snapToInterval={isLarge ? (SCREEN_WIDTH - 21) / 2 : SCREEN_WIDTH}
                decelerationRate="fast"
                className="-mx-21/2"
                renderItem={({ item: wallet }: { item: IWallet }) => (
                  <View
                    className="px-21/2"
                    style={{
                      width: isLarge ? (SCREEN_WIDTH - 21) / 2 : SCREEN_WIDTH,
                    }}
                  >
                    <WalletCard wallet={wallet} />
                  </View>
                )}
              />
            </View>
          ) : (
            <NoItemsFound
              className="mt-1"
              text={t('No wallets found')}
            />
          )
        ) : (
          <Skeleton className="loading h-[150px] w-full rounded-lg px-2" />
        )}
      </View>
    </>
  )
}

export default memo(Wallets)
