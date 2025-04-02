'use client'

import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { refetching } from '@/lib/reducers/loadReducer'
import { setWallets } from '@/lib/reducers/walletReducer'
import { cn } from '@/lib/utils'
import { IWallet } from '@/types/type'
import { LucideLoaderCircle, LucidePlusSquare, LucideRefreshCw } from 'lucide-react-native'
import { memo, ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dimensions, FlatList, View } from 'react-native'
import CreateWalletDrawer from './dialogs/CreateWalletDrawer'
import Icon from './Icon'
import NoItemsFound from './NoItemsFound'
import Text from './Text'
import { Button } from './ui/button'
import { Skeleton } from './ui/skeleton'
import WalletCard from './WalletCard'

interface WalletProps {
  className?: string
}

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const IPAD_THRESHOLD = 768

function Wallets({ className = '' }: WalletProps) {
  // hooks
  const dispatch = useAppDispatch()
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('wallets.' + key)

  // store
  const { wallets, loading } = useAppSelector(state => state.wallet)

  // states
  const [creating, setCreating] = useState<boolean>(false)

  return (
    <View className={cn(className)}>
      {/* Top */}
      <View className="flex flex-row flex-wrap items-center justify-between gap-2 px-21/2 md:px-21">
        <Text className="text-lg font-bold">{t('Wallets')}</Text>

        <View className="flex flex-row items-center justify-end gap-2">
          {/* Mark: Refresh */}
          <Button
            variant="outline"
            size="icon"
            className="group h-10 w-10"
            onPress={() => dispatch(refetching())}
          >
            <Icon
              render={LucideRefreshCw}
              size={18}
              className="trans-300 group-hover:rotate-180"
            />
          </Button>

          {/* MARK: Create Wallet */}
          <CreateWalletDrawer
            update={wallet => dispatch(setWallets([wallet, ...wallets]))}
            load={setCreating}
            trigger={
              <View className="flex h-10 flex-row items-center gap-2 rounded-lg border border-secondary px-4">
                {!creating ? (
                  <>
                    <Text className="font-semibold">{t('New Wallet')}</Text>
                    <Icon
                      render={LucidePlusSquare}
                      size={18}
                    />
                  </>
                ) : (
                  <Icon
                    render={LucideLoaderCircle}
                    className="animate-spin"
                  />
                )}
              </View>
            }
          />
        </View>
      </View>

      {/* Wallet List */}
      <SkeletonWallets loading={loading}>
        {wallets.length > 0 ? (
          <FlatList
            className="mt-3"
            horizontal
            data={wallets}
            keyExtractor={item => item._id}
            renderItem={({ item: wallet }: { item: IWallet }) => (
              <View
                className="px-21/2"
                style={{ width: SCREEN_WIDTH > IPAD_THRESHOLD ? SCREEN_WIDTH / 2 : SCREEN_WIDTH }}
              >
                <WalletCard wallet={wallet} />
              </View>
            )}
            showsHorizontalScrollIndicator={false}
            snapToInterval={SCREEN_WIDTH}
            decelerationRate="fast"
          />
        ) : (
          <NoItemsFound
            className="mt-1"
            text={t('No wallets found')}
          />
        )}
      </SkeletonWallets>
    </View>
  )
}

export default memo(Wallets)

export function SkeletonWallets({
  loading,
  children,
  className = '',
}: {
  loading: boolean
  children: ReactNode
  className?: string
}) {
  return loading ? (
    <View className={cn('px-21/2', className)}>
      <Skeleton className="loading h-[162px] w-full rounded-lg px-2" />
    </View>
  ) : (
    children
  )
}
